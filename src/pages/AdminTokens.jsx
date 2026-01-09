import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield,
  Search,
  TrendingUp,
  Award,
  CheckCircle2,
  CheckCheck,
  ChevronLeft,
  Edit2,
  Ticket
} from "lucide-react";

function AdminTokensPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoContaFilter, setTipoContaFilter] = useState("all");
  const [selectedToken, setSelectedToken] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  // Buscar tokens
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["adminTokens"],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.TokenUsuario.list();
      return result;
    },
  });

  // Mutation para atualizar token
  const updateTokenMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.asServiceRole.entities.TokenUsuario.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTokens"] });
      toast.success("Token atualizado com sucesso");
      setEditModalOpen(false);
      setSelectedToken(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar token: " + error.message);
    },
  });

  // Filtrar tokens
  const filteredTokens = tokens.filter((token) => {
    const matchSearch =
      token.token_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.especialidade?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "all" || token.status === statusFilter;
    const matchTipo =
      tipoContaFilter === "all" || token.tipo_conta === tipoContaFilter;

    return matchSearch && matchStatus && matchTipo;
  });

  // Estatísticas
  const stats = {
    total: tokens.length,
    ativos: tokens.filter((t) => t.status === "ATIVO").length,
    verificados: tokens.filter((t) => t.verificado).length,
    totalDescontos: tokens.reduce((sum, t) => sum + (t.total_descontos_usados || 0), 0),
    totalEconomizado: tokens.reduce((sum, t) => sum + (t.valor_economizado || 0), 0),
  };

  const handleEdit = (token) => {
    setSelectedToken(token);
    setEditData({
      nivel: token.nivel,
      pontos: token.pontos,
      status: token.status,
      verificado: token.verificado,
      whatsapp_verificado: token.whatsapp_verificado,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedToken) return;
    updateTokenMutation.mutate({ id: selectedToken.id, data: editData });
  };

  const nivelLabels = {
    1: "Iniciante",
    2: "Bronze",
    3: "Prata",
    4: "Ouro",
    5: "Diamante",
  };

  const nivelColors = {
    1: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    2: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    3: "bg-gray-300/10 text-gray-200 border-gray-300/20",
    4: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    5: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

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
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Gerenciar Tokens</h1>
                <p className="text-gray-400">Sistema de gamificação e benefícios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4">
          <StatsCard
            label="Total Tokens"
            value={stats.total}
            icon={Shield}
            color="blue"
          />
          <StatsCard
            label="Ativos"
            value={stats.ativos}
            icon={CheckCircle2}
            color="green"
          />
          <StatsCard
            label="Verificados"
            value={stats.verificados}
            icon={CheckCheck}
            color="purple"
          />
          <StatsCard
            label="Descontos Usados"
            value={stats.totalDescontos}
            icon={Award}
            color="orange"
          />
          <StatsCard
            label="Economizado"
            value={`R$ ${stats.totalEconomizado.toLocaleString("pt-BR")}`}
            icon={TrendingUp}
            color="green"
            isCurrency
          />
        </div>

        {/* Filtros */}
        <div className="bg-[#13132B] rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Buscar por token ID, user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl focus:border-brand-primary placeholder:text-gray-600"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#13132B] border-white/10 text-white">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoContaFilter} onValueChange={setTipoContaFilter}>
              <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                <SelectValue placeholder="Tipo de Conta" />
              </SelectTrigger>
              <SelectContent className="bg-[#13132B] border-white/10 text-white">
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="PROFISSIONAL">Profissional</SelectItem>
                <SelectItem value="CLINICA">Clínica</SelectItem>
                <SelectItem value="HOSPITAL">Hospital</SelectItem>
                <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
                <SelectItem value="INSTITUICAO">Instituição</SelectItem>
                <SelectItem value="LABORATORIO">Laboratório</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Tokens */}
        <div className="space-y-4">
          {filteredTokens.length === 0 ? (
            <div className="bg-[#13132B] rounded-3xl p-12 text-center border border-white/10">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Nenhum token encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca
              </p>
            </div>
          ) : (
            filteredTokens.map((token) => (
              <div
                key={token.id}
                className="bg-[#13132B] rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                        {token.nivel}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg font-mono">
                          {token.token_id}
                        </h3>
                        <p className="text-sm text-gray-400">User ID: <span className="font-mono text-gray-500">{token.user_id}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge className={nivelColors[token.nivel]}>
                        Nível {token.nivel} - {nivelLabels[token.nivel]}
                      </Badge>
                      <Badge
                        className={
                          token.status === "ATIVO"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }
                      >
                        {token.status}
                      </Badge>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {token.tipo_conta}
                      </Badge>
                      {token.verificado && (
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                          ✓ Verificado
                        </Badge>
                      )}
                      {token.whatsapp_verificado && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          ✓ WhatsApp
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Especialidade</p>
                        <p className="font-semibold text-white">
                          {token.especialidade || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pontos</p>
                        <p className="font-semibold text-yellow-400">{token.pontos || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Descontos</p>
                        <p className="font-semibold text-white">
                          {token.total_descontos_usados || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Economia</p>
                        <p className="font-semibold text-green-400">
                          R$ {(token.valor_economizado || 0).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(token)}
                      className="rounded-xl border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md bg-[#13132B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Token</DialogTitle>
            <DialogDescription className="text-gray-400">
              Token ID: <span className="font-mono text-white">{selectedToken?.token_id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-bold text-gray-400 mb-2 block">
                Nível
              </label>
              <Select
                value={editData.nivel?.toString()}
                onValueChange={(v) => setEditData({ ...editData, nivel: parseInt(v) })}
              >
                <SelectTrigger className="bg-[#0a0a1a] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#13132B] border-white/10 text-white">
                  <SelectItem value="1">1 - Iniciante</SelectItem>
                  <SelectItem value="2">2 - Bronze</SelectItem>
                  <SelectItem value="3">3 - Prata</SelectItem>
                  <SelectItem value="4">4 - Ouro</SelectItem>
                  <SelectItem value="5">5 - Diamante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-400 mb-2 block">
                Pontos
              </label>
              <Input
                type="number"
                value={editData.pontos || 0}
                onChange={(e) =>
                  setEditData({ ...editData, pontos: parseInt(e.target.value) || 0 })
                }
                className="bg-[#0a0a1a] border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-400 mb-2 block">
                Status
              </label>
              <Select
                value={editData.status}
                onValueChange={(v) => setEditData({ ...editData, status: v })}
              >
                <SelectTrigger className="bg-[#0a0a1a] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#13132B] border-white/10 text-white">
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.verificado || false}
                  onChange={(e) =>
                    setEditData({ ...editData, verificado: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-[#0a0a1a] border-white/20 accent-purple-500"
                />
                <span className="text-sm font-semibold text-gray-300">Verificado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.whatsapp_verificado || false}
                  onChange={(e) =>
                    setEditData({ ...editData, whatsapp_verificado: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-[#0a0a1a] border-white/20 accent-green-500"
                />
                <span className="text-sm font-semibold text-gray-300">WhatsApp OK</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateTokenMutation.isPending}
              className="bg-gradient-to-r from-brand-coral to-brand-orange text-white"
            >
              {updateTokenMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components
function StatsCard({ label, value, icon: Icon, color, isCurrency }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex items-center gap-4`}>
      <div className={`p-3 rounded-xl bg-[#0a0a1a] border border-white/5`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className={`text-2xl font-black ${isCurrency ? 'text-green-400' : 'text-white'}`}>{value}</p>
        <p className="text-xs uppercase font-bold opacity-70">{label}</p>
      </div>
    </div>
  );
}

export default function AdminTokens() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminTokensPage />
    </ProtectedRoute>
  );
}