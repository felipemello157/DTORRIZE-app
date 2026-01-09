import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Plus,
  Edit,
  Play,
  Pause,
  XCircle,
  Eye,
  Phone,
  Calendar,
  Tag,
  Package,
  ArrowLeft
} from "lucide-react";

export default function MinhasPromocoes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [activeTab, setActiveTab] = useState("ATIVO");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const supplierResult = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        setSupplier(supplierResult[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: promocoes = [], isLoading } = useQuery({
    queryKey: ["promocoes", supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      return await base44.entities.Promotion.filter({ supplier_id: supplier.id });
    },
    enabled: !!supplier?.id
  });

  // Mutation atualizar status
  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.Promotion.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocoes"] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  const handlePausar = (id) => {
    atualizarStatusMutation.mutate({ id, status: "PAUSADO" });
  };

  const handleAtivar = (id) => {
    atualizarStatusMutation.mutate({ id, status: "ATIVO" });
  };

  const handleEncerrar = (id) => {
    if (window.confirm("Tem certeza que deseja encerrar esta promoção?")) {
      atualizarStatusMutation.mutate({ id, status: "ENCERRADO" });
    }
  };

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "ATIVO", label: "Ativas", count: promocoes.filter(p => p.status === "ATIVO").length },
    { id: "RASCUNHO", label: "Rascunhos", count: promocoes.filter(p => p.status === "RASCUNHO").length },
    { id: "PAUSADO", label: "Pausadas", count: promocoes.filter(p => p.status === "PAUSADO").length },
    { id: "ENCERRADO", label: "Encerradas", count: promocoes.filter(p => p.status === "ENCERRADO").length }
  ];

  const promocoesFiltradas = activeTab === "ALL"
    ? promocoes
    : promocoes.filter(p => p.status === activeTab);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(createPageUrl("DashboardFornecedor"))}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Minhas Promoções</h1>
              <p className="text-gray-400">
                {promocoes.length} {promocoes.length === 1 ? "promoção cadastrada" : "promoções cadastradas"}
              </p>
            </div>
            <button
              onClick={() => navigate(createPageUrl("CriarPromocao"))}
              className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Nova
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/5 text-gray-500"
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Promoções */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary mx-auto mb-4"></div>
            <p className="text-gray-400 font-semibold">Carregando promoções...</p>
          </div>
        ) : promocoesFiltradas.length === 0 ? (
          <EstadoVazio activeTab={activeTab} navigate={navigate} />
        ) : (
          <div className="space-y-4">
            {promocoesFiltradas.map((promocao, index) => (
              <PromocaoCard
                key={promocao.id}
                promocao={promocao}
                index={index}
                onPausar={handlePausar}
                onAtivar={handleAtivar}
                onEncerrar={handleEncerrar}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PromocaoCard({ promocao, index, onPausar, onAtivar, onEncerrar, navigate }) {
  const statusConfig = {
    ATIVO: { label: "Ativo", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    PAUSADO: { label: "Pausado", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    RASCUNHO: { label: "Rascunho", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    ENCERRADO: { label: "Encerrado", color: "bg-red-500/10 text-red-400 border-red-500/20" }
  };

  const status = statusConfig[promocao.status] || statusConfig.RASCUNHO;

  const formatarData = (data) => {
    if (!data) return null;
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR");
  };

  const isExpirado = promocao.data_validade && new Date(promocao.data_validade) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 hover:shadow-2xl hover:border-brand-primary/30 transition-all group"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Imagem */}
        <div className="w-full md:w-24 h-48 md:h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
          {promocao.imagem_principal ? (
            <img
              src={promocao.imagem_principal}
              alt={promocao.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
              {status.label}
            </span>
            {promocao.desconto_percentual > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                {promocao.desconto_percentual}% OFF
              </span>
            )}
            {promocao.frete_gratis && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Frete Grátis
              </span>
            )}
            {isExpirado && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                Expirado
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">{promocao.titulo}</h3>

          {/* Preços */}
          <div className="flex items-center gap-3 mb-3">
            {promocao.preco_original && (
              <span className="text-gray-500 line-through text-sm">
                R$ {promocao.preco_original.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-black text-green-400">
              R$ {promocao.preco_promocional.toFixed(2)}
            </span>
          </div>

          {/* Métricas */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-brand-secondary" />
              <span>{promocao.visualizacoes || 0} visualizações</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-green-500" />
              <span>{promocao.cliques || 0} cliques WhatsApp</span>
            </div>
            {promocao.data_validade && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span>Válido até {formatarData(promocao.data_validade)}</span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(createPageUrl("EditarPromocao") + "/" + promocao.id)}
              className="px-4 py-2 border border-white/10 text-gray-300 font-semibold rounded-xl hover:border-brand-primary/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>

            {promocao.status === "ATIVO" && (
              <button
                onClick={() => onPausar(promocao.id)}
                className="px-4 py-2 border border-yellow-500/30 text-yellow-500 font-semibold rounded-xl hover:bg-yellow-500/10 transition-all flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </button>
            )}

            {(promocao.status === "PAUSADO" || promocao.status === "RASCUNHO") && (
              <button
                onClick={() => onAtivar(promocao.id)}
                className="px-4 py-2 border border-green-500/30 text-green-500 font-semibold rounded-xl hover:bg-green-500/10 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Ativar
              </button>
            )}

            {promocao.status !== "ENCERRADO" && (
              <button
                onClick={() => onEncerrar(promocao.id)}
                className="px-4 py-2 border border-red-500/30 text-red-500 font-semibold rounded-xl hover:bg-red-500/10 transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Encerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EstadoVazio({ activeTab, navigate }) {
  const mensagens = {
    ATIVO: {
      titulo: "Nenhuma promoção ativa",
      descricao: "Você não tem promoções ativas no momento"
    },
    RASCUNHO: {
      titulo: "Nenhum rascunho",
      descricao: "Você não tem rascunhos salvos"
    },
    PAUSADO: {
      titulo: "Nenhuma promoção pausada",
      descricao: "Você não tem promoções pausadas"
    },
    ENCERRADO: {
      titulo: "Nenhuma promoção encerrada",
      descricao: "Você não tem promoções encerradas"
    }
  };

  const msg = mensagens[activeTab] || {
    titulo: "Nenhuma promoção ainda",
    descricao: "Crie sua primeira promoção e alcance milhares de profissionais!"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-12 text-center"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center mx-auto mb-6 border border-white/5">
        <Tag className="w-12 h-12 text-brand-primary" />
      </div>
      <h3 className="text-2xl font-black text-white mb-2">{msg.titulo}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{msg.descricao}</p>
      <button
        onClick={() => navigate(createPageUrl("CriarPromocao"))}
        className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:scale-105 transition-all inline-flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Criar Promoção
      </button>
    </motion.div>
  );
}