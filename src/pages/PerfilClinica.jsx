import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Edit,
  Star,
  Building2,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Briefcase,
  Users,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Award,
  FileText,
  LogOut,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import ShareButton from "@/components/shared/ShareButton";

export default function PerfilClinica() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  // Buscar owner da clínica
  const { data: owner } = useQuery({
    queryKey: ["companyOwner", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const result = await base44.entities.CompanyOwner.filter({ user_id: user.id });
      return result[0] || null;
    },
    enabled: !!user
  });

  // Buscar unidade da clínica
  const { data: unit, isLoading } = useQuery({
    queryKey: ["companyUnit", owner?.id],
    queryFn: async () => {
      if (!owner) return null;
      const result = await base44.entities.CompanyUnit.filter({ owner_id: owner.id });
      return result[0] || null;
    },
    enabled: !!owner
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["unitRatings", unit?.id],
    queryFn: async () => {
      if (!unit) return [];
      return await base44.entities.Rating.filter({
        avaliado_id: unit.id,
        avaliado_tipo: "CLINICA"
      });
    },
    enabled: !!unit
  });

  // Buscar vagas
  const { data: jobs = [] } = useQuery({
    queryKey: ["unitJobs", unit?.id],
    queryFn: async () => {
      if (!unit) return [];
      return await base44.entities.Job.filter({ unit_id: unit.id });
    },
    enabled: !!unit
  });

  if (isLoading || !unit) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Calcular avaliações
  const mediaAvaliacoes = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.nota, 0) / ratings.length)
    : 0;

  // Distribuição de estrelas
  const distribuicao = [5, 4, 3, 2, 1].map(estrela => ({
    estrelas: estrela,
    count: ratings.filter(r => r.nota === estrela).length
  }));

  // Formatar CNPJ
  const formatarCNPJ = (cnpj) => {
    if (!cnpj) return "";
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  // Formatar CEP
  const formatarCEP = (cep) => {
    if (!cep) return "";
    return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  };

  // Fotos da clínica
  const fotos = [
    unit.foto_fachada_url,
    unit.foto_recepcao_url,
    unit.foto_consultorio_url
  ].filter(Boolean);

  const tipoLabels = {
    CLINICA: "Clínica",
    CONSULTORIO: "Consultório",
    HOSPITAL: "Hospital",
    LABORATORIO: "Laboratório",
    FORNECEDOR: "Fornecedor"
  };

  const mundoLabels = {
    ODONTOLOGIA: "🦷 Odontologia",
    MEDICINA: "🩺 Medicina",
    AMBOS: "🦷🩺 Odontologia e Medicina"
  };

  const vagasAbertas = jobs.filter(j => j.status === "ABERTO").length;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-brand-coral/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER COM FOTO */}
      <div className="relative pt-8 pb-24 px-4 overflow-hidden">
        {/* Decorative Background for Header */}
        <div className="absolute inset-0 bg-[#13132B] border-b border-white/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent opacity-50" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Foto/Logo */}
            <div className="w-32 h-32 rounded-full p-1.5 border-2 border-brand-orange/50 shadow-[0_0_30px_rgba(255,100,0,0.2)] mb-4 bg-[#0a0a1a] relative group">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E1E3F] to-[#0a0a1a] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {unit.nome_fantasia?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Nome e Info */}
            <h1 className="text-3xl font-black text-white mb-2">{unit.nome_fantasia}</h1>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {unit.status_cadastro === "APROVADO" && (
                <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-full text-sm shadow-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verificada
                </span>
              )}
              <span className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-full text-sm">
                {tipoLabels[unit.tipo_empresa]}
              </span>
            </div>

            <p className="text-gray-400 text-lg font-medium mb-4 flex items-center gap-2 justify-center">
              <MapPin className="w-5 h-5 text-brand-orange" />
              {unit.cidade} - {unit.uf}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(createPageUrl("EditarClinica"))}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#0a0a1a] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>
              <ShareButton
                title={`Perfil de ${unit.nome_fantasia}`}
                text={`${unit.tipo_empresa} - ${unit.cidade}/${unit.uf}`}
                url={window.location.href}
                className="bg-white/10 backdrop-blur border border-white/10 text-white hover:bg-white/20 px-4 py-3 rounded-xl transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-12 space-y-6 relative z-10">
        {/* SEÇÃO AVALIAÇÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Avaliações</h2>
              <p className="text-sm text-gray-400">Reputação na plataforma</p>
            </div>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-5xl font-black text-white mb-1">{mediaAvaliacoes.toFixed(1)}</p>
              <div className="flex gap-1 mb-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(mediaAvaliacoes) ? "fill-yellow-500 text-yellow-500" : "text-gray-700"
                      }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">{ratings.length} avaliações</p>
            </div>

            {/* Distribuição */}
            <div className="flex-1 space-y-2">
              {distribuicao.map(({ estrelas, count }) => (
                <div key={estrelas} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-8">{estrelas} ★</span>
                  <div className="flex-1 h-2 bg-[#0a0a1a] rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* INFORMAÇÕES DA CLÍNICA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Informações da Empresa</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <FileText className="w-5 h-5 text-brand-orange mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Razão Social</p>
                <p className="font-bold text-white">{unit.razao_social}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <Award className="w-5 h-5 text-brand-orange mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">CNPJ</p>
                <p className="font-bold text-white">{formatarCNPJ(unit.cnpj)}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <Building2 className="w-5 h-5 text-brand-orange mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo de Empresa</p>
                <p className="font-bold text-white">{tipoLabels[unit.tipo_empresa]}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <Star className="w-5 h-5 text-brand-orange mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Área de Atuação</p>
                <p className="font-bold text-white">{mundoLabels[unit.tipo_mundo]}</p>
              </div>
            </div>
          </div>

          {/* Responsável Técnico */}
          {unit.nome_responsavel && (
            <div className="mt-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Responsável Técnico</p>
                  <p className="font-bold text-white">{unit.nome_responsavel}</p>
                  {unit.cro_responsavel && (
                    <p className="text-sm text-gray-400 mt-1">CRO: {unit.cro_responsavel}</p>
                  )}
                  {unit.crm_responsavel && (
                    <p className="text-sm text-gray-400 mt-1">CRM: {unit.crm_responsavel}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ENDEREÇO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Endereço</h2>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-300">
              <strong className="text-white">{unit.endereco}</strong>
              {unit.numero && `, ${unit.numero}`}
              {unit.complemento && ` - ${unit.complemento}`}
            </p>
            <p className="text-gray-300">
              {unit.bairro} - {unit.cidade}/{unit.uf}
            </p>
            <p className="text-gray-300">
              CEP: {formatarCEP(unit.cep)}
            </p>

            {unit.ponto_referencia && (
              <div className="mt-4 p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                <p className="text-sm text-gray-500 mb-1">Ponto de Referência</p>
                <p className="text-white">{unit.ponto_referencia}</p>
              </div>
            )}

            {unit.google_maps_link && (
              <button
                onClick={() => window.open(unit.google_maps_link, "_blank")}
                className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-orange/20 transition-all flex items-center justify-center gap-2"
              >
                Ver no Google Maps
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* FOTOS */}
        {fotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Fotos da Clínica</h2>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-track-[#0a0a1a] scrollbar-thumb-white/20">
              {fotos.map((foto, index) => (
                <div key={index} className="flex-shrink-0 snap-start">
                  <img
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className="w-64 h-48 object-cover rounded-2xl shadow-lg border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => window.open(foto, "_blank")}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CONTATO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Contato</h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="flex items-center justify-between p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="font-bold text-white">
                    ({unit.whatsapp?.slice(0, 2)}) {unit.whatsapp?.slice(2, 7)}-{unit.whatsapp?.slice(7)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.open(`https://wa.me/55${unit.whatsapp}`, "_blank")}
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-md hover:shadow-green-500/20"
              >
                Abrir
              </button>
            </div>

            {/* Telefone Fixo */}
            {unit.telefone_fixo && (
              <div className="flex items-center gap-3 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone Fixo</p>
                  <p className="font-bold text-white">
                    ({unit.telefone_fixo?.slice(0, 2)}) {unit.telefone_fixo?.slice(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-3 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-bold text-white">{unit.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ESTATÍSTICAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-brand-orange">
                <Briefcase className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-400">Vagas Abertas</p>
            </div>
            <p className="text-3xl font-black text-white">{vagasAbertas}</p>
          </div>

          <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-400">Contratações</p>
            </div>
            <p className="text-3xl font-black text-white">{unit.total_contratacoes || 0}</p>
          </div>

          <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-400">Avaliação Média</p>
            </div>
            <p className="text-3xl font-black text-white">{mediaAvaliacoes.toFixed(1)}</p>
          </div>
        </motion.div>

        {/* AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate(createPageUrl("CriarVaga"))}
            className="py-6 px-6 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-bold rounded-3xl shadow-lg hover:shadow-brand-orange/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <Briefcase className="w-6 h-6" />
            Criar Nova Vaga
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate(createPageUrl("MinhasVagas"))}
            className="py-6 px-6 bg-[#13132B] border border-white/10 text-white font-bold rounded-3xl hover:bg-white/5 hover:border-brand-orange/50 transition-all flex items-center justify-center gap-3"
          >
            <TrendingUp className="w-6 h-6" />
            Ver Minhas Vagas
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* CONFIGURAÇÕES E LOGOUT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate(createPageUrl("Configuracoes"))}
            className="w-full py-4 px-6 bg-[#13132B] border border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 hover:border-brand-orange/50 hover:text-brand-orange transition-all flex items-center justify-center gap-3"
          >
            <Settings className="w-5 h-5" />
            Configurações
          </button>

          <button
            onClick={async () => {
              if (window.confirm("Tem certeza que deseja sair da sua conta?")) {
                try {
                  await base44.auth.logout();
                  toast.success("Você saiu da conta com sucesso!");
                  navigate("/");
                } catch (error) {
                  toast.error("Erro ao sair da conta");
                }
              }
            }}
            className="w-full py-4 px-6 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </motion.div>
      </div>
    </div>
  );
}