import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FlaskConical,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  MapPin,
  Building2,
  FileText,
  Clock,
  DollarSign
} from "lucide-react";

const TIPOS_LABORATORIO = [
  { value: "PROTESE_DENTARIA", label: "Prótese Dentária" },
  { value: "ANALISES_CLINICAS", label: "Análises Clínicas" },
  { value: "IMAGEM", label: "Diagnóstico por Imagem" },
  { value: "PATOLOGIA", label: "Patologia" },
  { value: "OUTRO", label: "Outro" }
];

export default function CadastroLaboratorio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [etapa, setEtapa] = useState(1);
  const totalEtapas = 5;

  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    tipo_laboratorio: "",
    categoria: "ODONTOLOGIA",
    email: "",
    whatsapp: "",
    telefone: "",
    site: "",
    instagram: "",
    nome_responsavel: "",
    registro_responsavel: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cidades_atendidas: [],
    descricao: "",
    servicos_oferecidos: [],
    horarios_atendimento: {
      segunda: "",
      terca: "",
      quarta: "",
      quinta: "",
      sexta: "",
      sabado: "",
      domingo: ""
    },
    prazo_entrega: {
      minimo_dias: "",
      maximo_dias: "",
      observacoes: ""
    }
  });

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const cadastrarMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.Laboratorio.create({
        ...dados,
        user_id: user.id,
        status_cadastro: "EM_ANALISE"
      });
    },
    onSuccess: () => {
      toast.success("✅ Cadastro enviado! Aguarde aprovação.");
      navigate(createPageUrl("CadastroSucesso") + "?tipo=Laboratorio");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar: " + error.message);
    }
  });

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleHorarioChange = (dia, valor) => {
    setFormData(prev => ({
      ...prev,
      horarios_atendimento: { ...prev.horarios_atendimento, [dia]: valor }
    }));
  };

  const handlePrazoChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      prazo_entrega: { ...prev.prazo_entrega, [campo]: valor }
    }));
  };

  const validarEtapa = () => {
    switch (etapa) {
      case 1:
        if (!formData.razao_social || !formData.nome_fantasia || !formData.cnpj || !formData.tipo_laboratorio) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 2:
        if (!formData.email || !formData.whatsapp || !formData.nome_responsavel) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 3:
        if (!formData.cidade || !formData.uf || !formData.endereco) {
          toast.error("Preencha o endereço completo");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const proximaEtapa = () => {
    if (validarEtapa()) {
      setEtapa(prev => Math.min(prev + 1, totalEtapas));
    }
  };

  const finalizar = () => {
    if (!validarEtapa()) return;
    cadastrarMutation.mutate(formData);
  };

  const etapasConfig = [
    { numero: 1, titulo: "Dados", icon: Building2 },
    { numero: 2, titulo: "Contato", icon: FileText },
    { numero: 3, titulo: "Endereço", icon: MapPin },
    { numero: 4, titulo: "Horários", icon: Clock },
    { numero: 5, titulo: "Serviços", icon: DollarSign }
  ];

  const renderEtapa = () => {
    switch (etapa) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Razão Social *</label>
              <input
                type="text"
                value={formData.razao_social}
                onChange={(e) => handleChange("razao_social", e.target.value)}
                placeholder="Razão Social"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Nome Fantasia *</label>
              <input
                type="text"
                value={formData.nome_fantasia}
                onChange={(e) => handleChange("nome_fantasia", e.target.value)}
                placeholder="Nome Fantasia"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">CNPJ *</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value.replace(/\D/g, ""))}
                placeholder="CNPJ (apenas números)"
                maxLength={14}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Tipo de Laboratório *</label>
              <select
                value={formData.tipo_laboratorio}
                onChange={(e) => handleChange("tipo_laboratorio", e.target.value)}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              >
                <option value="" className="bg-[#0a0a1a]">Selecione</option>
                {TIPOS_LABORATORIO.map(tipo => (
                  <option key={tipo.value} value={tipo.value} className="bg-[#0a0a1a]">{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Categoria</label>
              <select
                value={formData.categoria}
                onChange={(e) => handleChange("categoria", e.target.value)}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              >
                <option value="ODONTOLOGIA" className="bg-[#0a0a1a]">🦷 Odontologia</option>
                <option value="MEDICINA" className="bg-[#0a0a1a]">⚕️ Medicina</option>
                <option value="AMBOS" className="bg-[#0a0a1a]">Ambos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                placeholder="Descrição do laboratório"
                className="w-full min-h-[100px] px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none resize-none"
                maxLength={500}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email *"
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />

            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value.replace(/\D/g, ""))}
              placeholder="WhatsApp (11 dígitos) *"
              maxLength={11}
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />

            <input
              type="text"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value.replace(/\D/g, ""))}
              placeholder="Telefone Fixo (10 dígitos)"
              maxLength={10}
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />

            <input
              type="text"
              value={formData.nome_responsavel}
              onChange={(e) => handleChange("nome_responsavel", e.target.value)}
              placeholder="Nome do Responsável Técnico *"
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />

            <input
              type="text"
              value={formData.registro_responsavel}
              onChange={(e) => handleChange("registro_responsavel", e.target.value)}
              placeholder="CRO/CRM do Responsável"
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />

            <input
              type="text"
              value={formData.site}
              onChange={(e) => handleChange("site", e.target.value)}
              placeholder="Site (opcional)"
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />

            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => handleChange("instagram", e.target.value.replace("@", ""))}
              placeholder="Instagram (sem @)"
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => handleChange("cep", e.target.value.replace(/\D/g, ""))}
                placeholder="CEP"
                maxLength={8}
                className="col-span-1 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
              <input
                type="text"
                value={formData.uf}
                onChange={(e) => handleChange("uf", e.target.value.toUpperCase())}
                placeholder="UF *"
                maxLength={2}
                className="col-span-1 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                placeholder="Cidade *"
                className="col-span-1 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
            </div>

            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              placeholder="Endereço *"
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                placeholder="Número"
                className="px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleChange("bairro", e.target.value)}
                placeholder="Bairro"
                className="px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
              />
            </div>

            <input
              type="text"
              value={formData.complemento}
              onChange={(e) => handleChange("complemento", e.target.value)}
              placeholder="Complemento"
              className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-white mb-3">Horários de Atendimento</h3>
            {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map(dia => (
              <div key={dia} className="flex items-center gap-3">
                <span className="w-24 text-sm font-semibold text-gray-400 capitalize">{dia}:</span>
                <input
                  type="text"
                  value={formData.horarios_atendimento[dia]}
                  onChange={(e) => handleHorarioChange(dia, e.target.value)}
                  placeholder="Ex: 08:00 - 18:00"
                  className="flex-1 px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
                />
              </div>
            ))}

            <div className="mt-6">
              <h3 className="font-bold text-white mb-3">Prazo de Entrega</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={formData.prazo_entrega.minimo_dias}
                  onChange={(e) => handlePrazoChange("minimo_dias", e.target.value)}
                  placeholder="Mínimo (dias)"
                  className="px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
                />
                <input
                  type="number"
                  value={formData.prazo_entrega.maximo_dias}
                  onChange={(e) => handlePrazoChange("maximo_dias", e.target.value)}
                  placeholder="Máximo (dias)"
                  className="px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none"
                />
              </div>
              <textarea
                value={formData.prazo_entrega.observacoes}
                onChange={(e) => handlePrazoChange("observacoes", e.target.value)}
                placeholder="Observações sobre prazo"
                className="w-full mt-3 min-h-[80px] px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral outline-none resize-none"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-brand-coral/5 border border-brand-coral/20 rounded-2xl p-4">
              <p className="text-sm text-brand-coral">
                ✅ Cadastro quase completo! Revise as informações e clique em <strong>Finalizar</strong>.
              </p>
            </div>

            <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-5 space-y-2 text-sm text-gray-300">
              <p><strong className="text-white">Nome:</strong> {formData.nome_fantasia}</p>
              <p><strong className="text-white">Tipo:</strong> {TIPOS_LABORATORIO.find(t => t.value === formData.tipo_laboratorio)?.label}</p>
              <p><strong className="text-white">Email:</strong> {formData.email}</p>
              <p><strong className="text-white">WhatsApp:</strong> {formData.whatsapp}</p>
              <p><strong className="text-white">Endereço:</strong> {formData.cidade} - {formData.uf}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="relative z-10">
        <div className="bg-[#13132B] border-b border-white/10 px-4 pt-6 pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-lg shadow-brand-coral/20">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Cadastro Laboratório</h1>
              <p className="text-gray-400 text-sm">Etapa {etapa} de {totalEtapas}</p>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 max-w-2xl mx-auto">
          {/* Progresso */}
          <div className="bg-[#13132B] border border-white/10 rounded-2xl shadow-xl p-4 mb-6">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(etapa / totalEtapas) * 100}%` }}
                className="h-full bg-gradient-to-r from-brand-coral to-brand-orange"
              />
            </div>

            <div className="flex justify-between">
              {etapasConfig.map(e => (
                <div key={e.numero} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-all ${etapa === e.numero ? "bg-gradient-to-br from-brand-coral to-brand-orange text-white scale-110 shadow-lg" :
                      etapa > e.numero ? "bg-green-500 text-white" : "bg-[#0a0a1a] text-gray-600 border border-white/10"
                    }`}>
                    {etapa > e.numero ? <CheckCircle2 className="w-5 h-5" /> : <e.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-semibold text-center ${etapa === e.numero ? "text-brand-coral" : "text-gray-600"}`}>{e.titulo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <motion.div
            key={etapa}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6 mb-6"
          >
            {renderEtapa()}
          </motion.div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={() => setEtapa(prev => Math.max(prev - 1, 1))}
              disabled={etapa === 1}
              className="flex-1 py-4 bg-[#0a0a1a] border border-white/10 text-white font-bold rounded-2xl disabled:opacity-50 hover:bg-white/5 transition-all"
            >
              Voltar
            </button>

            {etapa < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-coral/20 hover:scale-[1.02] flex items-center justify-center gap-2 transition-all"
              >
                Continuar <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={finalizar}
                disabled={cadastrarMutation.isPending}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {cadastrarMutation.isPending ? "Enviando..." : "Finalizar"} <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}