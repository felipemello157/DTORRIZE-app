import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  podeAtivar,
  podeDesativar,
  ativarDisponibilidade,
  desativarDisponibilidade,
  NIVEIS_PENALIDADE,
  EMAIL_SUPORTE,
  deveMostrarBotaoSuporte
} from "@/components/api/penalidades";
import {
  ChevronLeft,
  Wifi,
  WifiOff,
  MapPin,
  Zap,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Shield,
  Mail,
  X
} from "lucide-react";

export default function StatusDisponibilidade() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [modalJustificativa, setModalJustificativa] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: professional, isLoading } = useQuery({
    queryKey: ["meu-profissional-status", user?.id],
    queryFn: async () => {
      const results = await base44.entities.Professional.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user?.id
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (novoStatus) => {
      await base44.entities.Professional.update(professional.id, {
        status_disponibilidade_substituicao: novoStatus,
        ultima_atualizacao_status: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meu-profissional-status"]);
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status")
  });

  const toggleSomMutation = useMutation({
    mutationFn: async (ativo) => {
      await base44.entities.Professional.update(professional.id, {
        notificacao_som_ativa: ativo
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meu-profissional-status"]);
      toast.success("Configuração atualizada!");
    }
  });

  const toggleDisponibilidadeMutation = useMutation({
    mutationFn: async ({ disponivel, justificativa }) => {
      if (disponivel) {
        // Ativar com verificação de penalidades
        await ativarDisponibilidade(professional.id);
      } else {
        // Desativar com justificativa obrigatória
        await desativarDisponibilidade(professional.id, justificativa);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meu-profissional-status"]);
      toast.success(professional?.disponivel_substituicao ? "Agora você está offline" : "Agora você está online!");
      setModalJustificativa(false);
      setJustificativa("");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleToggleDisponibilidade = async () => {
    const novoEstado = !professional?.disponivel_substituicao;

    if (novoEstado) {
      // ATIVAR - verificar penalidades
      const verificacao = await podeAtivar(professional);
      if (!verificacao.pode) {
        toast.error(verificacao.motivo);
        return;
      }
      toggleDisponibilidadeMutation.mutate({ disponivel: true });
    } else {
      // DESATIVAR - exigir justificativa
      const verificacao = podeDesativar(professional);
      if (!verificacao.pode) {
        toast.error(verificacao.motivo);
        return;
      }
      setModalJustificativa(true);
    }
  };

  const confirmarDesativacao = () => {
    if (!justificativa || justificativa.trim().length < 10) {
      toast.error("Justificativa obrigatória (mínimo 10 caracteres)");
      return;
    }
    toggleDisponibilidadeMutation.mutate({ disponivel: false, justificativa });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="bg-[#13132B] rounded-3xl p-8 text-center shadow-xl border border-white/10">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Perfil não encontrado</h2>
          <button
            onClick={() => navigate(createPageUrl("CadastroProfissional"))}
            className="mt-4 px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            Completar Cadastro
          </button>
        </div>
      </div>
    );
  }

  const isOnline = professional.status_disponibilidade_substituicao === "ONLINE";
  const disponivel = professional.disponivel_substituicao;
  const somAtivo = professional.notificacao_som_ativa !== false;
  const nivelPenalidade = professional.nivel_penalidade || 0;
  const estaBloqueado = professional.data_desbloqueio && new Date(professional.data_desbloqueio) > new Date();
  const mostrarSuporte = deveMostrarBotaoSuporte(professional);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24">
      {/* Header */}
      <div className={`px-4 py-6 transition-colors ${isOnline ? "bg-gradient-to-r from-green-600 to-emerald-700" : "bg-gradient-to-r from-gray-700 to-gray-800"}`}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isOnline ? "bg-white/20" : "bg-white/10"}`}>
              {isOnline ? <Wifi className="w-8 h-8 text-white" /> : <WifiOff className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Status de Disponibilidade</h1>
              <p className="text-white/80">
                {isOnline ? "Você está online para substituições" : "Você está offline"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Alerta de Bloqueio/Penalidade */}
        {estaBloqueado && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-200 mb-1">🚫 Conta Bloqueada</h3>
                <p className="text-red-300 text-sm mb-2">
                  Nível {nivelPenalidade}: {NIVEIS_PENALIDADE[nivelPenalidade]?.label}
                </p>
                <p className="text-red-400 text-sm">
                  Desbloqueio em: {new Date(professional.data_desbloqueio).toLocaleString('pt-BR')}
                </p>
                {mostrarSuporte && (
                  <a
                    href={`mailto:${EMAIL_SUPORTE}?subject=Solicito desbloqueio da conta&body=Meu ID: ${professional.id}%0A%0AMotivo do contato:%0A`}
                    className="mt-4 w-full py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all"
                  >
                    <Mail className="w-5 h-5" />
                    Chamar Suporte
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Aviso de Penalidade (sem bloqueio) */}
        {nivelPenalidade >= 1 && !estaBloqueado && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-bold text-yellow-200">⚠️ Aviso - Nível {nivelPenalidade}</p>
                <p className="text-yellow-100/80 text-sm">Evite ativar/desativar excessivamente (limite: 2x/dia)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Limites do Dia */}
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-brand-primary">Ativações hoje:</span>
            <span className={`font-bold ${(professional.ativacoes_hoje || 0) >= 2 ? 'text-red-400' : 'text-white'}`}>
              {professional.ativacoes_hoje || 0}/2
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-primary">Desativações hoje:</span>
            <span className={`font-bold ${(professional.desativacoes_hoje || 0) >= 2 ? 'text-red-400' : 'text-white'}`}>
              {professional.desativacoes_hoje || 0}/2
            </span>
          </div>
        </div>

        {/* Toggle principal */}
        <div className="bg-[#13132B] rounded-3xl p-6 shadow-xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Disponível para Substituições</h2>
              <p className="text-gray-400 text-sm">Ative para receber notificações de plantões urgentes</p>
            </div>
            <button
              onClick={handleToggleDisponibilidade}
              disabled={toggleDisponibilidadeMutation.isPending || estaBloqueado}
              className={`relative w-16 h-8 rounded-full transition-colors ${estaBloqueado
                  ? "bg-gray-700 cursor-not-allowed"
                  : disponivel ? "bg-green-500" : "bg-gray-700"
                }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${disponivel ? "left-9" : "left-1"}`} />
            </button>
          </div>

          {disponivel && (
            <>
              {/* Status Online/Offline */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="font-bold text-white mb-4">Seu Status Atual</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleStatusMutation.mutate("ONLINE")}
                    disabled={toggleStatusMutation.isPending}
                    className={`p-4 rounded-2xl border transition-all ${isOnline
                        ? "border-green-500 bg-green-500/10"
                        : "border-white/10 hover:border-green-500/50"
                      }`}
                  >
                    <Wifi className={`w-8 h-8 mx-auto mb-2 ${isOnline ? "text-green-500" : "text-gray-400"}`} />
                    <p className={`font-bold ${isOnline ? "text-green-400" : "text-gray-400"}`}>Online</p>
                    <p className="text-xs text-gray-400">Recebendo alertas</p>
                  </button>

                  <button
                    onClick={() => toggleStatusMutation.mutate("OFFLINE")}
                    disabled={toggleStatusMutation.isPending}
                    className={`p-4 rounded-2xl border transition-all ${!isOnline
                        ? "border-gray-500 bg-gray-700/30"
                        : "border-white/10 hover:border-gray-500/50"
                      }`}
                  >
                    <WifiOff className={`w-8 h-8 mx-auto mb-2 ${!isOnline ? "text-gray-300" : "text-gray-600"}`} />
                    <p className={`font-bold ${!isOnline ? "text-gray-200" : "text-gray-500"}`}>Offline</p>
                    <p className="text-xs text-gray-500">Pausado</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Configurações de notificação */}
        <div className="bg-[#13132B] rounded-3xl p-6 shadow-xl border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">Configurações de Alerta</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                {somAtivo ? <Volume2 className="w-6 h-6 text-brand-primary" /> : <VolumeX className="w-6 h-6 text-gray-500" />}
                <div>
                  <p className="font-bold text-white">Som de Notificação</p>
                  <p className="text-sm text-gray-400">Alerta sonoro para novas substituições</p>
                </div>
              </div>
              <button
                onClick={() => toggleSomMutation.mutate(!somAtivo)}
                disabled={toggleSomMutation.isPending}
                className={`w-12 h-6 rounded-full transition-colors ${somAtivo ? "bg-brand-primary" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${somAtivo ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-[#13132B] rounded-3xl p-6 shadow-xl border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">Suas Estatísticas</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{professional.substituicoes_completadas || 0}</p>
              <p className="text-sm text-gray-400">Substituições</p>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{professional.taxa_comparecimento?.toFixed(0) || 100}%</p>
              <p className="text-sm text-gray-400">Comparecimento</p>
            </div>
          </div>

          {professional.esta_suspenso && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">Você está suspenso</span>
              </div>
              <p className="text-red-300 text-sm mt-1">
                {professional.motivo_suspensao || "Entre em contato com o suporte."}
              </p>
            </div>
          )}
        </div>

        {/* Cidades de atendimento */}
        {professional.cidades_atendimento?.length > 0 && (
          <div className="bg-[#13132B] rounded-3xl p-6 shadow-xl border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-primary" />
              Cidades de Atendimento
            </h2>
            <div className="flex flex-wrap gap-2">
              {professional.cidades_atendimento.map((cidade, i) => (
                <span key={i} className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg text-sm font-medium">
                  {cidade}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate(createPageUrl("DisponibilidadeSubstituicao"))}
              className="w-full mt-4 py-3 border border-brand-primary/50 text-brand-primary font-bold rounded-xl hover:bg-brand-primary/10 transition-all"
            >
              Editar Disponibilidade
            </button>
          </div>
        )}

        {/* Modal de Justificativa */}
        <AnimatePresence>
          {modalJustificativa && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setModalJustificativa(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-white">Por que está desativando?</h3>
                  <button
                    onClick={() => setModalJustificativa(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  Justificativa obrigatória para prevenir ativações/desativações excessivas
                </p>

                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Descreva o motivo (mínimo 10 caracteres)..."
                  className="w-full min-h-[120px] px-4 py-3 bg-[#13132B] border border-white/10 text-white rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none resize-none placeholder-gray-500"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{justificativa.length}/500</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setModalJustificativa(false)}
                    className="flex-1 py-3 border border-white/20 text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarDesativacao}
                    disabled={toggleDisponibilidadeMutation.isPending || justificativa.trim().length < 10}
                    className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {toggleDisponibilidadeMutation.isPending ? "Desativando..." : "Confirmar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}