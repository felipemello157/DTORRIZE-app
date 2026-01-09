import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Loader2
} from "lucide-react";

export default function ClientesDoutorizze() {
  const [user, setUser] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setParceiroId(currentUser.id);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["tokensDesconto", parceiroId, filtroStatus],
    queryFn: async () => {
      if (!parceiroId) return [];

      const query = { parceiro_id: parceiroId };
      if (filtroStatus !== "TODOS") {
        query.status = filtroStatus;
      }

      return await base44.entities.TokenDesconto.filter(query);
    },
    enabled: !!parceiroId
  });

  const tokensFiltrados = tokens.sort((a, b) =>
    new Date(b.data_geracao) - new Date(a.data_geracao)
  );

  // Métricas
  const totalClientes = new Set(tokens.map(t => t.user_id)).size;
  const tokensGerados = tokens.length;
  const tokensUtilizados = tokens.filter(t => t.status === 'USADO').length;
  const negociosFechados = tokens.filter(t => t.negocio_fechado).length;
  const taxaConversao = tokensGerados > 0 ? ((negociosFechados / tokensGerados) * 100).toFixed(1) : 0;

  const statusConfig = {
    ATIVO: { label: "Ativo", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: Clock },
    USADO: { label: "Usado", color: "bg-brand-primary/10 text-brand-primary border-brand-primary/20", icon: CheckCircle2 },
    EXPIRADO: { label: "Expirado", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
    CANCELADO: { label: "Cancelado", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: XCircle }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24">
      {/* Header */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 mb-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">Clientes Doutorizze</h1>
          <p className="text-gray-400">Acompanhe tokens gerados e conversões</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#13132B] border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <div className="text-3xl font-black text-white mb-1">{totalClientes}</div>
            <div className="text-sm text-gray-400">Clientes</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#13132B] border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <Gift className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-3xl font-black text-white mb-1">{tokensGerados}</div>
            <div className="text-sm text-gray-400">Tokens Gerados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#13132B] border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-3xl font-black text-white mb-1">{negociosFechados}</div>
            <div className="text-sm text-gray-400">Negócios Fechados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#13132B] border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <TrendingUp className="w-8 h-8 text-yellow-500 mb-2" />
            <div className="text-3xl font-black text-white mb-1">{taxaConversao}%</div>
            <div className="text-sm text-gray-400">Taxa Conversão</div>
          </motion.div>
        </div>

        {/* Filtros */}
        <div className="bg-[#13132B] border border-white/10 rounded-2xl p-4 shadow-lg mb-6 flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-bold text-gray-400">Filtrar:</span>
          {["TODOS", "ATIVO", "USADO", "EXPIRADO"].map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${filtroStatus === status
                  ? "bg-brand-primary border-brand-primary text-white"
                  : "bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                }`}
            >
              {status === "TODOS" ? "Todos" : statusConfig[status]?.label}
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a1a] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-400">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-400">Código</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-400">Desconto</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-400">Gerado em</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-400">Validade</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-400">Tentativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tokensFiltrados.map((token, index) => {
                  const StatusIcon = statusConfig[token.status]?.icon || Clock;
                  const valorDesconto = token.tipo_desconto === "PERCENTUAL"
                    ? `${token.valor_desconto}%`
                    : `R$ ${token.valor_desconto.toFixed(2)}`;

                  return (
                    <motion.tr
                      key={token.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white">{token.usuario_nome}</p>
                          <p className="text-xs text-gray-500">Nível {token.usuario_nivel}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-3 py-1 bg-[#0a0a1a] border border-white/10 rounded-lg font-mono text-sm font-bold text-white">
                          {token.codigo}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-brand-primary">{valorDesconto}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(token.data_geracao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(token.data_validade).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[token.status]?.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[token.status]?.label}
                        </span>
                        {token.status === 'USADO' && token.negocio_fechado && (
                          <span className="ml-2 text-xs text-green-500 font-bold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" /> Fechou
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-400">
                          {token.tentativa_numero}ª
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {tokensFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-semibold">Nenhum token encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}