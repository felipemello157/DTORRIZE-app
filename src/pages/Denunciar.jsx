import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

const categorias = [
  { value: "EMPREGO", label: "Vaga de emprego" },
  { value: "CLINICA", label: "Clínica/Consultório" },
  { value: "CADASTRO", label: "Cadastro falso" },
  { value: "MARKETPLACE", label: "Produto do marketplace" },
  { value: "FREELANCE", label: "Trabalho freelance" },
  { value: "DOUTORIZZE", label: "Problema na plataforma" },
  { value: "FORNECEDOR", label: "Fornecedor" },
  { value: "GRUPO_LINK", label: "Link/grupo suspeito" },
  { value: "CREDITO", label: "Solicitação de crédito" }
];

const tiposAlvo = [
  { value: "PROFISSIONAL", label: "Profissional (Dentista/Médico)" },
  { value: "CLINICA", label: "Clínica/Consultório" },
  { value: "VAGA", label: "Vaga de emprego" },
  { value: "MARKETPLACE", label: "Produto do marketplace" },
  { value: "USUARIO", label: "Outro usuário" }
];

export default function Denunciar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    categoria: "",
    tipo_alvo: searchParams.get("tipo") || "",
    alvo_id: searchParams.get("id") || "",
    motivo: "",
    evidencia_url: "",
    aceito_termos: false
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const denunciaMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Report.create({
        denunciante_id: user.id,
        categoria: data.categoria,
        tipo_alvo: data.tipo_alvo,
        alvo_id: data.alvo_id,
        motivo: data.motivo,
        evidencia_url: data.evidencia_url || undefined,
        status: "PENDENTE"
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (error) => {
      toast.error("Erro ao enviar denúncia: " + error.message);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, evidencia_url: file_url });
      toast.success("✅ Imagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações
    if (!formData.categoria) {
      toast.error("Selecione uma categoria");
      return;
    }

    if (!formData.tipo_alvo) {
      toast.error("Selecione o que você quer denunciar");
      return;
    }

    if (!formData.alvo_id) {
      toast.error("Informe o ID do item denunciado");
      return;
    }

    if (formData.motivo.length < 20) {
      toast.error("O motivo deve ter pelo menos 20 caracteres");
      return;
    }

    if (!formData.aceito_termos) {
      toast.error("Você precisa declarar que as informações são verdadeiras");
      return;
    }

    denunciaMutation.mutate(formData);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6 text-white relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] opacity-20"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-8 max-w-md w-full text-center relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Denúncia enviada com sucesso!
          </h2>
          <p className="text-gray-400 mb-6">
            Nossa equipe analisará em até 48 horas.<br />
            Você receberá uma notificação com o resultado.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            Voltar
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 pb-24 text-white overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-6 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Fazer Denúncia</h1>
              <p className="text-gray-400">Reporte um problema ou conteúdo inadequado</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 space-y-6"
        >
          {/* Categoria */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Categoria da Denúncia *
            </label>
            <div className="relative">
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none appearance-none"
              >
                <option value="" className="bg-[#0a0a1a]">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0a0a1a]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Alvo */}
          {!searchParams.get("tipo") && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                O que você quer denunciar? *
              </label>
              <div className="relative">
                <select
                  value={formData.tipo_alvo}
                  onChange={(e) => setFormData({ ...formData, tipo_alvo: e.target.value })}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none appearance-none"
                >
                  <option value="" className="bg-[#0a0a1a]">Selecione o tipo</option>
                  {tiposAlvo.map((tipo) => (
                    <option key={tipo.value} value={tipo.value} className="bg-[#0a0a1a]">
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ID do Item (se não veio por params) */}
          {!searchParams.get("id") && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                ID do Item *
              </label>
              <input
                type="text"
                value={formData.alvo_id}
                onChange={(e) => setFormData({ ...formData, alvo_id: e.target.value })}
                placeholder="Cole o ID do item que deseja denunciar"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none placeholder:text-gray-600"
              />
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Motivo da Denúncia * (mínimo 20 caracteres)
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Descreva detalhadamente o motivo da sua denúncia..."
              rows={6}
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none resize-none placeholder:text-gray-600"
            />
            <p className="text-sm text-gray-500 mt-2 text-right">
              {formData.motivo.length} / 20 caracteres mínimos
            </p>
          </div>

          {/* Upload de Evidência */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Anexar Evidência (Opcional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="evidencia-upload"
              />
              <label
                htmlFor="evidencia-upload"
                className={`flex items-center justify-center gap-3 w-full px-4 py-6 border border-dashed border-white/20 bg-[#0a0a1a] rounded-xl cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-all ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    <span className="text-gray-400 font-medium">Enviando imagem...</span>
                  </>
                ) : formData.evidencia_url ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <span className="text-green-500 font-medium">Imagem anexada ✓</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="text-gray-400 font-medium">
                      Clique para anexar print ou foto (máx. 5MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Checkbox Termos */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aceito_termos}
                onChange={(e) => setFormData({ ...formData, aceito_termos: e.target.checked })}
                className="mt-1 w-5 h-5 text-red-500 bg-[#0a0a1a] border-white/20 rounded focus:ring-red-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">
                <strong className="text-white">Declaro que as informações são verdadeiras</strong> e estou ciente de que denúncias falsas podem resultar em suspensão da minha conta.
              </span>
            </label>
          </div>

          {/* Aviso */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-bold mb-1 text-white">Como funciona?</p>
                <p>
                  Nossa equipe analisará sua denúncia em até 48 horas. Você será notificado sobre o resultado da análise. Todas as denúncias são tratadas com confidencialidade.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 border border-white/10 text-gray-300 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={denunciaMutation.isPending}
              className="flex-1 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {denunciaMutation.isPending ? "Enviando..." : "Enviar Denúncia"}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}