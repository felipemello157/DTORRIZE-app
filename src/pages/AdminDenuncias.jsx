/**
 * ADMIN DENÚNCIAS - Página de gestão de denúncias
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  ExternalLink,
  Image as ImageIcon,
  ChevronLeft,
  XCircle,
  ShieldAlert
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useNavigate } from "react-router-dom";

// Cores adaptadas para Dark Mode
const categoriaColors = {
  EMPREGO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CLINICA: "bg-green-500/10 text-green-400 border-green-500/20",
  CADASTRO: "bg-red-500/10 text-red-400 border-red-500/20",
  MARKETPLACE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  FREELANCE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  DOUTORIZZE: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  FORNECEDOR: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  GRUPO_LINK: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  CREDITO: "bg-teal-500/10 text-teal-400 border-teal-500/20"
};

const categoriaLabels = {
  EMPREGO: "Vaga de emprego",
  CLINICA: "Clínica/Consultório",
  CADASTRO: "Cadastro falso",
  MARKETPLACE: "Produto do marketplace",
  FREELANCE: "Trabalho freelance",
  DOUTORIZZE: "Problema na plataforma",
  FORNECEDOR: "Fornecedor",
  GRUPO_LINK: "Link/grupo suspeito",
  CREDITO: "Solicitação de crédito"
};

const statusColors = {
  PENDENTE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  ANALISANDO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCEDENTE: "bg-red-500/10 text-red-400 border-red-500/20",
  IMPROCEDENTE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  RESOLVIDO: "bg-green-500/10 text-green-400 border-green-500/20"
};

const tipoAlvoLabels = {
  PROFISSIONAL: "Profissional",
  CLINICA: "Clínica",
  VAGA: "Vaga",
  MARKETPLACE: "Produto",
  USUARIO: "Usuário"
};

function AdminDenunciasContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("PENDENTE");
  const [modalDenuncia, setModalDenuncia] = useState(null);
  const [respostaAdmin, setRespostaAdmin] = useState("");

  // Buscar todas as denúncias
  const { data: denuncias = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      return await base44.entities.Report.list("-created_date");
    }
  });

  // Filtrar por status
  const denunciasFiltradas = denuncias.filter(d => {
    if (activeTab === "PENDENTE") return d.status === "PENDENTE";
    if (activeTab === "ANALISANDO") return d.status === "ANALISANDO";
    if (activeTab === "RESOLVIDAS") return d.status === "RESOLVIDO";
    return false;
  });

  // Contadores
  const pendentes = denuncias.filter(d => d.status === "PENDENTE").length;
  const analisando = denuncias.filter(d => d.status === "ANALISANDO").length;
  const resolvidasHoje = denuncias.filter(d => {
    if (d.status !== "RESOLVIDO" || !d.resolved_date) return false;
    const hoje = new Date();
    const resolvido = new Date(d.resolved_date);
    return hoje.toDateString() === resolvido.toDateString();
  }).length;

  // Mutation para atualizar status
  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status, resposta }) => {
      const updateData = { status };
      if (resposta) updateData.resposta_admin = resposta;
      if (status === "RESOLVIDO") updateData.resolved_date = new Date().toISOString();

      return await base44.entities.Report.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setModalDenuncia(null);
      setRespostaAdmin("");
      toast.success("✅ Status atualizado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Actions
  const handleIniciarAnalise = (denuncia) => {
    atualizarStatusMutation.mutate({ id: denuncia.id, status: "ANALISANDO" });
  };

  const handleMarcarProcedente = (denuncia) => {
    setModalDenuncia({ ...denuncia, novoStatus: "PROCEDENTE", showBanOption: true });
  };

  const handleMarcarImprocedente = (denuncia) => {
    setModalDenuncia({ ...denuncia, novoStatus: "IMPROCEDENTE" });
  };

  const handleResolver = (denuncia) => {
    setModalDenuncia({ ...denuncia, novoStatus: "RESOLVIDO" });
  };

  const confirmarAcao = async () => {
    if (!modalDenuncia) return;

    try {
      // Banir usuário se opção selecionada
      if (modalDenuncia.banirUsuario && modalDenuncia.tipo_alvo === "PROFISSIONAL") {
        const diasSuspensao = parseInt(modalDenuncia.diasBan) || 30;
        const suspensaoAte = new Date();
        suspensaoAte.setDate(suspensaoAte.getDate() + diasSuspensao);

        await base44.entities.Professional.update(modalDenuncia.alvo_id, {
          esta_suspenso: true,
          suspenso_ate: suspensaoAte.toISOString(),
          motivo_suspensao: respostaAdmin || "Denúncia procedente"
        });
        toast.success(`🚫 Profissional banido por ${diasSuspensao} dias`);
      }

      // Atualizar status da denúncia
      atualizarStatusMutation.mutate({
        id: modalDenuncia.id,
        status: modalDenuncia.novoStatus,
        resposta: respostaAdmin || undefined
      });
    } catch (error) {
      toast.error("Erro ao processar ação: " + error.message);
    }
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
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
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Gerenciar Denúncias</h1>
                <p className="text-gray-400">Moderação e segurança</p>
              </div>
            </div>

            {/* Contadores */}
            <div className="flex gap-4">
              <StatsCard label="Pendentes" count={pendentes} color="yellow" />
              <StatsCard label="Analisando" count={analisando} color="blue" />
              <StatsCard label="Resolvidas (Hoje)" count={resolvidasHoje} color="green" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-[#13132B] rounded-xl border border-white/10 w-fit">
          <TabButton
            active={activeTab === "PENDENTE"}
            onClick={() => setActiveTab("PENDENTE")}
            label={`Pendentes (${pendentes})`}
          />
          <TabButton
            active={activeTab === "ANALISANDO"}
            onClick={() => setActiveTab("ANALISANDO")}
            label={`Analisando (${analisando})`}
          />
          <TabButton
            active={activeTab === "RESOLVIDAS"}
            onClick={() => setActiveTab("RESOLVIDAS")}
            label="Resolvidas"
          />
        </div>

        {/* Lista */}
        <div className="space-y-4">
          <AnimatePresence>
            {denunciasFiltradas.length === 0 ? (
              <div className="bg-[#13132B] rounded-3xl border border-white/10 p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Nenhuma denúncia nesta categoria</p>
              </div>
            ) : (
              denunciasFiltradas.map((denuncia, index) => (
                <motion.div
                  key={denuncia.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#13132B] rounded-3xl border border-white/10 p-6 hover:border-white/20 transition-all"
                >
                  {/* Header do Card */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-white/5">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={categoriaColors[denuncia.categoria]}>
                        {categoriaLabels[denuncia.categoria]}
                      </Badge>
                      <Badge className={statusColors[denuncia.status]}>
                        {denuncia.status}
                      </Badge>
                      <Badge className="bg-white/5 text-gray-400 border-white/10">
                        {tipoAlvoLabels[denuncia.tipo_alvo]}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(denuncia.created_date)}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase mb-2">Motivo da Denúncia</p>
                      <p className="text-white bg-[#0a0a1a] border border-white/10 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
                        {denuncia.motivo}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">IDs Relacionados</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a1a] rounded-lg border border-white/5">
                            <span className="text-gray-500 text-xs">ALVO:</span>
                            <code className="text-sm font-mono text-brand-primary flex-1 truncate">{denuncia.alvo_id}</code>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a1a] rounded-lg border border-white/5">
                            <span className="text-gray-500 text-xs">AUTHOR:</span>
                            <code className="text-sm font-mono text-gray-400 flex-1 truncate">{denuncia.denunciante_id}</code>
                          </div>
                        </div>
                      </div>

                      {denuncia.evidencia_url && (
                        <div>
                          <p className="text-sm font-bold text-gray-500 uppercase mb-2">Evidência</p>
                          <a
                            href={denuncia.evidencia_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all w-fit font-bold"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Ver Imagem
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resposta Admin */}
                  {denuncia.resposta_admin && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                      <p className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Resposta da Moderação:
                      </p>
                      <p className="text-blue-300/80">{denuncia.resposta_admin}</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
                    {denuncia.status === "PENDENTE" && (
                      <ActionBtn
                        onClick={() => handleIniciarAnalise(denuncia)}
                        disabled={atualizarStatusMutation.isPending}
                        icon={Eye}
                        label="Iniciar Análise"
                        color="blue"
                      />
                    )}

                    {(denuncia.status === "ANALISANDO" || denuncia.status === "PENDENTE") && (
                      <>
                        <ActionBtn
                          onClick={() => handleMarcarProcedente(denuncia)}
                          disabled={atualizarStatusMutation.isPending}
                          icon={AlertTriangle}
                          label="Procedente"
                          color="red"
                        />
                        <ActionBtn
                          onClick={() => handleMarcarImprocedente(denuncia)}
                          disabled={atualizarStatusMutation.isPending}
                          icon={XCircle}
                          label="Improcedente"
                          color="gray"
                        />
                      </>
                    )}

                    {(denuncia.status === "PROCEDENTE" || denuncia.status === "IMPROCEDENTE") && (
                      <ActionBtn
                        onClick={() => handleResolver(denuncia)}
                        disabled={atualizarStatusMutation.isPending}
                        icon={CheckCircle2}
                        label="Marcar como Resolvido"
                        color="green"
                      />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal Confirmação */}
      <AnimatePresence>
        {modalDenuncia && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-6 max-w-lg w-full"
            >
              <h3 className="text-2xl font-black text-white mb-4">Confirmar Ação</h3>
              <p className="text-gray-400 mb-6">
                Marcar denúncia como <strong className="text-white">{modalDenuncia.novoStatus}</strong>?
              </p>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 auth-label uppercase mb-2">
                  Observação Interna (Opcional)
                </label>
                <textarea
                  value={respostaAdmin}
                  onChange={(e) => setRespostaAdmin(e.target.value)}
                  placeholder="Justificativa ou nota..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none resize-none"
                />
              </div>

              {/* Banir Option */}
              {modalDenuncia.showBanOption && modalDenuncia.tipo_alvo === "PROFISSIONAL" && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={modalDenuncia.banirUsuario || false}
                      onChange={(e) => setModalDenuncia({ ...modalDenuncia, banirUsuario: e.target.checked })}
                      className="w-5 h-5 accent-red-500 rounded bg-[#0a0a1a] border-white/20"
                    />
                    <span className="font-bold text-red-400">Banir Profissional Temporariamente</span>
                  </label>

                  {modalDenuncia.banirUsuario && (
                    <select
                      value={modalDenuncia.diasBan || "30"}
                      onChange={(e) => setModalDenuncia({ ...modalDenuncia, diasBan: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0a1a] border border-red-500/30 rounded-lg text-white outline-none"
                    >
                      <option value="7">7 dias</option>
                      <option value="30">30 dias</option>
                      <option value="90">90 dias</option>
                      <option value="365">1 ano</option>
                    </select>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalDenuncia(null);
                    setRespostaAdmin("");
                  }}
                  className="flex-1 py-3 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAcao}
                  disabled={atualizarStatusMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-Components

function Badge({ children, className }) {
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${className}`}>
      {children}
    </span>
  );
}

function StatsCard({ label, count, color }) {
  const colors = {
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <div className={`px-4 py-2 rounded-xl border ${colors[color]} flex flex-col items-center justify-center min-w-[100px]`}>
      <span className="text-2xl font-black">{count}</span>
      <span className="text-xs uppercase font-bold opacity-70">{label}</span>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${active
          ? "bg-white/10 text-white shadow-lg border border-white/5"
          : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
    >
      {label}
    </button>
  );
}

function ActionBtn({ onClick, disabled, icon: Icon, label, color }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20",
    red: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20",
    green: "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20",
    gray: "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-bold border transition-all flex items-center gap-2 ${colors[color]} disabled:opacity-50`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function AdminDenuncias() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDenunciasContent />
    </ProtectedRoute>
  );
}