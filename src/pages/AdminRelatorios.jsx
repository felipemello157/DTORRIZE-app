/**
 * ADMIN RELATÓRIOS - Página de relatórios e métricas
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Building2,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  Calendar,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronLeft
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

function AdminRelatoriosContent() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("7dias");

  // Calcular datas baseado no período
  const getDateRange = () => {
    const hoje = new Date();
    switch (periodo) {
      case "hoje":
        return { inicio: startOfDay(hoje), fim: endOfDay(hoje) };
      case "7dias":
        return { inicio: startOfDay(subDays(hoje, 7)), fim: endOfDay(hoje) };
      case "30dias":
        return { inicio: startOfDay(subDays(hoje, 30)), fim: endOfDay(hoje) };
      case "mes":
        return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
      default:
        return { inicio: startOfDay(subDays(hoje, 7)), fim: endOfDay(hoje) };
    }
  };

  const { inicio, fim } = getDateRange();

  // Buscar profissionais
  const { data: profissionais = [], isLoading: loadingProfs } = useQuery({
    queryKey: ["relatorio-profissionais"],
    queryFn: async () => {
      return await base44.entities.Professional.list();
    }
  });

  // Buscar clínicas
  const { data: clinicas = [], isLoading: loadingClinicas } = useQuery({
    queryKey: ["relatorio-clinicas"],
    queryFn: async () => {
      return await base44.entities.CompanyUnit.list();
    }
  });

  // Buscar vagas
  const { data: vagas = [], isLoading: loadingVagas } = useQuery({
    queryKey: ["relatorio-vagas"],
    queryFn: async () => {
      return await base44.entities.Job.list();
    }
  });

  // Buscar marketplace
  const { data: marketplace = [], isLoading: loadingMarket } = useQuery({
    queryKey: ["relatorio-marketplace"],
    queryFn: async () => {
      return await base44.entities.MarketplaceItem.list();
    }
  });

  // Buscar denúncias
  const { data: denuncias = [], isLoading: loadingDenuncias } = useQuery({
    queryKey: ["relatorio-denuncias"],
    queryFn: async () => {
      return await base44.entities.Report.list();
    }
  });

  const isLoading = loadingProfs || loadingClinicas || loadingVagas || loadingMarket || loadingDenuncias;

  // Calcular métricas
  const filtrarPorData = (items) => {
    return items.filter(item => {
      const data = new Date(item.created_date);
      return data >= inicio && data <= fim;
    });
  };

  const profissionaisNoPeriodo = filtrarPorData(profissionais);
  const clinicasNoPeriodo = filtrarPorData(clinicas);
  const vagasNoPeriodo = filtrarPorData(vagas);
  const marketplaceNoPeriodo = filtrarPorData(marketplace);
  const denunciasNoPeriodo = filtrarPorData(denuncias);

  // Estatísticas de status
  const profsPendentes = profissionais.filter(p => p.status_cadastro === "EM_ANALISE").length;
  const profsAprovados = profissionais.filter(p => p.status_cadastro === "APROVADO").length;
  const profsReprovados = profissionais.filter(p => p.status_cadastro === "REPROVADO").length;

  const clinicasPendentes = clinicas.filter(c => c.status_cadastro === "EM_ANALISE").length;
  const clinicasAprovadas = clinicas.filter(c => c.status_cadastro === "APROVADO").length;
  const clinicasReprovadas = clinicas.filter(c => c.status_cadastro === "REPROVADO").length;

  const vagasAbertas = vagas.filter(v => v.status === "ABERTO").length;
  const vagasPreenchidas = vagas.filter(v => v.status === "PREENCHIDO").length;
  const vagasCanceladas = vagas.filter(v => v.status === "CANCELADO").length;

  const denunciasPendentes = denuncias.filter(d => d.status === "PENDENTE").length;
  const denunciasResolvidas = denuncias.filter(d => d.status === "RESOLVIDO").length;

  // Dados para gráficos de crescimento (últimos 7 dias do range selecionado é complexo, vamos manter 7 dias simples para o gráfico ou adaptar se o período mudar poderia ser legal, mas vamos simplificar mantendo a lógica original por enquanto para não introduzir bugs lógicos)
  // O gráfico original usava "Últimos 7 dias".
  const graficoDados = Array.from({ length: 7 }, (_, i) => {
    const dia = subDays(new Date(), 6 - i);
    const inicioDia = startOfDay(dia);
    const fimDia = endOfDay(dia);

    return {
      data: format(dia, "dd/MM", { locale: ptBR }),
      profissionais: profissionais.filter(p => {
        const data = new Date(p.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length,
      clinicas: clinicas.filter(c => {
        const data = new Date(c.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length,
      vagas: vagas.filter(v => {
        const data = new Date(v.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length,
      marketplace: marketplace.filter(m => {
        const data = new Date(m.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length
    };
  });

  // Função de exportação CSV
  const exportarCSV = () => {
    const csvContent = [
      // Header
      ["Tipo", "Total", "No Período", "Status", "Quantidade"].join(","),

      // Profissionais
      ["Profissionais", profissionais.length, profissionaisNoPeriodo.length, "Aprovados", profsAprovados].join(","),
      ["", "", "", "Pendentes", profsPendentes].join(","),
      ["", "", "", "Reprovados", profsReprovados].join(","),

      // Clínicas
      ["Clínicas", clinicas.length, clinicasNoPeriodo.length, "Aprovadas", clinicasAprovadas].join(","),
      ["", "", "", "Pendentes", clinicasPendentes].join(","),
      ["", "", "", "Reprovadas", clinicasReprovadas].join(","),

      // Vagas
      ["Vagas", vagas.length, vagasNoPeriodo.length, "Abertas", vagasAbertas].join(","),
      ["", "", "", "Preenchidas", vagasPreenchidas].join(","),
      ["", "", "", "Canceladas", vagasCanceladas].join(","),

      // Marketplace
      ["Marketplace", marketplace.length, marketplaceNoPeriodo.length, "Ativos", marketplace.filter(m => m.status === "ATIVO").length].join(","),
      ["", "", "", "Vendidos", marketplace.filter(m => m.status === "VENDIDO").length].join(","),

      // Denúncias
      ["Denúncias", denuncias.length, denunciasNoPeriodo.length, "Pendentes", denunciasPendentes].join(","),
      ["", "", "", "Resolvidas", denunciasResolvidas].join(",")
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cards de estatísticas
  const statsCards = [
    {
      titulo: "Profissionais",
      total: profissionais.length,
      periodo: profissionaisNoPeriodo.length,
      icone: Users,
      cor: "from-blue-400 to-blue-600",
      detalhes: [
        { label: "Aprovados", valor: profsAprovados, cor: "text-green-400" },
        { label: "Pendentes", valor: profsPendentes, cor: "text-yellow-400" },
        { label: "Reprovados", valor: profsReprovados, cor: "text-red-400" }
      ]
    },
    {
      titulo: "Clínicas",
      total: clinicas.length,
      periodo: clinicasNoPeriodo.length,
      icone: Building2,
      cor: "from-purple-400 to-purple-600",
      detalhes: [
        { label: "Aprovadas", valor: clinicasAprovadas, cor: "text-green-400" },
        { label: "Pendentes", valor: clinicasPendentes, cor: "text-yellow-400" },
        { label: "Reprovadas", valor: clinicasReprovadas, cor: "text-red-400" }
      ]
    },
    {
      titulo: "Vagas",
      total: vagas.length,
      periodo: vagasNoPeriodo.length,
      icone: Briefcase,
      cor: "from-orange-400 to-orange-600",
      detalhes: [
        { label: "Abertas", valor: vagasAbertas, cor: "text-green-400" },
        { label: "Preenchidas", valor: vagasPreenchidas, cor: "text-blue-400" },
        { label: "Canceladas", valor: vagasCanceladas, cor: "text-red-400" }
      ]
    },
    {
      titulo: "Marketplace",
      total: marketplace.length,
      periodo: marketplaceNoPeriodo.length,
      icone: ShoppingBag,
      cor: "from-pink-400 to-pink-600",
      detalhes: [
        { label: "Ativos", valor: marketplace.filter(m => m.status === "ATIVO").length, cor: "text-green-400" },
        { label: "Vendidos", valor: marketplace.filter(m => m.status === "VENDIDO").length, cor: "text-blue-400" },
        { label: "Suspensos", valor: marketplace.filter(m => m.status === "SUSPENSO").length, cor: "text-red-400" }
      ]
    }
  ];

  const periodoLabel = {
    hoje: "Hoje",
    "7dias": "Últimos 7 dias",
    "30dias": "Últimos 30 dias",
    mes: format(new Date(), "MMMM yyyy", { locale: ptBR })
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Relatórios</h1>
                <p className="text-gray-400">Métricas e estatísticas da plataforma</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Seletor de Período */}
              <div className="flex items-center gap-2 bg-[#0a0a1a] rounded-xl p-1 border border-white/10">
                {["hoje", "7dias", "30dias", "mes"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${periodo === p
                        ? "bg-white/10 text-white shadow-lg border border-white/5"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {periodoLabel[p]}
                  </button>
                ))}
              </div>

              {/* Botão Exportar */}
              <button
                onClick={exportarCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-400 font-bold rounded-xl hover:bg-green-500/20 transition-all border border-green-500/20"
              >
                <Download className="w-5 h-5" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Data do período */}
          <div className="flex items-center gap-2 text-gray-500 mb-0 mt-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {format(inicio, "dd/MM/yyyy", { locale: ptBR })} - {format(fim, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">

        {/* Cards de Estatísticas */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-brand-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((card, index) => {
                const Icon = card.icone;
                return (
                  <motion.div
                    key={card.titulo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#13132B] rounded-3xl border border-white/10 p-6 hover:border-white/20 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.cor} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-white">{card.total}</p>
                        <p className="text-xs uppercase font-bold text-gray-500">Total</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-[#0a0a1a] rounded-xl border border-white/5">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-bold text-green-500">+{card.periodo}</span>
                      <span className="text-xs text-gray-500 uppercase">no período</span>
                    </div>

                    <div className="space-y-3">
                      {card.detalhes.map((detalhe) => (
                        <div key={detalhe.label} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-sm text-gray-400">{detalhe.label}</span>
                          <span className={`font-bold ${detalhe.cor}`}>{detalhe.valor}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Seção de Denúncias */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 p-8 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Denúncias</h2>
                  <p className="text-gray-400">Status de moderação</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-500/10 rounded-2xl p-5 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-500 uppercase">Pendentes</span>
                  </div>
                  <p className="text-4xl font-black text-white">{denunciasPendentes}</p>
                </div>

                <div className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-blue-500 uppercase">Em Análise</span>
                  </div>
                  <p className="text-4xl font-black text-white">
                    {denuncias.filter(d => d.status === "ANALISANDO").length}
                  </p>
                </div>

                <div className="bg-green-500/10 rounded-2xl p-5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-bold text-green-500 uppercase">Resolvidas</span>
                  </div>
                  <p className="text-4xl font-black text-white">{denunciasResolvidas}</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-500 uppercase">Total</span>
                  </div>
                  <p className="text-4xl font-black text-white">{denuncias.length}</p>
                </div>
              </div>
            </motion.div>

            {/* Gráficos de Crescimento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 p-8 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Crescimento (7 Dias)</h2>
                  <p className="text-gray-400">Evolução diária de cadastros</p>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graficoDados}>
                    <defs>
                      <linearGradient id="colorProfs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClinicas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="data" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="profissionais" stackId="1" stroke="#3b82f6" fill="url(#colorProfs)" name="Profissionais" strokeWidth={3} />
                    <Area type="monotone" dataKey="clinicas" stackId="1" stroke="#a855f7" fill="url(#colorClinicas)" name="Clínicas" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

// Export com ProtectedRoute wrapper
export default function AdminRelatorios() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminRelatoriosContent />
    </ProtectedRoute>
  );
}