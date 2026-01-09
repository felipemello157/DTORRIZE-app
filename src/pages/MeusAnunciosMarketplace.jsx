import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  Eye,
  Pause,
  Play,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
  Plus,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  ATIVO: { label: "Ativo", color: "bg-green-500/10 text-green-400 border border-green-500/20", icon: CheckCircle },
  PAUSADO: { label: "Pausado", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20", icon: Pause },
  VENDIDO: { label: "Vendido", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20", icon: ShoppingBag },
  ENCERRADO: { label: "Encerrado", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20", icon: Package }
};

const tabs = [
  { id: "ATIVO", label: "Ativos", icon: CheckCircle },
  { id: "PAUSADO", label: "Pausados", icon: Pause },
  { id: "VENDIDO", label: "Vendidos", icon: ShoppingBag },
  { id: "ENCERRADO", label: "Encerrados", icon: Package }
];

export default function MeusAnunciosMarketplace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("ATIVO");
  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [anuncioSelecionado, setAnuncioSelecionado] = useState(null);

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

  // Buscar anúncios do usuário
  const { data: meusAnuncios = [], isLoading } = useQuery({
    queryKey: ["meusAnuncios", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.MarketplaceItem.filter({ anunciante_id: user.id });
    },
    enabled: !!user
  });

  // Filtrar por tab
  const anunciosFiltrados = meusAnuncios.filter(a => a.status === activeTab);

  // Contadores por status
  const contadores = {
    ATIVO: meusAnuncios.filter(a => a.status === "ATIVO").length,
    PAUSADO: meusAnuncios.filter(a => a.status === "PAUSADO").length,
    VENDIDO: meusAnuncios.filter(a => a.status === "VENDIDO").length,
    ENCERRADO: meusAnuncios.filter(a => a.status === "ENCERRADO").length
  };

  // Mutation para pausar/reativar
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, novoStatus }) => {
      return await base44.entities.MarketplaceItem.update(id, { status: novoStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meusAnuncios"]);
      toast.success("✅ Status atualizado!");
    }
  });

  // Mutation para excluir
  const excluirMutation = useMutation({
    mutationFn: async ({ id, motivo }) => {
      const status = motivo === "🎉 Vendi pela Doutorizze" ? "VENDIDO" : "ENCERRADO";
      return await base44.entities.MarketplaceItem.update(id, {
        status,
        motivo_encerramento: motivo,
        encerrado_em: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["meusAnuncios"]);
      if (variables.motivo === "🎉 Vendi pela Doutorizze") {
        toast.success("🎉 Parabéns pela venda!");
      } else {
        toast.success("✅ Anúncio encerrado!");
      }
      setExcluirModalOpen(false);
      setAnuncioSelecionado(null);
    }
  });

  const handlePausar = (anuncio) => {
    const novoStatus = anuncio.status === "PAUSADO" ? "ATIVO" : "PAUSADO";
    toggleStatusMutation.mutate({ id: anuncio.id, novoStatus });
  };

  const handleExcluir = (anuncio) => {
    setAnuncioSelecionado(anuncio);
    setExcluirModalOpen(true);
  };

  const confirmarExclusao = (motivo) => {
    if (anuncioSelecionado) {
      excluirMutation.mutate({ id: anuncioSelecionado.id, motivo });
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
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-brand-coral/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 relative z-10">

        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-coral to-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Meus Anúncios</h1>
              <p className="text-gray-400">Gerencie seus produtos anunciados</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0a0a1a] border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-black text-white">{meusAnuncios.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-[#0a0a1a] border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-black text-white">{contadores.ATIVO}</div>
              <div className="text-sm text-green-400">Ativos</div>
            </div>
            <div className="bg-[#0a0a1a] border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-black text-white">
                {meusAnuncios.reduce((sum, a) => sum + (a.visualizacoes || 0), 0)}
              </div>
              <div className="text-sm text-blue-400">Visualizações</div>
            </div>
            <div className="bg-[#0a0a1a] border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-black text-white">{contadores.VENDIDO}</div>
              <div className="text-sm text-brand-orange">Vendidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-[#0a0a1a]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border ${isActive
                      ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20"
                      : "bg-[#13132B] text-gray-400 border-white/5 hover:border-white/20 hover:text-white"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ml-1 ${isActive ? "bg-white/20 text-white" : "bg-white/5 text-gray-500"
                    }`}>
                    {contadores[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {anunciosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#13132B] border border-white/10 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              Nenhum anúncio {activeTab.toLowerCase()}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === "ATIVO"
                ? "Comece criando seu primeiro anúncio!"
                : `Você não tem anúncios ${activeTab.toLowerCase()} no momento.`
              }
            </p>
            {activeTab === "ATIVO" && (
              <button
                onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
                className="px-6 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl shadow-lg hover:shadow-brand-orange/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Criar Primeiro Anúncio
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {anunciosFiltrados.map((anuncio, index) => {
                const StatusIcon = statusConfig[anuncio.status]?.icon || Package;
                return (
                  <motion.div
                    key={anuncio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#13132B] rounded-3xl overflow-hidden border border-white/10 hover:border-brand-orange/50 transition-all hover:shadow-xl hover:shadow-black/50 group"
                  >
                    {/* Imagem */}
                    <div
                      className="h-48 bg-[#0a0a1a] relative overflow-hidden cursor-pointer"
                      onClick={() => navigate(createPageUrl("MarketplaceDetail") + "?id=" + anuncio.id)}
                    >
                      {anuncio.fotos && anuncio.fotos.length > 0 ? (
                        <img
                          src={anuncio.fotos[0]}
                          alt={anuncio.titulo_item}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-16 h-16 text-gray-700" />
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13132B] to-transparent opacity-60" />

                      {/* Badge Status */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1.5 ${statusConfig[anuncio.status]?.color} rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[anuncio.status]?.label}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors">
                        {anuncio.titulo_item}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-black text-brand-orange">
                          R$ {anuncio.preco?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {anuncio.visualizacoes || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(anuncio.created_date), { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(createPageUrl("MarketplaceDetail") + "?id=" + anuncio.id)}
                          className="flex-1 px-3 py-3 border border-white/10 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>

                        {anuncio.status === "ATIVO" && (
                          <button
                            onClick={() => handlePausar(anuncio)}
                            disabled={toggleStatusMutation.isPending}
                            className="px-3 py-3 border border-white/10 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all"
                            title="Pausar anúncio"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}

                        {anuncio.status === "PAUSADO" && (
                          <button
                            onClick={() => handlePausar(anuncio)}
                            disabled={toggleStatusMutation.isPending}
                            className="px-3 py-3 border border-green-500/30 bg-green-500/10 text-green-400 font-semibold rounded-xl hover:bg-green-500/20 disabled:opacity-50 transition-all"
                            title="Reativar anúncio"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        {(anuncio.status === "ATIVO" || anuncio.status === "PAUSADO") && (
                          <button
                            onClick={() => handleExcluir(anuncio)}
                            className="px-3 py-3 border border-red-500/30 bg-red-500/10 text-red-400 font-semibold rounded-xl hover:bg-red-500/20 transition-all"
                            title="Excluir/Encerrar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB - Criar Anúncio */}
      <button
        onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-brand-coral to-brand-orange text-white rounded-full shadow-2xl shadow-brand-orange/30 hover:scale-110 transition-all flex items-center justify-center z-40 border-2 border-white/20"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* MODAL DE EXCLUSÃO */}
      <AnimatePresence>
        {excluirModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExcluirModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13132B] border border-white/10 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Encerrar Anúncio</h3>
                    <p className="text-sm text-gray-400">Escolha o motivo do encerramento</p>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-3">
                <button
                  onClick={() => confirmarExclusao("🎉 Vendi pela Doutorizze")}
                  disabled={excluirMutation.isPending}
                  className="w-full p-4 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-left transition-all disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                      <ShoppingBag className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white group-hover:text-green-400 transition-colors">🎉 Vendi pela Doutorizze</p>
                      <p className="text-sm text-gray-400">Parabéns! Sua venda será contabilizada.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmarExclusao("❌ Desisti de vender")}
                  disabled={excluirMutation.isPending}
                  className="w-full p-4 border border-white/10 bg-[#0a0a1a] hover:bg-white/5 rounded-xl text-left transition-all disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">❌ Desisti de vender</p>
                      <p className="text-sm text-gray-400">O anúncio será encerrado.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmarExclusao("📤 Vendi por fora")}
                  disabled={excluirMutation.isPending}
                  className="w-full p-4 border border-white/10 bg-[#0a0a1a] hover:bg-white/5 rounded-xl text-left transition-all disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">📤 Vendi por fora</p>
                      <p className="text-sm text-gray-400">Vendi fora da plataforma.</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => setExcluirModalOpen(false)}
                  className="w-full py-3 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}