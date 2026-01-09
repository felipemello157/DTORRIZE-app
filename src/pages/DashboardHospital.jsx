import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  Star,
  Plus,
  Clock,
  CheckCircle,
  Award
} from "lucide-react";

export default function DashboardHospital() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const hospitalResult = await base44.entities.Hospital.filter({ user_id: currentUser.id });
        setHospital(hospitalResult[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar vagas do hospital (quando criar a relação)
  const { data: vagas = [] } = useQuery({
    queryKey: ["vagas-hospital", hospital?.id],
    queryFn: async () => {
      if (!hospital?.id) return [];
      // Futuramente: buscar vagas relacionadas ao hospital
      return [];
    },
    enabled: !!hospital?.id
  });

  // Calcular métricas
  const vagasAbertas = vagas.filter(v => v.status === "ABERTO").length;
  const candidaturasRecebidas = vagas.reduce((acc, v) => acc + (v.total_candidatos || 0), 0);
  const contratacoesEsteMes = 0; // Implementar quando houver contratações

  if (!hospital) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const planoConfig = {
    BASICO: { label: "Básico", color: "bg-gray-500/20 text-gray-300 border border-gray-500/50" },
    PREMIUM: { label: "Premium", color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-lg shadow-orange-500/20" },
    ENTERPRISE: { label: "Enterprise", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg shadow-purple-500/20" }
  };

  const plano = planoConfig[hospital.plano] || planoConfig.BASICO;

  const tipoInstituicaoLabels = {
    HOSPITAL: "Hospital",
    REDE: "Rede de Clínicas",
    UPA: "UPA/Pronto Socorro",
    CLINICA_GRANDE: "Clínica de Grande Porte",
    LABORATORIO_REDE: "Laboratório/Rede"
  };

  const vagasRecentes = vagas.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-coral/20 flex-shrink-0 overflow-hidden">
                {hospital.logo_url ? (
                  <img src={hospital.logo_url} alt={hospital.nome_fantasia} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10" />
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">{hospital.nome_fantasia}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-full text-xs font-bold">
                    {tipoInstituicaoLabels[hospital.tipo_instituicao]}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${plano.color}`}>
                    {plano.label}
                  </span>
                  {hospital.status_cadastro === "APROVADO" && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("EditarHospital"))}
              className="px-6 py-3 border border-white/20 text-white font-semibold rounded-2xl hover:border-brand-orange hover:text-brand-orange transition-all whitespace-nowrap bg-[#0a0a1a]"
            >
              Editar Perfil
            </button>
          </div>
        </motion.div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={Briefcase}
            label="Vagas Abertas"
            value={vagasAbertas}
            color="from-blue-400 to-blue-600"
            delay={0}
          />
          <MetricCard
            icon={Users}
            label="Candidaturas"
            value={candidaturasRecebidas}
            color="from-green-400 to-green-600"
            delay={0.1}
          />
          <MetricCard
            icon={TrendingUp}
            label="Contratações (Mês)"
            value={contratacoesEsteMes}
            color="from-purple-400 to-purple-600"
            delay={0.2}
          />
          <MetricCard
            icon={Star}
            label="Avaliação"
            value={hospital.media_avaliacoes?.toFixed(1) || "0.0"}
            color="from-yellow-400 to-orange-500"
            delay={0.3}
          />
        </div>

        {/* AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <button
            onClick={() => navigate(createPageUrl("CriarVagaHospital"))}
            className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-6 hover:bg-[#13132B]/80 hover:border-brand-coral/30 hover:scale-[1.02] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-white">Criar Nova Vaga</h3>
                <p className="text-sm text-gray-400">Publique oportunidades</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl("CandidatosHospital"))}
            className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-6 hover:bg-[#13132B]/80 hover:border-blue-500/30 hover:scale-[1.02] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-white">Ver Candidatos</h3>
                <p className="text-sm text-gray-400">Analise perfis</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl("MinhasVagasHospital"))}
            className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-6 hover:bg-[#13132B]/80 hover:border-purple-500/30 hover:scale-[1.02] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-white">Minhas Vagas</h3>
                <p className="text-sm text-gray-400">Gerencie publicações</p>
              </div>
            </div>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VAGAS RECENTES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">Vagas Recentes</h2>
              <button
                onClick={() => navigate(createPageUrl("MinhasVagasHospital"))}
                className="text-brand-orange font-bold text-sm hover:text-brand-coral transition-colors"
              >
                Ver Todas →
              </button>
            </div>

            {vagasRecentes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-[#0a0a1a] border border-white/5 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 mb-4">Nenhuma vaga publicada ainda</p>
                <button
                  onClick={() => navigate(createPageUrl("CriarVagaHospital"))}
                  className="px-6 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-brand-coral/20 transition-all"
                >
                  Criar Primeira Vaga
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vagasRecentes.map((vaga, index) => (
                  <VagaRecenteCard key={vaga.id} vaga={vaga} index={index} navigate={navigate} />
                ))}
              </div>
            )}
          </motion.div>

          {/* CANDIDATOS DESTAQUE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">Candidatos Destaque</h2>
              <button
                onClick={() => navigate(createPageUrl("CandidatosHospital"))}
                className="text-brand-orange font-bold text-sm hover:text-brand-coral transition-colors"
              >
                Ver Todos →
              </button>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-brand-orange/30 flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-brand-orange" />
              </div>
              <p className="text-gray-400 mb-2">Candidatos com melhor match</p>
              <p className="text-sm text-gray-500">Aparecem aqui quando você criar vagas</p>
            </div>
          </motion.div>
        </div>

        {/* AVISO SE PENDENTE */}
        {hospital.status_cadastro === "PENDENTE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 mt-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Cadastro em Análise</h3>
                <p className="text-gray-400 mb-3">
                  Seu cadastro está sendo analisado pela nossa equipe. Você poderá publicar vagas assim que for aprovado.
                </p>
                <p className="text-sm text-gray-400">
                  ⏱️ Tempo médio de aprovação: <strong>24-48 horas úteis</strong>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* UPGRADE PLANO */}
        {hospital.plano === "BASICO" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-purple-900/50 via-purple-800/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-8 text-white mt-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black mb-2">Faça Upgrade para Premium</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    Vagas ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    Acesso prioritário a candidatos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    Dashboard com analytics avançado
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate(createPageUrl("Planos"))}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap"
              >
                Ver Planos
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-6 hover:bg-[#13132B]/80 hover:scale-105 transition-all"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}

function VagaRecenteCard({ vaga, index, navigate }) {
  const statusColors = {
    ABERTO: "bg-green-500/20 text-green-400 border border-green-500/50",
    PAUSADO: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
    PREENCHIDO: "bg-blue-500/20 text-blue-400 border border-blue-500/50",
    CANCELADO: "bg-gray-500/20 text-gray-400 border border-gray-500/50"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(createPageUrl("EditarVagaHospital") + "/" + vaga.id)}
      className="p-4 bg-[#0a0a1a] border border-white/10 rounded-2xl hover:border-brand-coral/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white truncate mb-1 group-hover:text-brand-coral transition-colors">{vaga.titulo}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{vaga.cidade} - {vaga.uf}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ${statusColors[vaga.status]}`}>
            {vaga.status}
          </span>
          <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
            <Users className="w-3 h-3" />
            {vaga.total_candidatos || 0} candidatos
          </p>
        </div>
      </div>
    </motion.div>
  );
}