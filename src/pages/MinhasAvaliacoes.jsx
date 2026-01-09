import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft,
  Star,
  Clock,
  Calendar,
  CheckCircle,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhasAvaliacoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // PROFISSIONAL | CLINICA
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("PENDENTES");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Detectar tipo de usuário
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (professionals.length > 0) {
          setUserType("PROFISSIONAL");
          setUserId(professionals[0].id);
          return;
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        if (owners.length > 0) {
          setUserType("CLINICA");
          setUserId(owners[0].id);
          return;
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar contratos
  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts", userId, userType],
    queryFn: async () => {
      if (!userId || !userType) return [];

      const filter = userType === "PROFISSIONAL"
        ? { professional_id: userId }
        : { unit_id: userId };

      return await base44.entities.JobContract.filter(filter);
    },
    enabled: !!userId && !!userType
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings", userId, userType],
    queryFn: async () => {
      if (!userId || !userType) return [];

      const allRatings = await base44.entities.Rating.list();
      return allRatings.filter(r =>
        r.avaliador_id === userId || r.avaliado_id === userId
      );
    },
    enabled: !!userId && !!userType
  });

  // Buscar dados relacionados
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: () => base44.entities.Professional.list(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => base44.entities.CompanyUnit.list(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => base44.entities.Job.list(),
  });

  // Contratos pendentes de avaliação
  const contratosPendentes = contracts.filter(contract => {
    if (contract.status !== "ATIVO") return false;

    const campoAvaliacao = userType === "PROFISSIONAL"
      ? "avaliacao_dentista_feita"
      : "avaliacao_clinica_feita";

    return !contract[campoAvaliacao];
  });

  // Avaliações realizadas
  const avaliacoesRealizadas = ratings.filter(r => r.avaliador_id === userId);

  // Avaliações recebidas
  const avaliacoesRecebidas = ratings.filter(r => r.avaliado_id === userId);

  // Média das avaliações recebidas
  const mediaAvaliacoes = avaliacoesRecebidas.length > 0
    ? (avaliacoesRecebidas.reduce((sum, r) => sum + r.nota, 0) / avaliacoesRecebidas.length).toFixed(1)
    : 0;

  const renderStars = (nota) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= nota ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
              }`}
          />
        ))}
      </div>
    );
  };

  const getOutraParteInfo = (contract) => {
    if (userType === "PROFISSIONAL") {
      const unit = units.find(u => u.id === contract.unit_id);
      return {
        nome: unit?.nome_fantasia || "Clínica",
        tipo: "Clínica"
      };
    } else {
      const prof = professionals.find(p => p.id === contract.professional_id);
      return {
        nome: prof?.nome_completo || "Profissional",
        tipo: "Profissional"
      };
    }
  };

  const getJobInfo = (contract) => {
    const job = jobs.find(j => j.id === contract.job_id);
    return job?.titulo || "Vaga";
  };

  const getDiasRestantes = (contract) => {
    const expiresAt = new Date(contract.token_expires_at);
    const hoje = new Date();
    return differenceInDays(expiresAt, hoje);
  };

  if (!user || !userType) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Star className="w-7 h-7 fill-white/20" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Minhas Avaliações</h1>
              <p className="text-gray-400">Gerencie seu feedback e reputação</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#13132B]/60 backdrop-blur border border-white/5 rounded-2xl p-1.5 mb-8 flex gap-1">
          <button
            onClick={() => setActiveTab("PENDENTES")}
            className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "PENDENTES"
                ? "bg-brand-primary text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Clock className="w-4 h-4" />
            Pendentes
            {contratosPendentes.length > 0 && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {contratosPendentes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("REALIZADAS")}
            className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "REALIZADAS"
                ? "bg-brand-primary text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            Realizadas
          </button>
          <button
            onClick={() => setActiveTab("RECEBIDAS")}
            className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "RECEBIDAS"
                ? "bg-brand-primary text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            Recebidas
          </button>
        </div>

        {/* Tab Pendentes */}
        {activeTab === "PENDENTES" && (
          <div className="space-y-4">
            {contratosPendentes.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                titulo="Nenhuma avaliação pendente"
                descricao="Você está em dia com suas avaliações!"
              />
            ) : (
              contratosPendentes.map((contract, index) => {
                const outraParte = getOutraParteInfo(contract);
                const jobTitulo = getJobInfo(contract);
                const diasRestantes = getDiasRestantes(contract);

                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#13132B] border border-white/5 rounded-2xl p-6 hover:border-brand-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap mobile:flex-col">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 border border-white/10">
                          {outraParte.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg group-hover:text-brand-primary transition-colors">
                            {outraParte.nome}
                          </h3>
                          <p className="text-gray-400 text-sm mb-1">{outraParte.tipo} • {jobTitulo}</p>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(contract.created_date), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>

                          {diasRestantes >= 0 && (
                            <div className={`flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg w-fit text-xs font-bold ${diasRestantes <= 2
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              }`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {diasRestantes === 0
                                  ? "Expira hoje"
                                  : `${diasRestantes} dia${diasRestantes > 1 ? "s" : ""} restante${diasRestantes > 1 ? "s" : ""}`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const token = userType === "PROFISSIONAL"
                            ? contract.token_dentista
                            : contract.token_clinica;
                          const targetPage = userType === "PROFISSIONAL"
                            ? "AvaliarClinica"
                            : "AvaliarProfissional";
                          navigate(createPageUrl(targetPage) + `?token=${token}`);
                        }}
                        className="px-6 py-3 bg-brand-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-brand-primary/20 hover:scale-105 transition-all whitespace-nowrap mobile:w-full"
                      >
                        Avaliar Agora
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Realizadas */}
        {activeTab === "REALIZADAS" && (
          <div className="space-y-4">
            {avaliacoesRealizadas.length === 0 ? (
              <EmptyState
                icon={Star}
                titulo="Você ainda não avaliou ninguém"
                descricao="Suas avaliações aparecerão aqui"
              />
            ) : (
              avaliacoesRealizadas.map((rating, index) => {
                const avaliado = rating.avaliado_tipo === "DENTISTA"
                  ? professionals.find(p => p.id === rating.avaliado_id)
                  : units.find(u => u.id === rating.avaliado_id);

                return (
                  <motion.div
                    key={rating.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#13132B] border border-white/5 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0a0a1a] border border-white/10 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {(avaliado?.nome_completo || avaliado?.nome_fantasia || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-white text-lg">
                              {avaliado?.nome_completo || avaliado?.nome_fantasia || "Usuário"}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {rating.avaliado_tipo === "DENTISTA" ? "Profissional" : "Clínica"}
                            </p>
                          </div>
                          {renderStars(rating.nota)}
                        </div>

                        {rating.comentario && (
                          <div className="mt-3 p-3 bg-[#0a0a1a] rounded-xl border border-white/5 text-gray-300 text-sm italic">
                            "{rating.comentario}"
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            Avaliado em {format(new Date(rating.created_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Recebidas */}
        {activeTab === "RECEBIDAS" && (
          <>
            {avaliacoesRecebidas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#13132B] to-[#0a0a1a] border border-brand-primary/20 rounded-2xl p-6 mb-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Sua Média Geral</h2>
                    <p className="text-gray-400 text-sm">Baseado em {avaliacoesRecebidas.length} avaliação{avaliacoesRecebidas.length !== 1 && "ões"}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="text-5xl font-black text-white">{mediaAvaliacoes}</div>
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                    {renderStars(Math.round(parseFloat(mediaAvaliacoes)))}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {avaliacoesRecebidas.length === 0 ? (
                <EmptyState
                  icon={Star}
                  titulo="Você ainda não recebeu avaliações"
                  descricao="Assim que uma clínica te avaliar, aparecerá aqui."
                />
              ) : (
                avaliacoesRecebidas.map((rating, index) => {
                  const avaliador = rating.avaliador_tipo === "DENTISTA"
                    ? professionals.find(p => p.id === rating.avaliador_id)
                    : units.find(u => u.id === rating.avaliador_id);

                  return (
                    <motion.div
                      key={rating.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#13132B] border border-white/5 rounded-2xl p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0a0a1a] border border-white/10 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {(avaliador?.nome_completo || avaliador?.nome_fantasia || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-white text-lg">
                                {avaliador?.nome_completo || avaliador?.nome_fantasia || "Usuário"}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {rating.avaliador_tipo === "DENTISTA" ? "Profissional" : "Clínica"}
                              </p>
                            </div>
                            {renderStars(rating.nota)}
                          </div>

                          {rating.comentario && (
                            <div className="mt-3 p-3 bg-[#0a0a1a] rounded-xl border border-white/5 text-gray-300 text-sm italic">
                              "{rating.comentario}"
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-3">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              Recebida em {format(new Date(rating.created_date), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente de Estado Vazio
function EmptyState({ icon: Icon, titulo, descricao }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#13132B] border border-white/10 rounded-3xl p-12 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-xl font-black text-white mb-2">{titulo}</h3>
      <p className="text-gray-400">{descricao}</p>
    </motion.div>
  );
}