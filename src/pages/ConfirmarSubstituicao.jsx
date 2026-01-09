import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { confirmarSubstituicao } from "@/components/api/substituicao";

export default function ConfirmarSubstituicao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const substituicaoId = searchParams.get("id") || window.location.pathname.split("/").pop();
  const codigo = searchParams.get("codigo");

  const [substituicao, setSubstituicao] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisao, setDecisao] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const sub = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
        setSubstituicao(sub);

        if (sub.profissional_escolhido_id) {
          const prof = await base44.entities.Professional.get(sub.profissional_escolhido_id);
          setProfissional(prof);
        }
      } catch (error) {
        toast.error("Erro ao carregar substituição");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [substituicaoId]);

  const confirmarMutation = useMutation({
    mutationFn: async ({ aprovado, motivo }) => {
      return await confirmarSubstituicao(substituicaoId, codigo, aprovado, motivo);
    },
    onSuccess: () => {
      toast.success(decisao === "aprovado" ? "Substituição confirmada!" : "Substituição rejeitada");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar confirmação");
    }
  });

  const handleConfirmar = (aprovado) => {
    setDecisao(aprovado ? "aprovado" : "rejeitado");
  };

  const handleSubmit = () => {
    if (decisao === "rejeitado" && !motivoRejeicao.trim()) {
      toast.error("Por favor, informe o motivo da rejeição");
      return;
    }

    confirmarMutation.mutate({
      aprovado: decisao === "aprovado",
      motivo: decisao === "rejeitado" ? motivoRejeicao : null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary"></div>
      </div>
    );
  }

  if (!substituicao || !profissional) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-30 grayscale">❌</div>
          <h3 className="text-2xl font-bold text-gray-400">Link inválido ou expirado</h3>
        </div>
      </div>
    );
  }

  if (confirmarMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#13132B] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/10 relative z-10"
        >
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 border border-white/10 ${decisao === "aprovado" ? "bg-green-500/20" : "bg-red-500/20"
            }`}>
            {decisao === "aprovado" ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          <h2 className="text-3xl font-black text-white mb-4">
            {decisao === "aprovado" ? "Substituição Confirmada!" : "Substituição Rejeitada"}
          </h2>
          <p className="text-gray-400 mb-6">
            {decisao === "aprovado"
              ? "O profissional foi notificado e a substituição está confirmada."
              : "O profissional foi notificado sobre a rejeição."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (decisao) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#13132B] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 relative z-10"
        >
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 border border-white/10 ${decisao === "aprovado" ? "bg-green-500/20" : "bg-red-500/20"
            }`}>
            {decisao === "aprovado" ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>

          <h2 className="text-2xl font-black text-white mb-4 text-center">
            {decisao === "aprovado" ? "Confirmar Substituição" : "Rejeitar Substituição"}
          </h2>

          {decisao === "rejeitado" && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Por que está rejeitando? *
              </label>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-red-500 outline-none h-32 resize-none placeholder:text-gray-600"
                placeholder="Ex: O profissional já não trabalha mais aqui, não temos agenda, etc."
              ></textarea>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setDecisao(null)}
              className="flex-1 py-3 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-all"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={confirmarMutation.isPending}
              className={`flex-1 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-105 ${decisao === "aprovado"
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-500/20"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/20"
                } disabled:opacity-50`}
            >
              {confirmarMutation.isPending ? "Processando..." : "Confirmar"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#13132B] rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-orange/10 border border-brand-orange/20 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-brand-orange" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Autorização de Substituição
          </h1>
          <p className="text-gray-400">
            Por favor, revise os dados e confirme ou rejeite
          </p>
        </div>

        <div className="bg-[#0a0a1a] rounded-2xl p-6 mb-8 border border-white/10">
          <h3 className="font-black text-lg text-white mb-4">Dados da Substituição</h3>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Profissional Escolhido</p>
              <p className="font-bold text-white">{profissional.nome_completo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Especialidade</p>
              <p className="font-bold text-white">{substituicao.especialidade_necessaria}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Local</p>
              <p className="font-bold text-white">{substituicao.nome_clinica}</p>
              <p className="text-sm text-gray-400">{substituicao.cidade}/{substituicao.uf}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-gray-500">Avaliação</p>
                <div className="flex items-center gap-1 font-bold text-white">
                  <Star className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                  {profissional.media_avaliacoes || "N/A"}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Comparecimento</p>
                <div className="flex items-center gap-1 font-bold text-white">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {profissional.taxa_comparecimento || 100}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleConfirmar(false)}
            className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20"
          >
            ❌ REJEITAR
          </button>
          <button
            onClick={() => handleConfirmar(true)}
            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-green-500/20 transition-all"
          >
            ✅ AUTORIZAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}