import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Tag,
  Image,
  Calendar,
  Percent,
  DollarSign,
  Save,
  CheckCircle2,
  Upload,
  X
} from "lucide-react";

export default function CriarPromocao() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    desconto_percentual: "",
    desconto_valor: "",
    imagem_url: "",
    data_inicio: "",
    data_fim: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const suppliers = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        if (suppliers.length === 0) {
          toast.error("Você precisa ter um cadastro de fornecedor");
          navigate(createPageUrl("CadastroFornecedor"));
          return;
        }
        setSupplier(suppliers[0]);
      } catch (error) {
        toast.error("Erro ao carregar dados");
      }
      setLoading(false);
    };
    loadData();
  }, [navigate]);

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange("imagem_url", file_url);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSalvar = async () => {
    if (!formData.titulo.trim()) {
      toast.error("Preencha o título da promoção");
      return;
    }
    if (!formData.descricao.trim()) {
      toast.error("Preencha a descrição");
      return;
    }
    if (!formData.categoria) {
      toast.error("Selecione uma categoria");
      return;
    }
    if (!formData.desconto_percentual && !formData.desconto_valor) {
      toast.error("Defina um desconto (percentual ou valor fixo)");
      return;
    }
    if (!formData.data_inicio || !formData.data_fim) {
      toast.error("Defina as datas de início e fim");
      return;
    }

    const dataInicio = new Date(formData.data_inicio);
    const dataFim = new Date(formData.data_fim);
    if (dataFim <= dataInicio) {
      toast.error("Data de fim deve ser posterior à data de início");
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Promotion.create({
        supplier_id: supplier.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        categoria: formData.categoria,
        desconto_percentual: formData.desconto_percentual ? parseFloat(formData.desconto_percentual) : null,
        desconto_valor: formData.desconto_valor ? parseFloat(formData.desconto_valor) : null,
        imagem_url: formData.imagem_url,
        data_inicio: new Date(formData.data_inicio).toISOString(),
        data_fim: new Date(formData.data_fim).toISOString(),
        status: "ATIVO"
      });

      toast.success("✅ Promoção criada com sucesso!");
      navigate(createPageUrl("MinhasPromocoes"));
    } catch (error) {
      toast.error("❌ Erro ao criar promoção: " + error.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden pb-32">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <Tag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Criar Promoção</h1>
              <p className="text-gray-400">Ofereça descontos exclusivos aos profissionais</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl p-6 md:p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Título da Promoção *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
              placeholder="Ex: 50% OFF em Equipamentos Odontológicos"
              maxLength={255}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Descrição *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descreva os detalhes da promoção, condições, produtos incluídos..."
              className="w-full min-h-[120px] px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Categoria *</label>
            <select
              value={formData.categoria}
              onChange={(e) => handleInputChange("categoria", e.target.value)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none [&>option]:bg-[#13132B]"
            >
              <option value="">Selecione</option>
              <option value="EQUIPAMENTOS">Equipamentos</option>
              <option value="MATERIAIS">Materiais</option>
              <option value="CURSOS">Cursos</option>
              <option value="SERVICOS">Serviços</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                <Percent className="w-4 h-4 text-brand-primary" />
                Desconto Percentual
              </label>
              <input
                type="number"
                value={formData.desconto_percentual}
                onChange={(e) => handleInputChange("desconto_percentual", e.target.value)}
                placeholder="Ex: 50"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Ou defina um valor fixo abaixo</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Desconto em Reais
              </label>
              <input
                type="number"
                value={formData.desconto_valor}
                onChange={(e) => handleInputChange("desconto_valor", e.target.value)}
                placeholder="Ex: 100.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Valor fixo de desconto</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Data de Início *
              </label>
              <input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => handleInputChange("data_inicio", e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Data de Fim *
              </label>
              <input
                type="date"
                value={formData.data_fim}
                onChange={(e) => handleInputChange("data_fim", e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-400" />
              Imagem da Promoção (opcional)
            </label>
            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 hover:border-brand-primary transition-all">
              {formData.imagem_url ? (
                <div className="space-y-4">
                  <img
                    src={formData.imagem_url}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg shadow-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange("imagem_url", "")}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remover Imagem
                  </button>
                </div>
              ) : (
                <div>
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-2"></div>
                      <p className="text-gray-400">Enviando imagem...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <label className="cursor-pointer">
                        <span className="text-brand-primary hover:text-brand-light font-medium transition-colors">Clique para fazer upload</span>
                        <span className="text-gray-400 ml-1">ou arraste e solte</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG até 5MB</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-bold mb-1 text-blue-100">💡 Dica:</p>
                <p>
                  Promoções atrativas aumentam sua visibilidade na plataforma.
                  Use imagens de qualidade e descrições claras.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a1a] border-t border-white/10 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="w-full py-5 bg-gradient-to-r from-brand-primary to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:shadow-brand-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Criando...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Criar Promoção
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}