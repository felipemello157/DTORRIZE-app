import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Star,
  CheckCircle2,
  Building2,
  Award,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";

export default function AvaliarClinica() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [avaliado, setAvaliado] = useState(false);
  const [erro, setErro] = useState(null);
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);

  // Dados do contrato
  const [contract, setContract] = useState(null);
  const [unit, setUnit] = useState(null);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);

        // Buscar contrato pelo token
        const contracts = await base44.entities.JobContract.filter({
          token_dentista: token
        });

        if (contracts.length === 0) {
          setErro("Token inválido ou expirado");
          return;
        }

        const contrato = contracts[0];
        setContract(contrato);

        // Verificar se já avaliou
        if (contrato.avaliacao_dentista_feita) {
          setAvaliado(true);
          setLoading(false);
          return;
        }

        // Buscar dados da clínica
        const units = await base44.entities.CompanyUnit.filter({
          id: contrato.unit_id
        });
        if (units.length > 0) setUnit(units[0]);

        // Buscar dados do profissional
        const profs = await base44.entities.Professional.filter({
          id: contrato.professional_id
        });
        if (profs.length > 0) setProfessional(profs[0]);

        setLoading(false);
      } catch (error) {
        setErro("Erro ao carregar informações do contrato");
        setLoading(false);
      }
    };

    if (token) {
      carregarDados();
    } else {
      setErro("Token não fornecido");
      setLoading(false);
    }
  }, [token]);

  const handleEnviarAvaliacao = async () => {
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5 estrelas");
      return;
    }

    try {
      setEnviando(true);

      // 1. Criar registro de avaliação
      await base44.entities.Rating.create({
        contract_id: contract.id,
        token_validacao: token,
        avaliador_tipo: "DENTISTA",
        avaliador_id: professional.id,
        avaliado_tipo: "CLINICA",
        avaliado_id: unit.id,
        nota: nota
      });

      // 2. Atualizar contrato
      await base44.entities.JobContract.update(contract.id, {
        avaliacao_dentista_feita: true
      });

      // 3. Buscar todas as avaliações da clínica e recalcular média
      const avaliacoes = await base44.entities.Rating.filter({
        avaliado_id: unit.id,
        avaliado_tipo: "CLINICA"
      });

      const totalAvaliacoes = avaliacoes.length;
      const somaNotas = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
      const novaMedia = totalAvaliacoes > 0 ? somaNotas / totalAvaliacoes : 0;

      // 4. Atualizar CompanyUnit
      await base44.entities.CompanyUnit.update(unit.id, {
        media_avaliacoes: novaMedia,
        total_avaliacoes: totalAvaliacoes
      });

      // 5. Atualizar Professional - disponível novamente
      await base44.entities.Professional.update(professional.id, {
        status_disponibilidade: "DISPONIVEL"
      });

      // Confete!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      setAvaliado(true);
      toast.success("✅ Avaliação enviada com sucesso!");
    } catch (error) {
      toast.error("❌ Erro ao enviar avaliação: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (erro) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Erro</h2>
          <p className="text-gray-400 mb-6">{erro}</p>
          <button
            onClick={() => navigate(createPageUrl("DashboardProfissional"))}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/80 transition-all w-full"
          >
            Voltar ao Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Tela de Sucesso
  if (avaliado) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 overflow-hidden relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] opacity-30"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-8 max-w-md w-full text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Obrigado pela avaliação!</h2>
          <p className="text-gray-400 mb-2">Sua opinião é muito importante para nós</p>

          {contract && !contract.avaliacao_clinica_feita && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-sm text-yellow-500 font-medium">
                💡 A clínica também receberá um link para avaliar você
              </p>
            </div>
          )}

          <button
            onClick={() => navigate(createPageUrl("DashboardProfissional"))}
            className="mt-8 w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
          >
            Voltar ao Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Formulário de Avaliação
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 py-8 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-8 max-w-md w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-primary/20">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Avaliar Clínica</h1>
          <p className="text-gray-400">Como foi sua experiência?</p>
        </div>

        {/* Info da Clínica */}
        {unit && (
          <div className="bg-[#0a0a1a] rounded-2xl p-4 mb-8 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 border border-white/10">
              {unit.nome_fantasia?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{unit.nome_fantasia}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {unit.cidade} - {unit.uf}
              </p>
            </div>
          </div>
        )}

        {/* Estrelas */}
        <div className="mb-8 p-6 bg-[#0a0a1a] rounded-2xl border border-white/5">
          <p className="text-center font-bold text-white mb-6 uppercase tracking-wider text-sm">Toque para avaliar</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((estrela) => (
              <motion.button
                key={estrela}
                onClick={() => setNota(estrela)}
                onMouseEnter={() => setHoverNota(estrela)}
                onMouseLeave={() => setHoverNota(0)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="focus:outline-none transition-transform"
              >
                <Star
                  className={`w-10 h-10 transition-colors duration-200 ${estrela <= (hoverNota || nota)
                      ? "fill-brand-orange text-brand-orange drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                      : "text-gray-700 hover:text-gray-500"
                    }`}
                />
              </motion.button>
            ))}
          </div>
          {nota > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              key={nota}
              className="text-center text-brand-primary font-bold text-lg"
            >
              {nota === 1 && "😞 Muito ruim"}
              {nota === 2 && "😕 Ruim"}
              {nota === 3 && "😐 Regular"}
              {nota === 4 && "😊 Bom"}
              {nota === 5 && "🤩 Excelente"}
            </motion.p>
          )}
        </div>

        {/* Botão Enviar */}
        <button
          onClick={handleEnviarAvaliacao}
          disabled={enviando || nota === 0}
          className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] hover:shadow-brand-primary/40 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {enviando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Enviar Avaliação
            </>
          )}
        </button>

        {/* Informação */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Sua avaliação é anônima e ajuda outros profissionais
        </p>
      </motion.div>
    </div>
  );
}