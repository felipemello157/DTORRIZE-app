import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Phone,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  Send,
  Building2,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import {
  buscarSubstituicao,
  candidatarSe,
  listarCandidatos
} from "@/components/api/substituicao";
import {
  formatarTextoData,
  formatarValor,
  calcularTempoRestante,
  podeSeCandidata
} from "@/components/constants/substituicao";

export default function DetalheSubstituicao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const vagaId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mensagem, setMensagem] = useState("");

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

  const { data: vaga, isLoading } = useQuery({
    queryKey: ["substituicao", vagaId, user?.vertical],
    queryFn: async () => {
      const result = await buscarSubstituicao(vagaId);

      // VALIDAR SE A SUBSTITUIÇÃO É DA ÁREA DO USUÁRIO
      if (result && user?.vertical) {
        const tipoProfissionalEsperado = user.vertical === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";
        if (result.tipo_profissional !== tipoProfissionalEsperado) {
          toast.error("⛔ Esta vaga não é da sua área de atuação");
          navigate(-1);
          return null;
        }
      }

      return result;
    },
    enabled: !!vagaId && !!user
  });

  const { data: candidatos = [] } = useQuery({
    queryKey: ["candidatos", vagaId],
    queryFn: async () => {
      const result = await listarCandidatos(vagaId);
      return result || [];
    },
    enabled: !!vagaId
  });

  const candidaturaMutation = useMutation({
    mutationFn: async () => {
      return await candidatarSe(vagaId, professional.id, mensagem);
    },
    onSuccess: () => {
      toast.success("Candidatura enviada com sucesso!");
      queryClient.invalidateQueries(["substituicao", vagaId]);
      queryClient.invalidateQueries(["candidatos", vagaId]);
      setShowConfirmModal(false);
      setMensagem("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar candidatura");
    }
  });

  const handleCandidatar = () => {
    if (!professional) {
      toast.error("Você precisa completar seu cadastro de profissional");
      return;
    }

    const verificacao = podeSeCandidata(professional, vaga);
    if (!verificacao.pode) {
      toast.error(verificacao.motivo);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmarCandidatura = () => {
    candidaturaMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 opacity-30">😕</div>
          <h3 className="text-2xl font-bold text-gray-400 mb-4">Vaga não encontrada</h3>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#13132B] border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const tempoRestante = calcularTempoRestante(vaga.expira_em);
  const jaCandidatou = candidatos.some(c => c.professional_id === professional?.id);
  const isUrgente = vaga.tipo_data === "IMEDIATO";

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-brand-coral/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <div className="relative pt-6 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#13132B] border-b border-white/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent opacity-50" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-6 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center text-3xl shadow-lg shadow-brand-orange/20">
              💼
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                {vaga.especialidade_necessaria}
              </h1>
              <p className="text-lg text-gray-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-orange" />
                {vaga.nome_clinica}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status e Badges */}
            <div className="flex flex-wrap gap-3">
              {isUrgente && (
                <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-xl animate-pulse flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  URGENTE - HOJE
                </span>
              )}
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-xl flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {vaga.tipo_data === "IMEDIATO" && "IMEDIATO"}
                {vaga.tipo_data === "DATA_ESPECIFICA" && "DATA ESPECÍFICA"}
                {vaga.tipo_data === "PERIODO" && "PERÍODO"}
              </span>
              {vaga.status === "ABERTA" && (
                <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Vaga Aberta
                </span>
              )}
            </div>

            {/* Tempo Restante */}
            {tempoRestante && !tempoRestante.expirado && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-brand-orange/20 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-orange/80 text-sm">Tempo para candidatura</p>
                    <p className="text-2xl font-black text-brand-orange">{tempoRestante.texto}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data e Horário */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-orange" />
                Data e Horário
              </h3>
              <div className="text-lg text-gray-300">
                {formatarTextoData(vaga)}
              </div>
            </motion.div>

            {/* Localização */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-orange" />
                Localização
              </h3>
              <div className="space-y-3">
                <p className="text-lg font-bold text-white">{vaga.nome_clinica}</p>
                <p className="text-gray-400">{vaga.endereco_completo}</p>
                <p className="text-gray-400">{vaga.cidade} / {vaga.uf}</p>
                {vaga.referencia && (
                  <p className="text-sm text-gray-500 bg-[#0a0a1a] p-3 rounded-lg border border-white/5">
                    📍 Referência: {vaga.referencia}
                  </p>
                )}
                {vaga.link_maps && (
                  <button
                    onClick={() => window.open(vaga.link_maps, "_blank")}
                    className="mt-2 inline-flex items-center gap-2 text-brand-orange font-bold hover:text-brand-coral transition-colors"
                  >
                    Ver no Google Maps
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Remuneração */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-orange" />
                Remuneração
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <p className="text-sm text-gray-500 mb-1">Tipo de Remuneração</p>
                  <p className="text-lg font-bold text-white">
                    {vaga.tipo_remuneracao === "DIARIA" ? "💵 Diária Fixa" : "📊 Porcentagem"}
                  </p>
                </div>

                {vaga.tipo_remuneracao === "DIARIA" && vaga.valor_diaria && (
                  <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                    <p className="text-sm text-gray-500 mb-1">Valor da Diária</p>
                    <p className="text-3xl font-black text-green-400">
                      {formatarValor(vaga.valor_diaria)}
                    </p>
                  </div>
                )}

                {vaga.tipo_remuneracao === "PORCENTAGEM" && vaga.procedimentos_porcentagem && (
                  <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                    <p className="text-sm text-gray-500 mb-3">Porcentagens por Procedimento</p>
                    <div className="space-y-2">
                      {vaga.procedimentos_porcentagem.map((proc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#13132B] rounded-lg p-3 border border-white/5">
                          <span className="text-gray-300">{proc.procedimento}</span>
                          <span className="font-bold text-green-400">{proc.porcentagem}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                    <p className="text-sm text-gray-500 mb-1">Forma de Pagamento</p>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-orange" />
                      {vaga.forma_pagamento?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                    <p className="text-sm text-gray-500 mb-1">Quem paga</p>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-orange" />
                      {vaga.quem_paga}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Observações */}
            {vaga.observacoes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
              >
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-orange" />
                  Observações
                </h3>
                <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{vaga.observacoes}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de Contato */}
            <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Contato</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Responsável</p>
                  <p className="font-bold text-white text-lg">{vaga.responsavel_nome}</p>
                  <p className="text-sm text-brand-orange">{vaga.responsavel_cargo}</p>
                </div>
                {vaga.responsavel_whatsapp && (
                  <button
                    onClick={() => window.open(`https://wa.me/55${vaga.responsavel_whatsapp}`, "_blank")}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/20"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp
                  </button>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Candidatos</span>
                  </div>
                  <span className="text-xl font-black text-white">{candidatos.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Visualizações</span>
                  </div>
                  <span className="text-xl font-black text-white">{vaga.visualizacoes || 0}</span>
                </div>
              </div>
            </div>

            {/* Requisitos */}
            <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Requisitos</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Especialidade</p>
                    <p className="text-gray-400">{vaga.especialidade_necessaria}</p>
                  </div>
                </div>
                {vaga.tempo_minimo_formado_anos > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircle className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Tempo de Formado</p>
                      <p className="text-gray-400">Mínimo {vaga.tempo_minimo_formado_anos} ano{vaga.tempo_minimo_formado_anos !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      {professional && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#13132B] border-t border-white/10 p-4 shadow-2xl z-50">
          <div className="max-w-6xl mx-auto flex gap-4">
            {jaCandidatou ? (
              <div className="flex-1 py-4 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-xl text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Você já se candidatou a esta vaga
              </div>
            ) : (
              <button
                onClick={handleCandidatar}
                disabled={vaga.status !== "ABERTA" || candidaturaMutation.isPending}
                className="flex-1 py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-black text-lg rounded-xl hover:shadow-lg hover:shadow-brand-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {candidaturaMutation.isPending ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    CANDIDATAR-SE AGORA
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#13132B] border border-white/10 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-brand-orange/10 flex items-center justify-center text-4xl mx-auto mb-4 border border-brand-orange/20">
                  🎯
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Confirmar Candidatura
                </h3>
                <p className="text-gray-400">
                  Deseja se candidatar a esta vaga de substituição?
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Conte um pouco sobre você e sua experiência..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 outline-none resize-none transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 border border-white/10 bg-[#0a0a1a] text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCandidatura}
                  disabled={candidaturaMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {candidaturaMutation.isPending ? "Enviando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}