import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Pause,
  Play,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Briefcase,
  ArrowLeft
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MeusAnuncios() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profs = await base44.entities.Professional.filter({ user_id: user.id });
        setProfessional(profs[0]);
      } catch (error) {
        // Silent error
      }
    };
    load();
  }, []);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["myProfessionalAds", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.ProfessionalAd.filter({ professional_id: professional.id });
    },
    enabled: !!professional
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProfessionalAd.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfessionalAds"] });
      toast.success("✅ Anúncio atualizado!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProfessionalAd.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfessionalAds"] });
      toast.success("🗑️ Anúncio excluído!");
    }
  });

  const handleToggleStatus = (ad) => {
    const novoStatus = ad.status === "ATIVO" ? "PAUSADO" : "ATIVO";
    updateMutation.mutate({ id: ad.id, data: { status: novoStatus } });
  };

  const handleDelete = (ad) => {
    if (window.confirm("Tem certeza que deseja excluir este anúncio?")) {
      deleteMutation.mutate(ad.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando anúncios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 relative z-10 mb-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Anúncios Profissionais</h1>
                <p className="text-gray-400">Gerencie sua disponibilidade para clínicas</p>
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl shadow-lg hover:shadow-brand-orange/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Criar Novo Anúncio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {ads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#13132B] rounded-3xl border border-white/10 p-12 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#0a0a1a] border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              Nenhum anúncio ativo
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Crie um anúncio profissional para que clínicas e hospitais possam encontrar você mais facilmente.
            </p>
            <button
              onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
              className="px-8 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-orange/20 transition-all hover:scale-[1.02]"
            >
              Criar Primeiro Anúncio
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {ads.map((ad, index) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#13132B] rounded-2xl border border-white/10 p-6 hover:border-brand-orange/30 transition-all group shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${ad.status === "ATIVO"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${ad.status === "ATIVO" ? "bg-green-400" : "bg-yellow-500"}`} />
                          {ad.status === "ATIVO" ? "Ativo" : "Pausado"}
                        </span>

                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(ad.created_date), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-orange transition-colors">
                        {ad.titulo}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {ad.descricao}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className="bg-[#0a0a1a] px-3 py-1.5 rounded-lg border border-white/5 text-xs text-gray-400 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-white font-medium">{ad.visualizacoes || 0}</span> visualizações
                        </div>
                        <div className="bg-[#0a0a1a] px-3 py-1.5 rounded-lg border border-white/5 text-xs text-gray-400 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-white font-medium">{ad.cidades_interesse?.length || 0}</span> cidades
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:border-l border-white/10 md:pl-6 md:h-full self-stretch">
                      <button
                        onClick={() => handleToggleStatus(ad)}
                        className={`p-3 rounded-xl border transition-all ${ad.status === "ATIVO"
                            ? "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            : "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          }`}
                        title={ad.status === "ATIVO" ? "Pausar anúncio" : "Ativar anúncio"}
                      >
                        {ad.status === "ATIVO" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => handleDelete(ad)}
                        className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Excluir anúncio"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}