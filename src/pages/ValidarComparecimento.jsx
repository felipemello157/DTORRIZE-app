import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { validarComparecimento } from "@/components/api/substituicao";
import { PONTUALIDADE } from "@/components/constants/substituicao";

export default function ValidarComparecimento() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const substituicaoId = urlParams.get("id");

  const [substituicao, setSubstituicao] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    compareceu: null,
    avaliacao_clinica: 0,
    pontualidade: "",
    minutos_atraso: 0,
    observacoes_clinica: "",
    motivo_nao_comparecimento: ""
  });

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

  const validarMutation = useMutation({
    mutationFn: async () => {
      return await validarComparecimento(substituicaoId, formData);
    },
    onSuccess: () => {
      toast.success("Validação registrada com sucesso!");
      navigate(-1);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao validar comparecimento");
    }
  });

  const handleSubmit = () => {
    if (formData.compareceu === null) {
      toast.error("Informe se o profissional compareceu");
      return;
    }

    if (formData.compareceu && formData.avaliacao_clinica === 0) {
      toast.error("Por favor, avalie o profissional");
      return;
    }

    if (!formData.compareceu && !formData.motivo_nao_comparecimento.trim()) {
      toast.error("Informe o motivo do não comparecimento");
      return;
    }

    validarMutation.mutate();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  if (!substituicao || !profissional) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-50 grayscale">❌</div>
          <h3 className="text-2xl font-bold text-gray-400">Substituição não encontrada</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="relative z-10 bg-[#13132B]/50 backdrop-blur-xl border-b border-white/10 py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl mb-4 border border-white/10">
            ✅
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            VALIDAR COMPARECIMENTO
          </h1>
          <p className="text-white/60 text-xl font-medium">
            {profissional.nome_completo}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          {/* Compareceu? */}
          <div className="mb-8">
            <h3 className="text-xl font-black text-white mb-4">
              O profissional compareceu?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, compareceu: true })}
                className={`p-6 rounded-2xl border transition-all ${formData.compareceu === true
                    ? "border-green-500 bg-green-500/20"
                    : "border-white/10 bg-[#0a0a1a] hover:border-green-500/50 hover:bg-green-500/10"
                  }`}
              >
                <CheckCircle className={`w-12 h-12 mx-auto mb-2 ${formData.compareceu === true ? "text-green-400" : "text-gray-500"}`} />
                <p className={`font-bold ${formData.compareceu === true ? "text-green-400" : "text-gray-400"}`}>SIM</p>
              </button>
              <button
                onClick={() => setFormData({ ...formData, compareceu: false })}
                className={`p-6 rounded-2xl border transition-all ${formData.compareceu === false
                    ? "border-red-500 bg-red-500/20"
                    : "border-white/10 bg-[#0a0a1a] hover:border-red-500/50 hover:bg-red-500/10"
                  }`}
              >
                <XCircle className={`w-12 h-12 mx-auto mb-2 ${formData.compareceu === false ? "text-red-400" : "text-gray-500"}`} />
                <p className={`font-bold ${formData.compareceu === false ? "text-red-400" : "text-gray-400"}`}>NÃO</p>
              </button>
            </div>
          </div>

          {/* Se COMPARECEU */}
          {formData.compareceu === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-6"
            >
              {/* Avaliação */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Como você avalia o profissional? *
                </label>
                <div className="flex gap-2 justify-center bg-[#0a0a1a] p-4 rounded-2xl border border-white/10">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, avaliacao_clinica: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${star <= formData.avaliacao_clinica
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Pontualidade */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Pontualidade
                </label>
                <select
                  value={formData.pontualidade}
                  onChange={(e) => setFormData({ ...formData, pontualidade: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-primary outline-none"
                >
                  <option value="">Selecione...</option>
                  {PONTUALIDADE.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {formData.pontualidade === "ATRASADO" && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Quantos minutos de atraso?
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minutos_atraso}
                    onChange={(e) => setFormData({ ...formData, minutos_atraso: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-primary outline-none"
                  />
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Observações sobre o atendimento (opcional)
                </label>
                <textarea
                  value={formData.observacoes_clinica}
                  onChange={(e) => setFormData({ ...formData, observacoes_clinica: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-primary outline-none h-32 resize-none"
                  placeholder="Comente sobre a qualidade do atendimento, profissionalismo, etc."
                ></textarea>
              </div>
            </motion.div>
          )}

          {/* Se NÃO COMPARECEU */}
          {formData.compareceu === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Por que o profissional não compareceu? *
                </label>
                <textarea
                  value={formData.motivo_nao_comparecimento}
                  onChange={(e) => setFormData({ ...formData, motivo_nao_comparecimento: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a1a] border border-red-500/30 text-white rounded-xl focus:border-red-500 outline-none h-32 resize-none placeholder-gray-500"
                  placeholder="Ex: Não avisou, não respondeu contato, não apareceu, etc."
                ></textarea>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-6">
                <p className="text-sm text-red-400">
                  ⚠️ <strong>Importante:</strong> O não comparecimento sem justificativa gera advertência ou suspensão automática do profissional.
                </p>
              </div>
            </motion.div>
          )}

          {/* Botão */}
          {formData.compareceu !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8"
            >
              <button
                onClick={handleSubmit}
                disabled={validarMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black text-lg rounded-2xl hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50"
              >
                {validarMutation.isPending ? "Enviando..." : "CONFIRMAR VALIDAÇÃO"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}