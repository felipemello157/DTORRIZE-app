import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  Phone,
  Instagram,
  ExternalLink,
  Building2,
  Award,
  CheckCircle2,
  Send,
  X,
  Flag,
  AlertTriangle,
  Edit,
  ArrowLeft,
  Users
} from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

export default function DetalheVaga() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const profResult = await base44.entities.Professional.filter({ user_id: currentUser.id });
        setProfessional(profResult[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar vaga
  const { data: vaga, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;

      // MOCK DATA PARA VAGA (mantido do original)
      if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && id.startsWith("mock-")) {
        return {
          id: id,
          titulo: id === "mock-vaga-1" ? "Plantão Noturno UTI" : "Substituição Clínica",
          descricao: "Vaga para plantão noturno em UTI Geral. Necessário experiência mínima de 2 anos. Equipamentos de ponta e equipe multidisciplinar completa.\n\nÓtima oportunidade para quem busca estabilidade e boas condições de trabalho.",
          cidade: id === "mock-vaga-1" ? "São Paulo" : "Campinas",
          uf: "SP",
          tipo_vaga: id === "mock-vaga-1" ? "PLANTAO" : "SUBSTITUICAO",
          valor_proposto: id === "mock-vaga-1" ? 1200.00 : 800.00,
          tipo_remuneracao: "FIXO",
          horario_inicio: "19:00",
          horario_fim: "07:00",
          unit_id: "mock-unit-1",
          especialidades_aceitas: ["Cardiologia", "Clínica Geral"],
          falar_com: "Dra. Ana Silva",
          instagram_clinica: "hospitalsp",
          beneficios: "Alimentação no local, estacionamento gratuito.",
          exige_experiencia: true,
          tempo_experiencia_minimo: 2,
          selecao_dias: "ESPECIFICOS",
          dias_semana: ["Segunda", "Quarta"],
          status: "ABERTO",
          expira_em: new Date(Date.now() + 86400000).toISOString(), // Amanhã
          nome_clinica: "Hospital Central",
          endereco_completo: "Av. Paulista, 1000",
          visualizacoes: 154,
          responsavel_nome: "Dra. Ana Silva",
          responsavel_cargo: "Diretora Clínica",
          responsavel_whatsapp: "11999999999"
        };
      }

      const result = await base44.entities.Job.filter({ id });
      return result[0] || null;
    },
    enabled: !!id,
    retry: 1
  });

  // Buscar candidatos da vaga para saber se já se candidatou
  const { data: candidaturas = [] } = useQuery({
    queryKey: ["jobCandidates", id],
    queryFn: async () => {
      if (!id) return [];
      return await base44.entities.JobCandidate.filter({ job_id: id });
    },
    enabled: !!id
  });

  const jaCandidatou = candidaturas.some(c => c.professional_id === professional?.id);

  // Mutation de candidatura
  const candidaturaMutation = useMutation({
    mutationFn: async () => {
      // Mock para localhost
      if (id.startsWith("mock-")) {
        await new Promise(r => setTimeout(r, 1000));
        return { success: true };
      }
      return await base44.entities.JobCandidate.create({
        job_id: id,
        professional_id: professional.id,
        status: "PENDENTE",
        mensagem: mensagem
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jobCandidates", id]);
      toast.success("Candidatura enviada com sucesso!");
      setShowConfirmModal(false);
      setMensagem("");
    },
    onError: (error) => {
      toast.error("Erro ao enviar candidatura: " + error.message);
    }
  });

  // Formatação de helpers
  const formatarValor = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const handleCandidatar = () => {
    if (!professional) {
      toast.error("Complete seu perfil profissional para se candidatar");
      return;
    }
    setShowConfirmModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando vaga...</p>
        </div>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 opacity-30">🔍</div>
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
                {vaga.titulo}
              </h1>
              <p className="text-lg text-gray-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-orange" />
                {vaga.nome_clinica || "Confidencial"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-xl flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {vaga.tipo_vaga}
              </span>
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold rounded-xl flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {vaga.cidade} - {vaga.uf}
              </span>
              {vaga.status === "ABERTO" ? (
                <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Vaga Aberta
                </span>
              ) : (
                <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Fechada
                </span>
              )}
            </div>

            {/* Descrição */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h3 className="text-xl font-black text-white mb-4">Sobre a Vaga</h3>
              <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{vaga.descricao}</p>
            </motion.div>

            {/* Detalhes Técnicos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-orange" />
                Detalhes da Oportunidade
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <p className="text-sm text-gray-500 mb-1">Horário</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-orange" />
                    {vaga.horario_inicio} às {vaga.horario_fim}
                  </p>
                </div>

                <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <p className="text-sm text-gray-500 mb-1">Valor</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    {vaga.valor_proposto ? formatarValor(vaga.valor_proposto) : "A combinar"}
                  </p>
                </div>

                <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <p className="text-sm text-gray-500 mb-1">Dias da Semana</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vaga.dias_semana?.map((dia, idx) => (
                      <span key={idx} className="text-xs bg-white/5 px-2 py-1 rounded border border-white/5 text-gray-300">
                        {dia}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <p className="text-sm text-gray-500 mb-1">Especialidades</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vaga.especialidades_aceitas?.map((esp, idx) => (
                      <span key={idx} className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-1 rounded border border-brand-orange/20">
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
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
                <p className="text-gray-400">{vaga.endereco_completo || `${vaga.cidade} - ${vaga.uf}`}</p>

                {vaga.link_maps && (
                  <button
                    onClick={() => window.open(vaga.link_maps, "_blank")}
                    className="mt-2 inline-flex items-center gap-2 text-brand-orange font-bold hover:text-brand-coral transition-colors"
                  >
                    Ver no Google Maps
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de Contato */}
            <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Contato</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Falar com</p>
                  <p className="font-bold text-white text-lg">{vaga.falar_com || vaga.responsavel_nome}</p>
                </div>

                {vaga.instagram_clinica && (
                  <button
                    onClick={() => window.open(`https://instagram.com/${vaga.instagram_clinica.replace('@', '')}`, "_blank")}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                  >
                    <Instagram className="w-5 h-5" />
                    Instagram
                  </button>
                )}

                <ShareButton
                  title={vaga.titulo}
                  text={`Confira esta vaga de ${vaga.titulo} em ${vaga.cidade}`}
                  url={window.location.href}
                  className="w-full"
                />
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
                  <span className="text-xl font-black text-white">{candidaturas.length}</span>
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
                {vaga.exige_experiencia && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Experiência Necessária</p>
                      <p className="text-gray-400">Mínimo de {vaga.tempo_experiencia_minimo} anos</p>
                    </div>
                  </div>
                )}
                {vaga.beneficios && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Award className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Benefícios</p>
                      <p className="text-gray-400">{vaga.beneficios}</p>
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
                <CheckCircle2 className="w-6 h-6" />
                Você já se candidatou a esta vaga
              </div>
            ) : (
              <button
                onClick={handleCandidatar}
                disabled={vaga.status !== "ABERTO" || candidaturaMutation.isPending}
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
                  Você está se candidatando para <strong>{vaga.titulo}</strong>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Mensagem para o recrutador
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Olá, gostaria de me candidatar..."
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
                  onClick={() => candidaturaMutation.mutate()}
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