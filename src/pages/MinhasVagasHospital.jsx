import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Users, Eye, Pause, Play, CheckCircle2, Trash2, Calendar, MapPin, Clock } from "lucide-react";

export default function MinhasVagasHospital() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const loadHospital = async () => {
      try {
        const user = await base44.auth.me();
        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id });
        setHospital(hospitals[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadHospital();
  }, []);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["hospitalJobs", hospital?.id],
    queryFn: async () => {
      if (!hospital) return [];
      return await base44.entities.Job.filter({ unit_id: hospital.id });
    },
    enabled: !!hospital
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalJobs"] });
      toast.success("Vaga atualizada!");
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalJobs"] });
      toast.success("Vaga excluída!");
    }
  });

  const handlePausarAtivar = (job) => {
    const novoStatus = job.status === "ABERTO" ? "PAUSADO" : "ABERTO";
    updateJobMutation.mutate({ id: job.id, data: { status: novoStatus } });
  };

  const vagasFiltradas = jobs.filter(job => {
    if (filtroStatus === "TODAS") return true;
    if (filtroStatus === "ABERTAS") return job.status === "ABERTO";
    if (filtroStatus === "PAUSADAS") return job.status === "PAUSADO";
    if (filtroStatus === "PREENCHIDAS") return job.status === "PREENCHIDO";
    return true;
  });

  const statusConfig = {
    ABERTO: { label: "Aberta", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    PAUSADO: { label: "Pausada", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    PREENCHIDO: { label: "Preenchida", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Minhas Vagas - Hospital</h1>
            <p className="text-gray-400 mt-1">Gerencie suas oportunidades</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("CriarVagaHospital"))}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-primary/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Vaga
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {["TODAS", "ABERTAS", "PAUSADAS", "PREENCHIDAS"].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroStatus(filtro)}
              className={`px-4 py-3 rounded-xl font-bold transition-all ${filtroStatus === filtro
                  ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                  : "bg-[#13132B] border border-white/10 text-gray-400 hover:bg-white/5"
                }`}
            >
              {filtro}
            </button>
          ))}
        </div>

        {vagasFiltradas.length === 0 ? (
          <div className="bg-[#13132B] border border-white/10 rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6">🏥</div>
            <h3 className="text-2xl font-bold text-white mb-2">Nenhuma vaga encontrada</h3>
            <button
              onClick={() => navigate(createPageUrl("CriarVagaHospital"))}
              className="mt-4 px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Criar Primeira Vaga
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vagasFiltradas.map((job) => {
              const statusInfo = statusConfig[job.status] || statusConfig.ABERTO;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#13132B] border border-white/10 rounded-2xl shadow-lg p-6 hover:bg-[#1A1A35] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 ${statusInfo.color} border font-bold rounded-full text-xs`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{job.titulo}</h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">{job.descricao}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                          <MapPin className="w-4 h-4 text-brand-primary" />
                          <span>{job.cidade} - {job.uf}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                          <Calendar className="w-4 h-4 text-brand-primary" />
                          <span>{new Date(job.created_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {job.status !== "PREENCHIDO" && (
                        <button
                          onClick={() => handlePausarAtivar(job)}
                          className="p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 text-white transition-colors"
                          title={job.status === "ABERTO" ? "Pausar Vaga" : "Ativar Vaga"}
                        >
                          {job.status === "ABERTO" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}