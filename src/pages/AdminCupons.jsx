import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AdminCuponsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [modalCriar, setModalCriar] = useState(false);
  const [novoCupom, setNovoCupom] = useState({
    codigo: "",
    parceiro_nome: "",
    desconto_tipo: "PERCENTUAL",
    desconto_valor: 0,
    produto_categoria: "",
    data_validade: "",
    observacoes: ""
  });

  // Buscar cupons
  const { data: cupons = [], isLoading } = useQuery({
    queryKey: ["adminCupons"],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.TokenDesconto.list();
      return result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  // Mutation para criar cupom
  const criarCupomMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.asServiceRole.entities.TokenDesconto.create({
        ...data,
        status: "ATIVO",
        data_geracao: new Date().toISOString(),
        enviado_whatsapp: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCupons"] });
      setModalCriar(false);
      setNovoCupom({
        codigo: "",
        parceiro_nome: "",
        desconto_tipo: "PERCENTUAL",
        desconto_valor: 0,
        produto_categoria: "",
        data_validade: "",
        observacoes: ""
      });
      toast.success("✅ Cupom criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cupom: " + error.message);
    }
  });

  // Mutation para desativar cupom
  const desativarCupomMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.asServiceRole.entities.TokenDesconto.update(id, {
        status: "CANCELADO"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCupons"] });
      toast.success("❌ Cupom desativado!");
    },
    onError: (error) => {
      toast.error("Erro ao desativar: " + error.message);
    }
  });

  // Filtrar cupons
  const filteredCupons = cupons.filter((cupom) => {
    const matchSearch =
      cupom.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cupom.parceiro_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cupom.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "all" || cupom.status === statusFilter;
    const matchTipo =
      tipoFilter === "all" || cupom.desconto_tipo === tipoFilter;

    return matchSearch && matchStatus && matchTipo;
  });

  // Estatísticas
  const stats = {
    total: cupons.length,
    ativos: cupons.filter((c) => c.status === "ATIVO").length,
    usados: cupons.filter((c) => c.status === "USADO").length,
    expirados: cupons.filter((c) => c.status === "EXPIRADO").length,
    totalDesconto: cupons
      .filter((c) => c.status === "USADO")
      .reduce((sum, c) => sum + (c.valor_desconto_aplicado || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

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
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Gerenciar Cupons</h1>
                <p className="text-gray-400">Sistema de descontos e parcerias</p>
              </div>
            </div>

            <button
              onClick={() => setModalCriar(true)}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Novo Cupom
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard icon={Ticket} label="Total" value={stats.total} color="blue" />
          <StatsCard icon={CheckCircle2} label="Ativos" value={stats.ativos} color="green" />
          <StatsCard icon={CheckCircle2} label="Usados" value={stats.usados} color="purple" />
          <StatsCard icon={XCircle} label="Expirados" value={stats.expirados} color="red" />
          <StatsCard icon={DollarSign} label="Economia (R$)" value={`R$ ${stats.totalDesconto.toLocaleString("pt-BR")}`} color="yellow" />
        </div>

        {/* Filters */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                placeholder="Buscar (código, parceiro)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary outline-none transition-all"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#13132B] border-white/10 text-white">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="USADO">Usado</SelectItem>
                <SelectItem value="EXPIRADO">Expirado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                <SelectValue placeholder="Tipo de Desconto" />
              </SelectTrigger>
              <SelectContent className="bg-[#13132B] border-white/10 text-white">
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="PERCENTUAL">Percentual</SelectItem>
                <SelectItem value="VALOR_FIXO">Valor Fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <p className="text-sm text-gray-400">
              <strong className="text-white">{filteredCupons.length}</strong> cupons encontrados
            </p>
            {(searchTerm || statusFilter !== "all" || tipoFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTipoFilter("all");
                }}
                className="text-sm text-brand-primary hover:text-brand-primary/80 font-semibold"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Lista de Cupons */}
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredCupons.map((cupom) => (
              <motion.div
                key={cupom.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#13132B] rounded-2xl border border-white/10 p-6 hover:border-brand-primary/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-brand-primary border border-white/10">
                      {cupom.desconto_tipo === "PERCENTUAL" ? "%" : "$"}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-brand-primary transition-colors tracking-wide">
                        {cupom.codigo}
                      </h3>
                      <p className="text-gray-400 font-medium mb-2">{cupom.parceiro_nome}</p>

                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={cupom.status} />
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                          {cupom.desconto_tipo === "PERCENTUAL"
                            ? `${cupom.desconto_valor}% OFF`
                            : `R$ ${cupom.desconto_valor}`
                          }
                        </Badge>
                        {cupom.produto_categoria && (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">
                            {cupom.produto_categoria}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400 min-w-[200px]">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-600 font-bold">Criado</p>
                      <p>{formatDistanceToNow(new Date(cupom.data_geracao), { locale: ptBR, addSuffix: true })}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-600 font-bold">Validade</p>
                      <p>{new Date(cupom.data_validade).toLocaleDateString("pt-BR")}</p>
                    </div>
                    {cupom.status === "USADO" && (
                      <div className="col-span-2 mt-2 pt-2 border-t border-white/5">
                        <p className="text-xs uppercase tracking-wider text-green-500/70 font-bold">Usado em</p>
                        <p className="text-green-400 font-bold">{new Date(cupom.data_uso).toLocaleDateString("pt-BR")}</p>
                      </div>
                    )}
                  </div>

                  {cupom.status === "ATIVO" && (
                    <button
                      onClick={() => desativarCupomMutation.mutate(cupom.id)}
                      disabled={desativarCupomMutation.isPending}
                      className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/20 self-center"
                      title="Cancelar Cupom"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredCupons.length === 0 && (
            <div className="bg-[#13132B] border border-white/10 rounded-3xl p-12 text-center">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum cupom encontrado</h3>
              <p className="text-gray-600">Altere os filtros ou crie um novo cupom.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar */}
      <AnimatePresence>
        {modalCriar && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-w-lg w-full"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-brand-primary" />
                  Novo Cupom
                </h3>
                <button
                  onClick={() => setModalCriar(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Código</label>
                    <input
                      value={novoCupom.codigo}
                      onChange={(e) => setNovoCupom({ ...novoCupom, codigo: e.target.value.toUpperCase() })}
                      placeholder="EX: PROMO20"
                      className="w-full h-12 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Validade</label>
                    <input
                      type="date"
                      value={novoCupom.data_validade}
                      onChange={(e) => setNovoCupom({ ...novoCupom, data_validade: e.target.value })}
                      className="w-full h-12 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Parceiro</label>
                  <input
                    value={novoCupom.parceiro_nome}
                    onChange={(e) => setNovoCupom({ ...novoCupom, parceiro_nome: e.target.value })}
                    placeholder="Nome da empresa/parceiro"
                    className="w-full h-12 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Tipo</label>
                    <Select value={novoCupom.desconto_tipo} onValueChange={(v) => setNovoCupom({ ...novoCupom, desconto_tipo: v })}>
                      <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13132B] border-white/10 text-white">
                        <SelectItem value="PERCENTUAL">Porcentagem (%)</SelectItem>
                        <SelectItem value="VALOR_FIXO">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Valor</label>
                    <input
                      type="number"
                      value={novoCupom.desconto_valor}
                      onChange={(e) => setNovoCupom({ ...novoCupom, desconto_valor: parseFloat(e.target.value) || 0 })}
                      className="w-full h-12 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Categoria</label>
                  <input
                    value={novoCupom.produto_categoria}
                    onChange={(e) => setNovoCupom({ ...novoCupom, produto_categoria: e.target.value })}
                    placeholder="Ex: CURSOS, EQUIPAMENTOS (Opcional)"
                    className="w-full h-12 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Observações</label>
                  <textarea
                    value={novoCupom.observacoes}
                    onChange={(e) => setNovoCupom({ ...novoCupom, observacoes: e.target.value })}
                    rows={3}
                    className="w-full p-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-4">
                <button
                  onClick={() => setModalCriar(false)}
                  className="flex-1 h-12 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => criarCupomMutation.mutate(novoCupom)}
                  disabled={criarCupomMutation.isPending || !novoCupom.codigo}
                  className="flex-1 h-12 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  {criarCupomMutation.isPending ? "Criando..." : "Criar Cupom"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col items-center justify-center text-center`}>
      <Icon className="w-6 h-6 mb-2 opacity-80" />
      <span className="text-2xl font-black mb-1">{value}</span>
      <span className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ATIVO: "bg-green-500/10 text-green-400 border-green-500/20",
    USADO: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    EXPIRADO: "bg-red-500/10 text-red-400 border-red-500/20",
    CANCELADO: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <Badge className={`border ${styles[status] || styles.CANCELADO}`}>
      {status}
    </Badge>
  );
}

export default function AdminCupons() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminCuponsPage />
    </ProtectedRoute>
  );
}