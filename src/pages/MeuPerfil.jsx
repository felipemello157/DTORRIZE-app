import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Edit,
  Star,
  Award,
  MapPin,
  Phone,
  Mail,
  Instagram,
  CheckCircle2,
  Calendar,
  Eye,
  FileText,
  Clock,
  Briefcase,
  LogOut,
  Settings,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import ShareButton from "@/components/shared/ShareButton";
import TelegramSection from "@/components/profile/TelegramSection";

export default function MeuPerfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // MOCK USER FALLBACK (LOCALHOST)
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          const mockUser = {
            id: "mock-user-123",
            nome_completo: "Dev Localhost",
            email: "dev@localhost.com",
            vertical: "ODONTOLOGIA",
            foto: null
          };
          setUser(mockUser);
        }
      }
    };
    loadUser();
  }, []);

  // Buscar dados do profissional
  const { data: professional, isLoading } = useQuery({
    queryKey: ["professional", user?.id],
    queryFn: async () => {
      // MOCK PROFESSIONAL (LOCALHOST)
      if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && user?.id === "mock-user-123") {
        return {
          id: "mock-prof-1",
          nome_completo: "Dev Localhost",
          especialidade_principal: "Clínica Geral",
          registro_conselho: "12345",
          uf_conselho: "SP",
          cidades_atendimento: ["São Paulo", "Campinas"],
          user_id: "mock-user-123",
          tempo_formado_anos: 5,
          tempo_especialidade_anos: 2,
          sobre: "Perfil de testes rodando em localhost.",
          tipo_profissional: "MEDICO",
          status_disponibilidade: "DISPONIVEL",
          disponibilidade_inicio: "IMEDIATO",
          dias_semana_disponiveis: ["Segunda", "Quarta"],
          forma_remuneracao: ["FIXO", "DIARIA"],
          whatsapp: "11999999999",
          email: "dev@localhost.com",
          instagram: "dev_localhost"
        };
      }

      if (!user) return null;
      const result = await base44.entities.Professional.filter({ user_id: user.id });
      return result[0] || null;
    },
    enabled: !!user
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.Rating.filter({
        avaliado_id: professional.id,
        avaliado_tipo: professional.tipo_profissional === "DENTISTA" ? "DENTISTA" : "MEDICO"
      });
    },
    enabled: !!professional
  });

  // Buscar matches para estatísticas
  const { data: matches = [] } = useQuery({
    queryKey: ["jobMatches", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.JobMatch.filter({ professional_id: professional.id });
    },
    enabled: !!professional
  });

  if (isLoading || !professional) {
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

  // Status config
  const statusConfig = {
    DISPONIVEL: { label: "Disponível", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    INDISPONIVEL: { label: "Indisponível", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    OCUPADO: { label: "Ocupado", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" }
  };

  const currentStatus = statusConfig[professional.status_disponibilidade] || statusConfig.DISPONIVEL;

  // Disponibilidade labels
  const disponibilidadeLabels = {
    IMEDIATO: "Imediato",
    "15_DIAS": "15 dias",
    "30_DIAS": "30 dias",
    "60_DIAS": "60 dias",
    A_COMBINAR: "A combinar"
  };

  const candidaturasEnviadas = matches.filter(m => m.status_candidatura === "CANDIDATOU").length;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative pt-8 pb-24 px-4 overflow-hidden">
        {/* Decorative Background for Header */}
        <div className="absolute inset-0 bg-[#13132B] border-b border-white/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent opacity-50" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Foto */}
            <div className="w-32 h-32 rounded-full p-1.5 border-2 border-brand-orange/50 shadow-[0_0_30px_rgba(255,100,0,0.2)] mb-6 bg-[#0a0a1a] relative group">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E1E3F] to-[#0a0a1a] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {user?.foto ? (
                  <img src={user.foto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  professional.nome_completo?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center border-4 border-[#0a0a1a]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Nome e Info */}
            <h1 className="text-3xl font-black text-white mb-2">{professional.nome_completo}</h1>

            <p className="text-gray-400 text-lg font-medium mb-4">{professional.especialidade_principal}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-full text-sm">
                {professional.tipo_profissional === "DENTISTA" ? "🦷 Dentista" : "🩺 Médico"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(createPageUrl("EditarPerfil"))}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#0a0a1a] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>
              <ShareButton
                title={`Perfil de ${professional.nome_completo}`}
                text={`${professional.especialidade_principal} - ${professional.cidades_atendimento?.[0]}`}
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
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Avaliações</h2>
              <p className="text-sm text-gray-400">Sua reputação na plataforma</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left min-w-[140px]">
              <p className="text-6xl font-black text-white mb-2">{mediaAvaliacoes.toFixed(1)}</p>
              <div className="flex justify-center md:justify-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(mediaAvaliacoes) ? "fill-yellow-500 text-yellow-500" : "text-gray-700"
                      }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">{ratings.length} avaliações</p>
            </div>

            {/* Distribuição */}
            <div className="flex-1 w-full space-y-3">
              {distribuicao.map(({ estrelas, count }) => (
                <div key={estrelas} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-8">{estrelas} ★</span>
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

        {/* INFORMAÇÕES PROFISSIONAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Informações Profissionais</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <Briefcase className="w-5 h-5 text-brand-orange mt-1" />
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Registro Profissional</p>
                <p className="font-bold text-white text-lg">
                  {professional.tipo_profissional === "DENTISTA" ? "CRO" : "CRM"} {professional.registro_conselho} - {professional.uf_conselho}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <Clock className="w-5 h-5 text-brand-orange mt-1" />
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Tempo de Formado</p>
                <p className="font-bold text-white text-lg">{professional.tempo_formado_anos} anos</p>
              </div>
            </div>

            {professional.tempo_especialidade_anos > 0 && (
              <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <Star className="w-5 h-5 text-brand-orange mt-1" />
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Tempo na Especialidade</p>
                  <p className="font-bold text-white text-lg">{professional.tempo_especialidade_anos} anos</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-brand-orange mt-1" />
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Aceita Freelance</p>
                <p className={`font-bold text-lg ${professional.aceita_freelance ? "text-green-400" : "text-gray-500"}`}>
                  {professional.aceita_freelance ? "Sim, Aceita" : "Não Aceita"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* DISPONIBILIDADE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Disponibilidade</h2>
            </div>
          </div>

          <div className="space-y-8">
            {/* Dias Disponíveis */}
            <div>
              <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Dias Disponíveis</p>
              <div className="flex flex-wrap gap-2">
                {professional.dias_semana_disponiveis?.length > 0 ? professional.dias_semana_disponiveis.map((dia) => (
                  <span
                    key={dia}
                    className="px-4 py-2 bg-[#0a0a1a] border border-white/10 text-white font-bold rounded-xl text-sm hover:border-brand-orange/50 transition-colors"
                  >
                    {dia === "INTEGRAL" ? "Integral (Todos os dias)" : dia}
                  </span>
                )) : <span className="text-gray-500 italic">Nenhum dia selecionado</span>}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Início */}
            <div>
              <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Disponibilidade para Início</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                {disponibilidadeLabels[professional.disponibilidade_inicio] || "Não informado"}
              </span>
            </div>

            <div className="h-px bg-white/5" />

            {/* Forma de Remuneração */}
            {professional.forma_remuneracao && professional.forma_remuneracao.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Formas de Remuneração Aceitas</p>
                <div className="flex flex-wrap gap-2">
                  {professional.forma_remuneracao.map((forma) => (
                    <span
                      key={forma}
                      className="px-4 py-2 bg-[#0a0a1a] border border-white/10 text-gray-300 font-bold rounded-xl text-sm"
                    >
                      {forma === "DIARIA" ? "Diária" : forma === "PORCENTAGEM" ? "Porcentagem" : forma === "FIXO" ? "Fixo" : "A Combinar"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* CIDADES DE ATENDIMENTO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Cidades de Atendimento</h2>
              <p className="text-sm text-gray-400">Locais de atuação</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {professional.cidades_atendimento?.length > 0 ? professional.cidades_atendimento.map((cidade, index) => (
              <span
                key={index}
                className="px-5 py-3 bg-[#0a0a1a] border border-white/10 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:border-red-500/50 transition-colors group"
              >
                <MapPin className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                {cidade}
              </span>
            )) : <span className="text-gray-500 italic">Nenhuma cidade cadastrada</span>}
          </div>
        </motion.div>

        {/* CONTATO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Contato</h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="flex items-center justify-between p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">WhatsApp</p>
                  <p className="font-bold text-white text-lg">
                    ({professional.whatsapp?.slice(0, 2)}) {professional.whatsapp?.slice(2, 7)}-{professional.whatsapp?.slice(7)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.open(`https://wa.me/55${professional.whatsapp}`, "_blank")}
                className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-all shadow-lg hover:shadow-green-500/20"
              >
                Abrir
              </button>
            </div>

            {/* Email */}
            {professional.exibir_email && (
              <div className="flex items-center gap-4 p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-bold text-white text-lg">{professional.email}</p>
                </div>
              </div>
            )}

            {/* Instagram */}
            {professional.instagram && (
              <div className="flex items-center justify-between p-5 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Instagram</p>
                    <p className="font-bold text-white text-lg">@{professional.instagram}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://instagram.com/${professional.instagram}`, "_blank")}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Abrir
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* EXPERIÊNCIAS PROFISSIONAIS */}
        {(professional.experiencias_profissionais?.length > 0 || professional.cursos_aperfeicoamento?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-brand-orange">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Experiências Profissionais</h2>
              </div>
            </div>

            {/* Experiências de Trabalho */}
            {professional.experiencias_profissionais?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-bold text-gray-300 mb-4 uppercase tracking-wider">Experiências de Trabalho</h3>
                <div className="space-y-4">
                  {professional.experiencias_profissionais.map((exp, index) => (
                    <div key={index} className="border-l-4 border-brand-orange pl-5 py-2 group">
                      <h4 className="font-bold text-white text-lg mb-1 group-hover:text-brand-orange transition-colors">{exp.empresa_clinica}</h4>
                      {exp.cargo && (
                        <p className="text-sm text-gray-400 mb-2">{exp.cargo}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exp.periodo_inicio} - {exp.periodo_fim || "Atual"}
                        </span>
                        {exp.anos_trabalhados > 0 && (
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-bold">
                            {exp.anos_trabalhados} {exp.anos_trabalhados === 1 ? "ano" : "anos"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cursos de Aperfeiçoamento */}
            {professional.cursos_aperfeicoamento?.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-300 mb-4 uppercase tracking-wider">Cursos de Aperfeiçoamento</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {professional.cursos_aperfeicoamento.map((curso, index) => (
                    <div key={index} className="border border-white/10 bg-[#0a0a1a] rounded-2xl p-4 hover:border-brand-orange/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white mb-1 line-clamp-2">{curso.nome_curso}</h4>
                          <p className="text-sm text-gray-400 mb-2">{curso.instituicao}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <span>📅 {curso.ano_conclusao}</span>
                            {curso.carga_horaria > 0 && (
                              <>
                                <span>•</span>
                                <span>⏱️ {curso.carga_horaria}h</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ESTATÍSTICAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-[#13132B] rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{professional.total_contratacoes || 0}</p>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Contratações</p>
          </div>

          <div className="bg-[#13132B] rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{professional.total_contratacoes || 0}</p>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Visualizações</p>
          </div>

          <div className="bg-[#13132B] rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{candidaturasEnviadas}</p>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Candidaturas</p>
          </div>
        </motion.div>

        {/* SEÇÃO COMUNIDADE TELEGRAM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <TelegramSection user={user} />
        </motion.div>

        {/* AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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

                  // MOCK LOCALHOST: Marcar que houve logout explícito
                  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
                    localStorage.setItem("dev_force_logout", "true");
                  }

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