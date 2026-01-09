import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Zap,
  Calendar,
  Users,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  Loader2
} from "lucide-react";
import { minhasCandidaturas } from "@/components/api/substituicao";

export default function DashboardSubstituicoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const professionals = await base44.entities.Professional.filter({
          user_id: currentUser.id
        });
        if (professionals.length > 0) {
          setProfessional(professionals[0]);
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: candidaturas = [] } = useQuery({
    queryKey: ["minhasCandidaturasSubstituicao", professional?.id],
    queryFn: async () => {
      return await minhasCandidaturas(professional.id);
    },
    enabled: !!professional
  });

  const { data: vagasDisponiveis = [] } = useQuery({
    queryKey: ["vagasDisponiveisCount"],
    queryFn: async () => {
      return await base44.entities.SubstituicaoUrgente.filter({
        status: "ABERTA"
      });
    },
    enabled: !!professional
  });

  const { data: todasSubstituicoes = [] } = useQuery({
    queryKey: ["todasSubstituicoes"],
    queryFn: async () => {
      return await base44.entities.SubstituicaoUrgente.filter({});
    },
    enabled: !!professional
  });

  const candidaturasAguardando = candidaturas.filter(c => c.status === "AGUARDANDO").length;
  const candidaturasEscolhido = candidaturas.filter(c => c.status === "ESCOLHIDO").length;

  // Calcular taxa de preenchimento
  const substituicoesPreenchidas = todasSubstituicoes.filter(s => s.status === "PREENCHIDA").length;
  const totalSubstituicoes = todasSubstituicoes.length;
  const taxaPreenchimento = totalSubstituicoes > 0
    ? ((substituicoesPreenchidas / totalSubstituicoes) * 100).toFixed(1)
    : 0;

  // Calcular tempo médio de resposta (em minutos)
  const substituicoesRespondidas = todasSubstituicoes.filter(s =>
    s.status === "PREENCHIDA" && s.candidato_escolhido_em
  );
  const tempoMedioResposta = substituicoesRespondidas.length > 0
    ? substituicoesRespondidas.reduce((acc, sub) => {
      const inicio = new Date(sub.created_date);
      const fim = new Date(sub.candidato_escolhido_em);
      const diffMinutos = Math.floor((fim - inicio) / (1000 * 60));
      return acc + diffMinutos;
    }, 0) / substituicoesRespondidas.length
    : 0;

  const isOnline = professional?.status_disponibilidade_substituicao === "ONLINE";

  if (!professional) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24">
      {/* Header */}
      <div className={`py-8 mb-8 transition-all relative overflow-hidden ${isOnline
          ? "bg-gradient-to-r from-green-600 via-emerald-700 to-teal-800"
          : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
        }`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl mb-4 border border-white/20">
                ⚡
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                SUBSTITUIÇÕES
              </h1>
              <p className="text-white/80 font-medium">
                {isOnline ? "🟢 Você está ONLINE" : "⚪ Você está OFFLINE"}
              </p>
            </div>
            <button
              onClick={() => navigate("/DisponibilidadeSubstituicao")}
              className={`px-6 py-4 font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 ${isOnline
                  ? "bg-white text-green-700 hover:shadow-green-500/20"
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                }`}
            >
              <Zap className={`w-5 h-5 ${isOnline ? "fill-current" : ""}`} />
              {isOnline ? "ONLINE" : "OFFLINE"}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            title="Vagas Disponíveis"
            value={vagasDisponiveis.length}
            color="blue"
            onClick={() => navigate("/VagasDisponiveis")}
          />
          <StatCard
            icon={Clock}
            title="Aguardando"
            value={candidaturasAguardando}
            color="yellow"
            onClick={() => navigate("/MinhasCandidaturasSubstituicao")}
          />
          <StatCard
            icon={CheckCircle}
            title="Escolhido"
            value={candidaturasEscolhido}
            color="green"
            onClick={() => navigate("/MinhasCandidaturasSubstituicao")}
          />
          <StatCard
            icon={Star}
            title="Completadas"
            value={professional.substituicoes_completadas || 0}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Taxa Preenchimento"
            value={`${taxaPreenchimento}%`}
            color="blue"
          />
          <StatCard
            icon={Zap}
            title="Tempo Médio"
            value={tempoMedioResposta > 0 ? `${Math.round(tempoMedioResposta)}min` : "-"}
            color="yellow"
          />
        </div>

        {/* Ações Rápidas */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl mb-8">
          <h3 className="text-xl font-black text-white mb-4">Ações Rápidas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/VagasDisponiveis")}
              className="p-6 rounded-2xl border border-white/10 bg-[#0a0a1a] hover:border-brand-primary/50 hover:bg-[#0a0a1a]/80 transition-all text-left group"
            >
              <Calendar className="w-8 h-8 text-brand-orange mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">Ver Vagas</h4>
              <p className="text-sm text-gray-400">Procurar oportunidades</p>
            </button>
            <button
              onClick={() => navigate("/MinhasCandidaturasSubstituicao")}
              className="p-6 rounded-2xl border border-white/10 bg-[#0a0a1a] hover:border-blue-500/50 hover:bg-[#0a0a1a]/80 transition-all text-left group"
            >
              <Users className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Candidaturas</h4>
              <p className="text-sm text-gray-400">Acompanhar status</p>
            </button>
            <button
              onClick={() => navigate("/DisponibilidadeSubstituicao")}
              className="p-6 rounded-2xl border border-white/10 bg-[#0a0a1a] hover:border-green-500/50 hover:bg-[#0a0a1a]/80 transition-all text-left group"
            >
              <Zap className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-white mb-1 group-hover:text-green-400 transition-colors">Disponibilidade</h4>
              <p className="text-sm text-gray-400">Configurar status</p>
            </button>
          </div>
        </div>

        {/* Estatísticas Profissionais */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-black text-white mb-4">Suas Estatísticas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <div className="text-4xl font-black text-green-500 mb-2">
                {professional.taxa_comparecimento || 100}%
              </div>
              <div className="text-sm text-gray-400 font-bold">Taxa de Comparecimento</div>
            </div>
            <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <div className="text-4xl font-black text-yellow-500 mb-2">
                {professional.media_avaliacoes?.toFixed(1) || "N/A"}
              </div>
              <div className="text-sm text-gray-400 font-bold">Avaliação Média</div>
            </div>
            <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <div className="text-4xl font-black text-blue-500 mb-2">
                {professional.substituicoes_completadas || 0}
              </div>
              <div className="text-sm text-gray-400 font-bold">Substituições</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, onClick }) {
  const colorClasses = {
    blue: "from-blue-600 to-blue-800 border-blue-500/20",
    yellow: "from-yellow-600 to-orange-700 border-yellow-500/20",
    green: "from-green-600 to-emerald-800 border-green-500/20",
    purple: "from-purple-600 to-pink-800 border-purple-500/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6 shadow-xl relative overflow-hidden group ${onClick ? "cursor-pointer hover:scale-[1.03]" : ""
        } transition-all`}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>

      <Icon className="w-8 h-8 text-white/90 mb-3 relative z-10" />
      <div className="text-3xl font-black text-white mb-1 relative z-10">{value}</div>
      <div className="text-white/70 text-xs font-bold uppercase tracking-wider relative z-10">{title}</div>
    </motion.div>
  );
}