import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  Phone,
  Star,
  Plus,
  Package,
  CheckCircle,
  Clock,
  Zap,
  MessageCircle,
  Camera,
  DollarSign
} from "lucide-react";

export default function DashboardFornecedor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Verificar cache primeiro
        const cachedSupplier = localStorage.getItem('supplier_cache');
        if (cachedSupplier) {
          setSupplier(JSON.parse(cachedSupplier));
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const supplierResult = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        const supplier = supplierResult[0] || null;
        setSupplier(supplier);

        // Atualizar cache
        if (supplier) {
          localStorage.setItem('supplier_cache', JSON.stringify(supplier));
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar promoções do fornecedor (quando a entidade Promotion existir)
  const { data: promocoes = [] } = useQuery({
    queryKey: ["promocoes", supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      // Quando a entidade Promotion for criada, descomentar:
      // return await base44.entities.Promotion.filter({ supplier_id: supplier.id });
      return [];
    },
    enabled: !!supplier?.id
  });

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    PENDENTE: { label: "Em Análise", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50", icon: Clock },
    APROVADO: { label: "Verificado ✓", color: "bg-green-500/20 text-green-400 border border-green-500/50", icon: CheckCircle },
    REJEITADO: { label: "Rejeitado", color: "bg-red-500/20 text-red-400 border border-red-500/50", icon: Clock }
  };

  const status = statusConfig[supplier.status_cadastro] || statusConfig.PENDENTE;
  const StatusIcon = status.icon;

  const promocoesAtivas = promocoes.filter(p => p.status === "ATIVO").length;
  const promocoesRecentes = promocoes.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo/Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-coral/20 flex-shrink-0 overflow-hidden">
                {supplier.logo_url ? (
                  <img src={supplier.logo_url} alt={supplier.nome_fantasia} className="w-full h-full object-cover" />
                ) : (
                  supplier.nome_fantasia?.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">{supplier.nome_fantasia}</h1>
                <p className="text-gray-400">{supplier.razao_social}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  {supplier.area_atuacao && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-full text-xs font-bold">
                      {supplier.area_atuacao === "AMBOS" ? "Odonto & Medicina" : supplier.area_atuacao}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("EditarFornecedor"))}
              className="px-6 py-3 border border-white/20 text-white font-semibold rounded-2xl hover:border-brand-coral hover:text-brand-coral transition-all flex items-center gap-2 whitespace-nowrap bg-[#0a0a1a]"
            >
              <Edit className="w-5 h-5" />
              Editar Perfil
            </button>
          </div>
        </motion.div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={Package}
            label="Promoções Ativas"
            value={promocoesAtivas}
            color="from-blue-400 to-blue-600"
            delay={0}
          />
          <MetricCard
            icon={Eye}
            label="Visualizações"
            value={supplier.total_visualizacoes || 0}
            color="from-green-400 to-green-600"
            delay={0.1}
          />
          <MetricCard
            icon={Phone}
            label="Cliques WhatsApp"
            value={supplier.total_cliques_whatsapp || 0}
            color="from-pink-400 to-pink-600"
            delay={0.2}
          />
          <MetricCard
            icon={Star}
            label="Avaliação Média"
            value={supplier.media_avaliacoes?.toFixed(1) || "0.0"}
            color="from-yellow-400 to-orange-500"
            delay={0.3}
          />
        </div>

        {/* AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <button
            onClick={() => navigate(createPageUrl("CriarPromocao"))}
            className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-8 hover:bg-[#13132B]/80 hover:border-brand-coral/30 hover:scale-[1.02] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-white mb-1">Criar Nova Promoção</h3>
                <p className="text-gray-400 text-sm">Adicione um novo produto ou oferta</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl("MinhasPromocoes"))}
            className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-8 hover:bg-[#13132B]/80 hover:border-blue-500/30 hover:scale-[1.02] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-white mb-1">Ver Minhas Promoções</h3>
                <p className="text-gray-400 text-sm">Gerencie suas ofertas e produtos</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl("ValidarClienteDoutorizze"))}
            className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-8 hover:bg-[#13132B]/80 hover:border-purple-500/30 hover:scale-[1.02] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-white mb-1">Validar Cliente</h3>
                <p className="text-gray-400 text-sm">Verificar token e gerar desconto</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl("ClientesDoutorizze"))}
            className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-8 hover:bg-[#13132B]/80 hover:border-green-500/30 hover:scale-[1.02] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-white mb-1">Meus Clientes Doutorizze</h3>
                <p className="text-gray-400 text-sm">Tokens gerados e conversões</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* PROMOÇÕES RECENTES */}
        {promocoesRecentes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-white">Promoções Recentes</h2>
              <button
                onClick={() => navigate(createPageUrl("MinhasPromocoes"))}
                className="text-brand-orange font-bold hover:text-brand-coral transition-colors"
              >
                Ver Todas →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promocoesRecentes.map((promo, index) => (
                <PromocaoCard key={promo.id} promocao={promo} delay={index * 0.1} />
              ))}
            </div>
          </motion.div>
        )}

        {/* DICAS PARA VENDER MAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-pink-500/20 border border-brand-orange/30 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
              <Zap className="w-6 h-6 text-brand-orange" />
            </div>
            <h2 className="text-2xl font-black">Dicas para Vender Mais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <DicaCard
              icon={Camera}
              titulo="Fotos de Qualidade"
              descricao="Use imagens profissionais e bem iluminadas dos seus produtos"
            />
            <DicaCard
              icon={MessageCircle}
              titulo="Responda Rápido"
              descricao="Atenda clientes no WhatsApp em até 1 hora para aumentar vendas"
            />
            <DicaCard
              icon={DollarSign}
              titulo="Preços Atualizados"
              descricao="Mantenha seus preços competitivos e sempre atualizados"
            />
          </div>
        </motion.div>

        {/* AVISO SE PENDENTE */}
        {supplier.status_cadastro === "PENDENTE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 mt-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Cadastro em Análise</h3>
                <p className="text-gray-400 mb-3">
                  Seu cadastro está sendo analisado pela nossa equipe. Você poderá criar promoções assim que for aprovado.
                </p>
                <p className="text-sm text-gray-400">
                  ⏱️ Tempo médio de aprovação: <strong>24-48 horas úteis</strong>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#13132B]/60 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl p-6 hover:bg-[#13132B]/80 hover:scale-105 transition-all"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}

function PromocaoCard({ promocao, delay }) {
  const statusColors = {
    ATIVO: "bg-green-500/20 text-green-400 border border-green-500/50",
    PAUSADO: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
    ENCERRADO: "bg-gray-500/20 text-gray-400 border border-gray-500/50"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0a0a1a] border border-white/10 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand-coral/50 transition-all cursor-pointer group"
    >
      {promocao.imagem_url && (
        <div className="h-32 overflow-hidden bg-gray-800 border-b border-white/5">
          <img src={promocao.imagem_url} alt={promocao.titulo} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${statusColors[promocao.status]}`}>
          {promocao.status}
        </span>
        <h3 className="font-bold text-white mb-2 truncate group-hover:text-brand-coral transition-colors">{promocao.titulo}</h3>
        <div className="flex items-center gap-2">
          {promocao.preco_original && (
            <span className="text-sm text-gray-500 line-through">
              R$ {promocao.preco_original.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-black text-green-400">
            R$ {promocao.preco_promocional?.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DicaCard({ icon: Icon, titulo, descricao }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-white mb-1">{titulo}</h3>
      <p className="text-sm text-white/80">{descricao}</p>
    </div>
  );
}