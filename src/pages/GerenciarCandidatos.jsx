import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Briefcase,
  CheckCircle,
  Phone,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { listarCandidatos, escolherCandidato } from "@/components/api/substituicao";
import { formatarTextoData, STATUS_SUBSTITUICAO } from "@/components/constants/substituicao";

export default function GerenciarCandidatos() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const substituicaoId = urlParams.get("id");
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);

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

  const { data: substituicao, isLoading: loadingVaga } = useQuery({
    queryKey: ["substituicao", substituicaoId],
    queryFn: async () => {
      return await base44.entities.SubstituicaoUrgente.get(substituicaoId);
    },
    enabled: !!substituicaoId
  });

  const { data: candidatos = [], isLoading: loadingCandidatos } = useQuery({
    queryKey: ["candidatos", substituicaoId],
    queryFn: async () => {
      return await listarCandidatos(substituicaoId);
    },
    enabled: !!substituicaoId
  });

  const escolherMutation = useMutation({
    mutationFn: async () => {
      return await escolherCandidato(substituicaoId, candidatoSelecionado.id, user.id);
    },
    onSuccess: () => {
      toast.success("Candidato escolhido! Aguardando confirmação da clínica.");
      queryClient.invalidateQueries(["substituicao", substituicaoId]);
      queryClient.invalidateQueries(["candidatos", substituicaoId]);
      setShowConfirmModal(false);
      setCandidatoSelecionado(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao escolher candidato");
    }
  });

  const handleEscolher = (candidato) => {
    setCandidatoSelecionado(candidato);
    setShowConfirmModal(true);
  };

  if (loadingVaga || loadingCandidatos) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary"></div>
      </div>
    );
  }

  if (!substituicao) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-50 grayscale">😕</div>
          <h3 className="text-2xl font-bold text-gray-400 mb-4">Vaga não encontrada</h3>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/80 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_SUBSTITUICAO[substituicao.status] || {};

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      {/* Header */}
      <div className="bg-[#13132B]/80 backdrop-blur-md border-b border-white/10 py-6 mb-8 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 font-bold mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">
                {substituicao.especialidade_necessaria}
              </h1>
              <p className="text-gray-400">{substituicao.nome_clinica}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Info da Vaga */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#13132B] rounded-2xl p-6 border border-white/10 shadow-xl sticky top-32">
              <h3 className="text-lg font-black text-white mb-4">Informações da Vaga</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${statusConfig.color === "green" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      statusConfig.color === "blue" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        statusConfig.color === "yellow" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          statusConfig.color === "red" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Data e Horário</p>
                  <p className="font-bold text-white">{formatarTextoData(substituicao)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Local</p>
                  <p className="text-gray-300">{substituicao.cidade} / {substituicao.uf}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Total de Candidatos</p>
                  <p className="text-2xl font-black text-white">{candidatos.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main - Lista de Candidatos */}
          <div className="lg:col-span-2">
            <div className="bg-[#13132B] rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
              <h3 className="text-2xl font-black text-white mb-2">Candidatos</h3>
              <p className="text-gray-400 mb-6">
                Escolha o profissional ideal para esta substituição
              </p>

              {candidatos.length === 0 ? (
                <div className="text-center py-12 bg-[#0a0a1a] rounded-xl border border-dashed border-white/10">
                  <div className="text-6xl mb-4 opacity-30 grayscale">👤</div>
                  <p className="text-gray-500 font-bold">
                    Nenhum candidato ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidatos.map(candidato => (
                    <CandidatoCard
                      key={candidato.id}
                      candidato={candidato}
                      onEscolher={() => handleEscolher(candidato)}
                      disabled={substituicao.status !== "EM_SELECAO" && substituicao.status !== "ABERTA"}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13132B] rounded-3xl border border-white/10 p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-[50px] pointer-events-none"></div>

              <div className="text-center mb-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-4xl mx-auto mb-4">
                  ✅
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Confirmar Escolha
                </h3>
                <p className="text-gray-400">
                  Você está escolhendo <span className="font-bold text-white">{candidatoSelecionado?.professional.nome_completo}</span> para esta substituição.
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 relative z-10">
                <p className="text-sm text-yellow-500 font-medium">
                  ⚠️ Após confirmar, será enviada uma mensagem no WhatsApp do responsável da clínica para autorizar a substituição.
                </p>
              </div>

              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => escolherMutation.mutate()}
                  disabled={escolherMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all disabled:opacity-50"
                >
                  {escolherMutation.isPending ? "Confirmando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CandidatoCard({ candidato, onEscolher, disabled }) {
  const prof = candidato.professional;

  return (
    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 hover:border-brand-primary/50 transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-xl flex-shrink-0 group-hover:border-brand-primary/30 transition-colors">
          {prof.nome_completo?.charAt(0)}
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-black text-white mb-1">
            {prof.nome_completo}
          </h4>
          <p className="text-sm text-gray-400 mb-3">
            {prof.especialidade_principal} • {prof.tempo_formado_anos} anos de formado
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/5">
              <Star className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
              <span className="font-bold text-white text-sm">{prof.media_avaliacoes || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="font-bold text-white text-sm">{prof.taxa_comparecimento || 100}%</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-white text-sm">{prof.substituicoes_completadas || 0}</span>
            </div>
          </div>

          {candidato.mensagem_profissional && (
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-300 italic">
                "{candidato.mensagem_profissional}"
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onEscolher}
              disabled={disabled}
              className="flex-1 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl opacity-90 hover:opacity-100 hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              Escolher Profissional
            </button>
            <a
              href={`https://wa.me/55${prof.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 font-bold rounded-xl hover:bg-green-500/20 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}