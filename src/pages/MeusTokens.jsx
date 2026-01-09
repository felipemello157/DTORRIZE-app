import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  CreditCard
} from "lucide-react";

export default function MeusTokens() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // MOCK USER FALLBACK (LOCALHOST)
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          setUser({
            id: "mock-user-123",
            nome_completo: "Dev Localhost",
            email: "dev@localhost.com"
          });
        }
      }
    };
    loadUser();
  }, []);

  const { data: tokenUsuario } = useQuery({
    queryKey: ["tokenUsuario", user?.id],
    queryFn: async () => {
      // MOCK WALLET STATS (LOCALHOST)
      if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && user?.id === "mock-user-123") {
        return {
          creditos_disponiveis: 2,
          creditos_usados: 5,
          creditos_perdidos: 1,
          valor_economizado: 1250
        };
      }
      if (!user?.id) return null;
      const tokens = await base44.entities.TokenUsuario.filter({ user_id: user.id });
      return tokens[0] || null;
    },
    enabled: !!user?.id
  });

  const { data: tokensDesconto = [], isLoading } = useQuery({
    queryKey: ["tokensDesconto", user?.id],
    queryFn: async () => {
      // MOCK TOKENS (LOCALHOST)
      if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && user?.id === "mock-user-123") {
        return [
          {
            id: "mock-token-1",
            parceiro_nome: "Kavo Equipamentos",
            tipo_desconto: "PERCENTUAL",
            valor_desconto: 15,
            codigo: "KAVO-DEV-15",
            tentativa_numero: 1,
            data_geracao: new Date().toISOString(),
            data_validade: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "ATIVO",
            negocio_fechado: false
          },
          {
            id: "mock-token-2",
            parceiro_nome: "Dabi Atlante",
            tipo_desconto: "VALOR",
            valor_desconto: 500,
            codigo: "DABI-DEV-500",
            tentativa_numero: 1,
            data_geracao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            data_validade: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "USADO",
            negocio_fechado: true
          }
        ];
      }
      if (!user?.id) return [];
      return await base44.entities.TokenDesconto.filter({ user_id: user.id });
    },
    enabled: !!user?.id
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  const tokensAtivos = tokensDesconto.filter(t => t.status === 'ATIVO').length;
  const tokensUsados = tokensDesconto.filter(t => t.status === 'USADO' && t.negocio_fechado).length;
  const tokensPerdidos = tokensDesconto.filter(t => t.status === 'USADO' && !t.negocio_fechado).length;
  const tokensExpirados = tokensDesconto.filter(t => t.status === 'EXPIRADO').length;

  const creditosDisponiveis = tokenUsuario?.creditos_disponiveis || 3;
  const creditosUsados = tokenUsuario?.creditos_usados || 0;
  const creditosPerdidos = tokenUsuario?.creditos_perdidos || 0;
  const valorEconomizado = tokenUsuario?.valor_economizado || 0;

  const statusConfig = {
    ATIVO: {
      label: "Ativo",
      color: "bg-green-500/10 text-green-400 border-green-500/30",
      icon: Clock,
      desc: "Use antes de expirar!"
    },
    USADO: {
      label: "Usado",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      icon: CheckCircle2,
      desc: "Desconto aplicado"
    },
    EXPIRADO: {
      label: "Expirado",
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      icon: XCircle,
      desc: "Passou da validade"
    },
    CANCELADO: {
      label: "Cancelado",
      color: "bg-gray-500/10 text-gray-400 border-white/10",
      icon: XCircle,
      desc: "Cancelado pelo parceiro"
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 text-white relative overflow-hidden">
      {/* Ambient Backgorund */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="bg-[#13132B] border-b border-white/10 p-8 shadow-2xl relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Meus Tokens Doutorizze</h1>
          <p className="text-gray-400">Gerencie seus descontos e créditos exclusivos</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 relative z-10">
        {/* Resumo de Créditos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#13132B] to-[#1E1E3F] rounded-3xl p-8 shadow-2xl mb-8 border border-white/10 overflow-hidden relative"
        >
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-8 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Resumo de Créditos</h2>
              <p className="text-gray-400">Seu histórico de economia e negociações</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-5 text-center shadow-lg hover:border-brand-orange/30 transition-all group">
              <div className="text-4xl font-black text-white mb-2 group-hover:scale-105 transition-transform">{creditosDisponiveis}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Disponíveis</div>
            </div>

            <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-5 text-center shadow-lg hover:border-green-500/30 transition-all group">
              <div className="text-4xl font-black text-green-400 mb-2 group-hover:scale-105 transition-transform">{creditosUsados}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">✅ Fechou</div>
            </div>

            <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-5 text-center shadow-lg hover:border-red-500/30 transition-all group">
              <div className="text-4xl font-black text-red-400 mb-2 group-hover:scale-105 transition-transform">{creditosPerdidos}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">❌ Não Fechou</div>
            </div>

            <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-5 text-center shadow-lg hover:border-brand-coral/30 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-coral to-brand-orange mb-2 group-hover:scale-105 transition-transform">
                R$ {valorEconomizado.toFixed(0)}
              </div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">💰 Economizado</div>
            </div>
          </div>
        </motion.div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#13132B] rounded-2xl p-6 shadow-lg border border-white/5 hover:border-white/10 transition-all"
          >
            <Clock className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-3xl font-black text-white mb-1">{tokensAtivos}</div>
            <div className="text-sm text-gray-400 font-medium">Tokens Ativos</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#13132B] rounded-2xl p-6 shadow-lg border border-white/5 hover:border-white/10 transition-all"
          >
            <CheckCircle2 className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-3xl font-black text-white mb-1">{tokensUsados}</div>
            <div className="text-sm text-gray-400 font-medium">Tokens Usados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#13132B] rounded-2xl p-6 shadow-lg border border-white/5 hover:border-white/10 transition-all"
          >
            <XCircle className="w-8 h-8 text-red-400 mb-3" />
            <div className="text-3xl font-black text-white mb-1">{tokensExpirados}</div>
            <div className="text-sm text-gray-400 font-medium">Expirados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#13132B] rounded-2xl p-6 shadow-lg border border-white/5 hover:border-white/10 transition-all"
          >
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
            <div className="text-3xl font-black text-white mb-1">{tokensPerdidos}</div>
            <div className="text-sm text-gray-400 font-medium">Não Fechou</div>
          </motion.div>
        </div>

        {/* Lista de Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#13132B] rounded-3xl shadow-xl border border-white/10 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-brand-orange" />
            <h2 className="text-xl font-bold text-white">Histórico e Tokens Ativos</h2>
          </div>

          <div className="p-6">
            {tokensDesconto.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0a1a] rounded-2xl border border-white/5 border-dashed">
                <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 font-semibold text-lg">Você ainda não possui tokens de desconto</p>
                <p className="text-sm text-gray-500 mt-2">Solicite ao parceiro durante uma negociação para ganhar descontos!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tokensDesconto
                  .sort((a, b) => new Date(b.data_geracao) - new Date(a.data_geracao))
                  .map((token, index) => {
                    const config = statusConfig[token.status] || statusConfig.CANCELADO;
                    const StatusIcon = config.icon;
                    const valorDesconto = token.tipo_desconto === "PERCENTUAL"
                      ? `${token.valor_desconto}%`
                      : `R$ ${token.valor_desconto.toFixed(2)}`;

                    const horasRestantes = Math.max(0,
                      Math.floor((new Date(token.data_validade) - new Date()) / (1000 * 60 * 60))
                    );

                    const isExpiringSoon = token.status === 'ATIVO' && horasRestantes < 24;

                    return (
                      <motion.div
                        key={token.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-6 rounded-2xl border ${config.color} bg-[#0a0a1a] hover:bg-[#0a0a1a]/80 transition-all relative overflow-hidden group`}
                      >
                        {/* Status Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${token.status === 'ATIVO' ? 'bg-green-500' : token.status === 'USADO' ? 'bg-blue-500' : 'bg-red-500'}`} />

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pl-3">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${token.status === 'ATIVO' ? 'bg-green-500/10' : 'bg-white/5'} border border-white/5`}>
                              <StatusIcon className={`w-6 h-6 ${token.status === 'ATIVO' ? 'text-green-400' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <h3 className="font-black text-white text-lg mb-1">{token.parceiro_nome}</h3>
                              <p className="text-sm text-gray-400">{config.desc}</p>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <div className="text-3xl font-black text-brand-orange drop-shadow-lg">{valorDesconto}</div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Desconto OFF</p>
                          </div>
                        </div>

                        <div className="bg-[#13132B] rounded-xl p-4 mb-4 border border-white/5 pl-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-400">Código do Cupom:</span>
                            <code className="px-4 py-1.5 bg-black/40 border border-white/10 text-brand-orange rounded-lg font-mono font-bold text-lg tracking-wider select-all">
                              {token.codigo}
                            </code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Tentativa:</span>
                            <span className="font-bold text-white">{token.tentativa_numero}ª</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm pl-3">
                          <span className="text-gray-500">
                            Gerado em: {new Date(token.data_geracao).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={`font-bold flex items-center gap-2 ${isExpiringSoon ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                            {token.status === 'ATIVO' && <Clock className="w-4 h-4" />}
                            {token.status === 'ATIVO'
                              ? `⏰ ${horasRestantes}h restantes`
                              : `Expira: ${new Date(token.data_validade).toLocaleDateString('pt-BR')}`
                            }
                          </span>
                        </div>

                        {token.status === 'USADO' && (
                          <div className={`mt-4 p-3 rounded-xl border pl-3 ${token.negocio_fechado
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}>
                            <p className="text-sm font-bold flex items-center gap-2">
                              {token.negocio_fechado ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              {token.negocio_fechado ? "Negócio fechado - Crédito reposto" : "Não fechou - Crédito perdido"}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Informações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 mt-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-32 h-32 text-blue-500" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0" />
            </div>
            <div className="text-sm text-gray-300">
              <p className="font-bold mb-3 text-blue-300 text-lg">Como funcionam os tokens?</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Você pode ter até 3 créditos por parceiro</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Cada token é válido por 48 horas</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Se fechar negócio: crédito é reposto</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Se não fechar: crédito é perdido</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Após 3 créditos perdidos: perde o benefício</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}