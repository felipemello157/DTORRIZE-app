import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  FlaskConical,
  ChevronLeft,
  Eye,
  Star,
  TrendingUp,
  Coins,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";

export default function DashboardLaboratorio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: laboratorio, isLoading } = useQuery({
    queryKey: ["meu-laboratorio", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const results = await base44.entities.Laboratorio.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!laboratorio) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center shadow-xl max-w-md">
          <FlaskConical className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Cadastro não encontrado</h2>
          <p className="text-gray-400 mb-6">Você ainda não possui um laboratório cadastrado</p>
          <button
            onClick={() => navigate(createPageUrl("CadastroLaboratorio"))}
            className="w-full py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-coral/20 hover:scale-[1.02] transition-all"
          >
            Cadastrar Laboratório
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    EM_ANALISE: { label: "Em Análise", color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20", icon: Clock },
    APROVADO: { label: "Aprovado", color: "bg-green-500/10 text-green-400 border border-green-500/20", icon: CheckCircle },
    REPROVADO: { label: "Reprovado", color: "bg-red-500/10 text-red-400 border border-red-500/20", icon: AlertCircle }
  };

  const status = statusConfig[laboratorio.status_cadastro] || statusConfig.EM_ANALISE;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* Header */}
      <div className="bg-[#13132B]/80 backdrop-blur-xl border-b border-white/10 px-4 pt-6 pb-12 relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-lg shadow-brand-coral/20">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Dashboard</h1>
              <p className="text-white/60 text-sm">{laboratorio.nome_fantasia}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(createPageUrl("EditarPerfil"))}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-brand-coral/50 transition-all"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-8 max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Status */}
        <div className={`rounded-3xl p-6 shadow-xl backdrop-blur-md ${status.color}`}>
          <div className="flex items-center gap-3">
            <status.icon className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg text-white">Status: {status.label}</h3>
              {laboratorio.status_cadastro === "REPROVADO" && laboratorio.motivo_reprovacao && (
                <p className="text-sm mt-1 text-white/80">Motivo: {laboratorio.motivo_reprovacao}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-xl hover:bg-[#13132B]/80 transition-all">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-semibold">Visualizações</span>
            </div>
            <p className="text-3xl font-black text-white">{laboratorio.visualizacoes || 0}</p>
          </div>

          <div className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-xl hover:bg-[#13132B]/80 transition-all">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm font-semibold">Avaliação</span>
            </div>
            <p className="text-3xl font-black text-white">
              {laboratorio.media_avaliacoes > 0 ? laboratorio.media_avaliacoes.toFixed(1) : "-"}
            </p>
            <p className="text-xs text-gray-400">{laboratorio.total_avaliacoes || 0} avaliações</p>
          </div>

          <div className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-xl hover:bg-[#13132B]/80 transition-all">
            <div className="flex items-center gap-2 text-brand-coral mb-2">
              <Coins className="w-5 h-5" />
              <span className="text-sm font-semibold">Tokens</span>
            </div>
            <p className="text-3xl font-black text-white">{laboratorio.tokens_disponiveis || 0}</p>
            <p className="text-xs text-gray-400">Disponíveis</p>
          </div>

          <div className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-xl hover:bg-[#13132B]/80 transition-all">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-semibold">Ativos</span>
            </div>
            <p className="text-3xl font-black text-white">{laboratorio.ativo ? "Sim" : "Não"}</p>
          </div>
        </div>

        {/* Informações */}
        <div className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4">Informações do Laboratório</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-400">Razão Social:</span>
              <span className="font-semibold text-white text-right ml-4">{laboratorio.razao_social}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-400">CNPJ:</span>
              <span className="font-semibold text-white text-right ml-4">{laboratorio.cnpj}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-400">Cidade:</span>
              <span className="font-semibold text-white text-right ml-4">{laboratorio.cidade} - {laboratorio.uf}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-400">Email:</span>
              <span className="font-semibold text-white text-right ml-4">{laboratorio.email}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-400">WhatsApp:</span>
              <span className="font-semibold text-white text-right ml-4">{laboratorio.whatsapp}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => navigate(createPageUrl("DetalheLaboratorio") + "?id=" + laboratorio.id)}
            className="py-4 bg-[#0a0a1a] border border-white/20 text-white font-bold rounded-2xl hover:border-brand-coral hover:text-brand-coral transition-all"
          >
            Ver Perfil Público
          </button>

          <button
            onClick={() => navigate(createPageUrl("ValidarClienteDoutorizze"))}
            className="py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all"
          >
            🎫 Validar Cliente Doutorizze
          </button>

          <button
            onClick={() => navigate(createPageUrl("ClientesDoutorizze"))}
            className="py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all"
          >
            👥 Meus Clientes Doutorizze
          </button>

          <button
            onClick={() => navigate(createPageUrl("EditarPerfil"))}
            className="py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-coral/20 hover:scale-[1.02] transition-all"
          >
            Editar Informações
          </button>
        </div>
      </div>
    </div>
  );
}