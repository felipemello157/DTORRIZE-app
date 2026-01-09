import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Stethoscope,
  CheckCircle2,
  Plus,
  Trash2,
  Syringe,
  Activity,
  HeartPulse,
  Save,
  Loader2
} from "lucide-react";

const SERVICOS_SUGERIDOS = [
  "Aplicação de Injetáveis",
  "Aferição de Pressão",
  "Curativos Simples",
  "Curativos Especiais",
  "Sondagem Vesical",
  "Banho no Leito",
  "Cuidados Pós-Operatórios",
  "Retirada de Pontos",
  "Teste de Glicemia",
  "Nebulização"
];

export default function ServicosPrestados() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [novoServico, setNovoServico] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: professional, isLoading } = useQuery({
    queryKey: ["professional-servicos", user?.id],
    queryFn: async () => {
      const results = await base44.entities.Professional.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user?.id
  });

  const updateServicosMutation = useMutation({
    mutationFn: async (novosServicos) => {
      await base44.entities.Professional.update(professional.id, {
        servicos_prestados: novosServicos
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professional-servicos"]);
      toast.success("Lista de serviços atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar serviços")
  });

  const toggleServico = (servico) => {
    const atuais = professional?.servicos_prestados || [];
    let novos;

    if (atuais.includes(servico)) {
      novos = atuais.filter(s => s !== servico);
    } else {
      novos = [...atuais, servico];
    }

    updateServicosMutation.mutate(novos);
  };

  const handleAdicionarPersonalizado = (e) => {
    e.preventDefault();
    if (!novoServico.trim()) return;

    const servicoFormatado = novoServico.trim();
    const atuais = professional?.servicos_prestados || [];

    if (atuais.includes(servicoFormatado)) {
      toast.error("Serviço já adicionado!");
      return;
    }

    updateServicosMutation.mutate([...atuais, servicoFormatado]);
    setNovoServico("");
  };

  if (isLoading || !professional) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  const servicosAtuais = professional.servicos_prestados || [];
  const servicosExtras = servicosAtuais.filter(s => !SERVICOS_SUGERIDOS.includes(s));

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24">
      {/* Header */}
      <div className="bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/10 p-6 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Serviços Prestados</h1>
              <p className="text-sm text-gray-400">Selecione os procedimentos que você realiza</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Serviços Sugeridos */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-primary" />
            Principais Procedimentos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SERVICOS_SUGERIDOS.map((servico) => {
              const selecionado = servicosAtuais.includes(servico);
              return (
                <motion.div
                  key={servico}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleServico(servico)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3 ${selecionado
                      ? "bg-brand-primary/10 border-brand-primary text-white"
                      : "bg-[#13132B] border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selecionado
                      ? "bg-brand-primary border-brand-primary"
                      : "border-gray-500"
                    }`}>
                    {selecionado && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-medium">{servico}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Adicionar Personalizado */}
        <div className="bg-[#13132B] p-6 rounded-3xl border border-white/10 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-brand-primary" />
            Adicionar Outro Serviço
          </h2>

          <form onSubmit={handleAdicionarPersonalizado} className="flex gap-3">
            <input
              type="text"
              value={novoServico}
              onChange={(e) => setNovoServico(e.target.value)}
              placeholder="Ex: Massagem Terapêutica"
              className="flex-1 bg-[#0a0a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={!novoServico.trim()}
              className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Adicionar
            </button>
          </form>

          {/* Lista de Extras */}
          {servicosExtras.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-400 font-medium mb-2">Outros serviços adicionados:</p>
              <AnimatePresence>
                {servicosExtras.map((servico) => (
                  <motion.div
                    key={servico}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-3 bg-[#0a0a1a] rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <HeartPulse className="w-4 h-4 text-brand-secondary" />
                      <span className="text-white">{servico}</span>
                    </div>
                    <button
                      onClick={() => toggleServico(servico)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Botão Salvar (Fixo em baixo mobile, normal desktop) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a1a]/95 backdrop-blur border-t border-white/10 md:relative md:bg-transparent md:border-0 md:p-0">
          <button
            onClick={() => navigate(-1)}
            className="w-full max-w-2xl mx-auto py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black rounded-2xl shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-5 h-5" />
            Concluir Edição
          </button>
        </div>
      </div>
    </div>
  );
}