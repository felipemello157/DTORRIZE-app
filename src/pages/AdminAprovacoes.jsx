/**
 * ADMIN APROVAÇÕES - Página de aprovação de cadastros
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  User,
  Building2,
  FileText,
  MapPin,
  ExternalLink,
  XCircle,
  AlertTriangle,
  ChevronLeft
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useNavigate } from "react-router-dom";

function AdminAprovacoesContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profissionais");
  const [modalReprovacao, setModalReprovacao] = useState(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState("");
  const [modalDocumentos, setModalDocumentos] = useState(null);
  const [solicitacaoDoc, setSolicitacaoDoc] = useState("");

  // Buscar profissionais pendentes
  const { data: profissionais = [], isLoading: loadingProfs } = useQuery({
    queryKey: ["admin-profissionais"],
    queryFn: async () => {
      return await base44.entities.Professional.filter({ status_cadastro: "EM_ANALISE" });
    }
  });

  // Buscar clínicas pendentes
  const { data: clinicas = [], isLoading: loadingClinicas } = useQuery({
    queryKey: ["admin-clinicas"],
    queryFn: async () => {
      return await base44.entities.CompanyUnit.filter({ status_cadastro: "EM_ANALISE" });
    }
  });

  // Buscar hospitais pendentes
  const { data: hospitais = [], isLoading: loadingHospitais } = useQuery({
    queryKey: ["admin-hospitais"],
    queryFn: async () => {
      return await base44.entities.Hospital.filter({ status_cadastro: "EM_ANALISE" });
    }
  });

  // Mutation para aprovar
  const aprovarMutation = useMutation({
    mutationFn: async ({ tipo, id, userId }) => {
      const entity = tipo === "profissional"
        ? base44.entities.Professional
        : tipo === "hospital"
          ? base44.entities.Hospital
          : base44.entities.CompanyUnit;

      const result = await entity.update(id, {
        status_cadastro: "APROVADO",
        approved_at: new Date().toISOString()
      });

      // Enviar push notification (fire & forget)
      fetch('http://164.152.59.49:5678/webhook/push-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: '✅ Cadastro Aprovado!',
          body: `Seu cadastro foi aprovado! Bem-vindo ao Doutorizze!`,
          data: { type: 'APROVACAO_CADASTRO', entity_type: tipo }
        })
      }).catch(() => { });

      return result;
    },
    onSuccess: (_, { tipo }) => {
      const queryKey = tipo === "profissional" ? "profissionais" : tipo === "hospital" ? "hospitais" : "clinicas";
      queryClient.invalidateQueries({ queryKey: [`admin-${queryKey}`] });
      toast.success("✅ Cadastro aprovado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation para reprovar
  const reprovarMutation = useMutation({
    mutationFn: async ({ tipo, id, motivo }) => {
      const entity = tipo === "profissional"
        ? base44.entities.Professional
        : tipo === "hospital"
          ? base44.entities.Hospital
          : base44.entities.CompanyUnit;

      return await entity.update(id, {
        status_cadastro: "REPROVADO",
        motivo_reprovacao: motivo
      });
    },
    onSuccess: (_, { tipo }) => {
      const queryKey = tipo === "profissional" ? "profissionais" : tipo === "hospital" ? "hospitais" : "clinicas";
      queryClient.invalidateQueries({ queryKey: [`admin-${queryKey}`] });
      setModalReprovacao(null);
      setMotivoReprovacao("");
      toast.success("❌ Cadastro reprovado");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation para solicitar documentos
  const solicitarDocsMutation = useMutation({
    mutationFn: async ({ tipo, id, userId, mensagem }) => {
      // Enviar notificação
      await fetch('http://164.152.59.49:5678/webhook/push-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: '📄 Documentos Necessários',
          body: mensagem,
          data: { type: 'DOCS_PENDENTES', entity_type: tipo }
        })
      });
      return { success: true };
    },
    onSuccess: () => {
      setModalDocumentos(null);
      setSolicitacaoDoc("");
      toast.success("✉️ Solicitação enviada!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  const handleAprovar = (tipo, id, userId) => {
    aprovarMutation.mutate({ tipo, id, userId });
  };

  const handleReprovar = () => {
    if (!modalReprovacao || !motivoReprovacao.trim()) {
      toast.error("Informe o motivo da reprovação");
      return;
    }
    reprovarMutation.mutate({
      tipo: modalReprovacao.tipo,
      id: modalReprovacao.id,
      motivo: motivoReprovacao
    });
  };

  const handleSolicitarDocs = () => {
    if (!modalDocumentos || !solicitacaoDoc.trim()) {
      toast.error("Informe quais documentos são necessários");
      return;
    }
    solicitarDocsMutation.mutate({
      tipo: modalDocumentos.tipo,
      id: modalDocumentos.id,
      userId: modalDocumentos.userId,
      mensagem: solicitacaoDoc
    });
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  const isLoading = loadingProfs || loadingClinicas || loadingHospitais;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

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
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Aprovação de Cadastros</h1>
                <p className="text-gray-400">Análise de novos usuários</p>
              </div>
            </div>

            {/* Contadores */}
            <div className="flex gap-4">
              <StatsCard label="Profissionais" count={profissionais.length} icon={User} color="blue" />
              <StatsCard label="Clínicas" count={clinicas.length} icon={Building2} color="purple" />
              <StatsCard label="Hospitais" count={hospitais.length} icon={Building2} color="green" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-[#13132B] rounded-xl border border-white/10 w-fit">
          <TabButton
            active={activeTab === "profissionais"}
            onClick={() => setActiveTab("profissionais")}
            label={`Profissionais (${profissionais.length})`}
          />
          <TabButton
            active={activeTab === "clinicas"}
            onClick={() => setActiveTab("clinicas")}
            label={`Clínicas (${clinicas.length})`}
          />
          <TabButton
            active={activeTab === "hospitais"}
            onClick={() => setActiveTab("hospitais")}
            label={`Hospitais (${hospitais.length})`}
          />
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-brand-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {activeTab === "profissionais" && profissionais.map((prof, index) => (
                <PendingCard
                  key={prof.id}
                  index={index}
                  title={prof.nome_completo}
                  subtitle={`${prof.tipo_profissional} - ${prof.especialidade_principal}`}
                  details={`${prof.registro_conselho}/${prof.uf_conselho}`}
                  timeAgo={getTimeAgo(prof.created_date)}
                  initial={prof.nome_completo?.[0]}
                  colorClass="from-blue-400 to-blue-600"
                  documentUrl={prof.selfie_documento_url}
                  onApprove={() => handleAprovar("profissional", prof.id, prof.user_id)}
                  onReject={() => setModalReprovacao({ tipo: "profissional", id: prof.id, nome: prof.nome_completo })}
                  onDocs={() => setModalDocumentos({ tipo: "profissional", id: prof.id, userId: prof.user_id, nome: prof.nome_completo })}
                  isApproving={aprovarMutation.isPending}
                />
              ))}

              {activeTab === "clinicas" && clinicas.map((clinica, index) => (
                <PendingCard
                  key={clinica.id}
                  index={index}
                  title={clinica.nome_fantasia}
                  subtitle={clinica.razao_social}
                  details={`CNPJ: ${clinica.cnpj}`}
                  location={`${clinica.cidade} - ${clinica.uf}`}
                  timeAgo={getTimeAgo(clinica.created_date)}
                  initial={<Building2 className="w-8 h-8" />}
                  isIcon={true}
                  colorClass="from-purple-400 to-purple-600"
                  documentUrl={clinica.documento_responsavel_url}
                  onApprove={() => handleAprovar("clinica", clinica.id, clinica.owner_id)}
                  onReject={() => setModalReprovacao({ tipo: "clinica", id: clinica.id, nome: clinica.nome_fantasia })}
                  onDocs={() => setModalDocumentos({ tipo: "clinica", id: clinica.id, userId: clinica.owner_id, nome: clinica.nome_fantasia })}
                  isApproving={aprovarMutation.isPending}
                />
              ))}

              {activeTab === "hospitais" && hospitais.map((hospital, index) => (
                <PendingCard
                  key={hospital.id}
                  index={index}
                  title={hospital.nome_fantasia}
                  subtitle={hospital.razao_social}
                  details={`CNPJ: ${hospital.cnpj}`}
                  location={`${hospital.cidade} - ${hospital.uf}`}
                  timeAgo={getTimeAgo(hospital.created_date)}
                  initial={<Building2 className="w-8 h-8" />}
                  isIcon={true}
                  colorClass="from-green-400 to-green-600"
                  documentUrl={hospital.documento_url}
                  onApprove={() => handleAprovar("hospital", hospital.id, hospital.user_id)}
                  onReject={() => setModalReprovacao({ tipo: "hospital", id: hospital.id, nome: hospital.nome_fantasia })}
                  onDocs={() => setModalDocumentos({ tipo: "hospital", id: hospital.id, userId: hospital.user_id, nome: hospital.nome_fantasia })}
                  isApproving={aprovarMutation.isPending}
                />
              ))}
            </AnimatePresence>

            {/* Empty States */}
            {((activeTab === "profissionais" && profissionais.length === 0) ||
              (activeTab === "clinicas" && clinicas.length === 0) ||
              (activeTab === "hospitais" && hospitais.length === 0)) && (
                <div className="bg-[#13132B] rounded-3xl border border-white/10 p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhum cadastro pendente nesta categoria</p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Modal Docs */}
      <AnimatePresence>
        {modalDocumentos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white">Solicitar Documentos</h3>
                <button onClick={() => setModalDocumentos(null)} className="text-gray-400 hover:text-white"><XCircle /></button>
              </div>

              <p className="text-gray-400 mb-4">
                Para <strong>{modalDocumentos.nome}</strong>:
              </p>

              <textarea
                value={solicitacaoDoc}
                onChange={(e) => setSolicitacaoDoc(e.target.value)}
                placeholder="Ex: Precisamos de cópia do RG..."
                rows={4}
                className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none resize-none mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSolicitarDocs}
                  disabled={solicitarDocsMutation.isPending || !solicitacaoDoc.trim()}
                  className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {solicitarDocsMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Reprovação */}
      <AnimatePresence>
        {modalReprovacao && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#13132B] rounded-3xl border border-red-500/30 shadow-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <AlertTriangle className="text-red-500" /> Reprovar Cadastro
                </h3>
                <button onClick={() => setModalReprovacao(null)} className="text-gray-400 hover:text-white"><XCircle /></button>
              </div>

              <p className="text-gray-400 mb-4">
                Motivo da reprovação para <strong>{modalReprovacao.nome}</strong>:
              </p>

              <textarea
                value={motivoReprovacao}
                onChange={(e) => setMotivoReprovacao(e.target.value)}
                placeholder="Explique o motivo..."
                rows={4}
                className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-red-500 outline-none resize-none mb-6"
              />

              <button
                onClick={handleReprovar}
                disabled={reprovarMutation.isPending || !motivoReprovacao.trim()}
                className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {reprovarMutation.isPending ? "Salvando..." : "Confirmar Reprovação"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components for better organization

function StatsCard({ label, count, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className={`px-4 py-2 rounded-xl border ${colors[color]} flex items-center gap-3`}>
      <Icon className="w-5 h-5" />
      <div>
        <p className="text-xs font-bold uppercase opacity-70">{label}</p>
        <p className="text-xl font-black">{count}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${active
          ? "bg-white/10 text-white shadow-lg"
          : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
    >
      {label}
    </button>
  );
}

function PendingCard({
  index, title, subtitle, details, location, timeAgo,
  initial, isIcon, colorClass, documentUrl,
  onApprove, onReject, onDocs, isApproving
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#13132B] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
    >
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {isIcon ? initial : initial?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-gray-400 text-sm">{subtitle}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
                {details}
              </span>
              {location && (
                <span className="text-xs flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
                  <MapPin className="w-3 h-3" /> {location}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-black/20 px-3 py-1 rounded-full whitespace-nowrap">
          {timeAgo}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {documentUrl && (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-all border border-white/5 hover:text-white flex items-center gap-2"
            title="Ver Documento"
          >
            <FileText className="w-5 h-5" />
          </a>
        )}

        <div className="flex-1 flex gap-3">
          <button
            onClick={onApprove}
            disabled={isApproving}
            className="flex-1 py-3 bg-green-500/10 text-green-400 font-bold rounded-xl hover:bg-green-500/20 border border-green-500/20 transition-all disabled:opacity-50"
          >
            Aprovar
          </button>
          <button
            onClick={onDocs}
            className="px-6 py-3 bg-blue-500/10 text-blue-400 font-bold rounded-xl hover:bg-blue-500/20 border border-blue-500/20 transition-all"
          >
            Docs
          </button>
          <button
            onClick={onReject}
            className="px-6 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all"
          >
            Reprovar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminAprovacoes() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminAprovacoesContent />
    </ProtectedRoute>
  );
}