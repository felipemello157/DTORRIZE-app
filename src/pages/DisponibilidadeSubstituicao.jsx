import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Zap,
  ZapOff,
  Bell,
  BellOff,
  Info,
  X,
  Mail,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function DisponibilidadeSubstituicao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const { data: professionalData } = useQuery({
    queryKey: ["professional", professional?.id],
    queryFn: async () => {
      return await base44.entities.Professional.get(professional.id);
    },
    enabled: !!professional,
    initialData: professional
  });

  const [showJustificativaModal, setShowJustificativaModal] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const toggleMutation = useMutation({
    mutationFn: async ({ novoStatus, justificativa }) => {
      const hoje = new Date().toISOString().split('T')[0];
      const ativacoes = professionalData.ativacoes_hoje || 0;
      const desativacoes = professionalData.desativacoes_hoje || 0;
      const ultimaAtivacao = professionalData.ultima_ativacao || '';
      const ultimaDesativacao = professionalData.ultima_desativacao || '';

      // Verificar se última ação foi hoje
      const ultimaAcaoHoje = ultimaAtivacao.startsWith(hoje) || ultimaDesativacao.startsWith(hoje);

      // Se ativando
      if (novoStatus) {
        if (ultimaAcaoHoje && ativacoes >= 2) {
          throw new Error('Você já ativou 2 vezes hoje. Limite atingido.');
        }

        await base44.entities.Professional.update(professional.id, {
          disponivel_substituicao: true,
          status_disponibilidade_substituicao: 'ONLINE',
          ultima_atualizacao_status: new Date().toISOString(),
          ativacoes_hoje: ultimaAcaoHoje ? ativacoes + 1 : 1,
          ultima_ativacao: new Date().toISOString()
        });
      } else {
        // Desativando - exigir justificativa
        if (!justificativa || justificativa.trim().length < 10) {
          throw new Error('Justificativa obrigatória (mínimo 10 caracteres)');
        }

        if (ultimaAcaoHoje && desativacoes >= 2) {
          throw new Error('Você já desativou 2 vezes hoje. Limite atingido.');
        }

        await base44.entities.Professional.update(professional.id, {
          disponivel_substituicao: false,
          status_disponibilidade_substituicao: 'OFFLINE',
          ultima_atualizacao_status: new Date().toISOString(),
          desativacoes_hoje: ultimaAcaoHoje ? desativacoes + 1 : 1,
          ultima_desativacao: new Date().toISOString(),
          justificativa_desativacao: justificativa.trim()
        });
      }

      return { novoStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professional", professional.id]);
      toast.success("Status atualizado com sucesso!");
      setShowJustificativaModal(false);
      setJustificativa("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    }
  });

  const handleToggle = () => {
    const isOnline = professionalData.status_disponibilidade_substituicao === "ONLINE";

    // Se está desativando, mostrar modal de justificativa
    if (isOnline) {
      setShowJustificativaModal(true);
    } else {
      // Se está ativando, direto
      toggleMutation.mutate({ novoStatus: true, justificativa: null });
    }
  };

  const toggleNotificationMutation = useMutation({
    mutationFn: async (novoStatus) => {
      return await base44.entities.Professional.update(professional.id, {
        notificacao_som_ativa: novoStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professional", professional.id]);
      toast.success("Notificações atualizadas!");
    }
  });

  if (!professionalData) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  const isOnline = professionalData.status_disponibilidade_substituicao === "ONLINE";
  const notificacoesAtivas = professionalData.notificacao_som_ativa !== false;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24">
      {/* Header */}
      <div className={`py-8 mb-8 transition-all ${isOnline
          ? "bg-gradient-to-r from-green-600 via-emerald-700 to-teal-800"
          : "bg-gradient-to-r from-gray-800 via-gray-900 to-black"
        }`}>
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl mb-4 border border-white/10">
            {isOnline ? "⚡" : "💤"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            DISPONIBILIDADE
          </h1>
          <p className="text-white/80 text-lg">
            {isOnline ? "Você está ONLINE para substituições" : "Você está OFFLINE"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl">
        {/* Toggle Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl p-8 shadow-2xl mb-6 relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${isOnline ? "from-green-500/10 to-transparent" : "from-gray-500/10 to-transparent"
            } rounded-full blur-3xl -z-10`} />

          <div className="text-center mb-8">
            <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-6xl mb-6 border transition-all ${isOnline
                ? "bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                : "bg-white/5 border-white/10"
              }`}>
              {isOnline ? <Zap className="w-16 h-16 text-green-500" /> : <ZapOff className="w-16 h-16 text-gray-500" />}
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {isOnline ? "Você está ONLINE" : "Você está OFFLINE"}
            </h2>
            <p className="text-gray-400">
              {isOnline
                ? "Profissionais online recebem notificações de vagas urgentes em tempo real"
                : "Ative para começar a receber oportunidades de substituição"}
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className={`w-full py-6 rounded-2xl font-black text-xl transition-all shadow-lg hover:shadow-xl ${isOnline
                ? "bg-gray-700 text-white hover:bg-gray-600 border border-white/10"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-[1.02] shadow-green-500/20"
              }`}
          >
            {toggleMutation.isPending
              ? "Atualizando..."
              : isOnline
                ? "🔴 FICAR OFFLINE"
                : "🟢 FICAR ONLINE"}
          </button>
        </motion.div>

        {/* Configurações de Notificação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl mb-6"
        >
          <h3 className="text-xl font-black text-white mb-4">Notificações</h3>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              {notificacoesAtivas ? (
                <Bell className="w-6 h-6 text-yellow-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-500" />
              )}
              <div>
                <p className="font-bold text-white">Som de Notificação</p>
                <p className="text-sm text-gray-400">
                  {notificacoesAtivas ? "Ativado" : "Desativado"}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleNotificationMutation.mutate(!notificacoesAtivas)}
              disabled={toggleNotificationMutation.isPending}
              className={`w-14 h-8 rounded-full transition-all relative ${notificacoesAtivas ? "bg-green-600" : "bg-gray-700"
                }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${notificacoesAtivas ? "right-1" : "left-1"
                }`} />
            </button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl mb-6"
        >
          <h3 className="text-xl font-black text-white mb-4">Suas Estatísticas</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-green-500 mb-1">
                {professionalData.substituicoes_completadas || 0}
              </div>
              <div className="text-sm text-gray-400">Completadas</div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-yellow-500 mb-1">
                {professionalData.taxa_comparecimento || 100}%
              </div>
              <div className="text-sm text-gray-400">Comparecimento</div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-blue-500 mb-1">
                {professionalData.media_avaliacoes?.toFixed(1) || "N/A"}
              </div>
              <div className="text-sm text-gray-400">Avaliação Média</div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-purple-500 mb-1">
                {professionalData.total_avaliacoes || 0}
              </div>
              <div className="text-sm text-gray-400">Avaliações</div>
            </div>
          </div>
        </motion.div>

        {/* Contadores e Limites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl mb-6"
        >
          <h3 className="text-xl font-black text-white mb-4">Ativações Hoje</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/5 rounded-xl p-4 text-center border border-green-500/20">
              <div className="text-3xl font-black text-green-500 mb-1">
                {professionalData.ativacoes_hoje || 0}/2
              </div>
              <div className="text-sm text-gray-400">🟢 Ativações</div>
            </div>

            <div className="bg-red-500/5 rounded-xl p-4 text-center border border-red-500/20">
              <div className="text-3xl font-black text-red-500 mb-1">
                {professionalData.desativacoes_hoje || 0}/2
              </div>
              <div className="text-sm text-gray-400">🔴 Desativações</div>
            </div>
          </div>

          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-sm text-yellow-200/80">
              ⚠️ Máximo de 2 ativações e 2 desativações por dia para evitar instabilidade.
            </p>
          </div>
        </motion.div>

        {/* Suporte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-2xl p-6 border border-orange-500/20 mb-6"
        >
          <h3 className="text-lg font-black text-white mb-2">Precisa de Ajuda?</h3>
          <p className="text-sm text-gray-400 mb-4">
            Problemas técnicos ou dúvidas sobre o sistema de substituições?
          </p>
          <a
            href="mailto:felipe.mello@doutorizze.com.br?subject=Suporte - Disponibilidade Substituição"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            <Mail className="w-5 h-5" />
            Chamar Suporte
          </a>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6"
        >
          <div className="flex gap-3">
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Como funciona?</h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Quando ONLINE, você recebe notificações de vagas urgentes</li>
                <li>• Quanto mais rápido responder, maiores as chances de ser escolhido</li>
                <li>• Mantenha sua taxa de comparecimento alta para mais oportunidades</li>
                <li>• Justificativa obrigatória ao desativar (segurança)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Justificativa */}
      {showJustificativaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a2e] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Por que desativar?</h3>
              <button
                onClick={() => setShowJustificativaModal(false)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-sm text-yellow-200/80">
                  ⚠️ Justificativa obrigatória para garantir qualidade do sistema e evitar ativações/desativações excessivas.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Motivo da desativação *
                </label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Ex: Preciso focar em atendimentos já agendados hoje..."
                  className="w-full h-32 px-4 py-3 bg-[#13132B] border border-white/10 text-white rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none outline-none placeholder-gray-600"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{justificativa.length}/200 caracteres</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowJustificativaModal(false);
                    setJustificativa("");
                  }}
                  className="flex-1 py-3 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (justificativa.trim().length < 10) {
                      toast.error("Justificativa deve ter no mínimo 10 caracteres");
                      return;
                    }
                    toggleMutation.mutate({ novoStatus: false, justificativa });
                  }}
                  disabled={toggleMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {toggleMutation.isPending ? "Desativando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}