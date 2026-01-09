import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  UserCircle,
  Building2,
  ArrowRight,
  Briefcase,
  Stethoscope,
  Zap
} from "lucide-react";

export default function EscolherTipoCriador() {
  const navigate = useNavigate();
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const continuar = () => {
    if (!tipoSelecionado) return;
    navigate(createPageUrl("CriarSubstituicao"), {
      state: { criado_por_tipo: tipoSelecionado }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-brand-primary via-purple-600 to-brand-secondary rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Decoração */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl mb-4 border border-white/20">
              🔄
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              SUBSTITUIÇÃO URGENTE
            </h1>
            <p className="text-white/90 text-lg">
              Vamos começar! Quem está criando a vaga?
            </p>
          </div>
        </motion.div>

        {/* Pergunta Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-black text-white mb-2">
            Quem vai criar a vaga?
          </h2>
          <p className="text-gray-400 text-lg">
            Selecione uma opção para continuar
          </p>
        </motion.div>

        {/* Cards de Seleção */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Card Profissional */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setTipoSelecionado("PROFISSIONAL")}
            className={`group relative bg-[#13132B] rounded-3xl p-8 border hover:scale-105 transition-all duration-300 text-left ${tipoSelecionado === "PROFISSIONAL"
                ? "border-brand-primary shadow-2xl shadow-brand-primary/20 bg-brand-primary/5"
                : "border-white/10 hover:border-brand-primary/50"
              }`}
          >

            {tipoSelecionado === "PROFISSIONAL" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg"
              >
                ✓
              </motion.div>
            )}


            {/* Ícone */}
            <div className={`w-20 h-20 rounded-2xl mb-4 flex items-center justify-center transition-all ${tipoSelecionado === "PROFISSIONAL"
                ? "bg-brand-primary text-white"
                : "bg-white/5 text-gray-400 group-hover:bg-brand-primary/20 group-hover:text-brand-primary"
              }`}>
              <UserCircle className="w-10 h-10" />
            </div>

            {/* Título */}
            <h3 className="text-2xl font-black text-white mb-2">
              👨‍⚕️ EU (Profissional)
            </h3>

            {/* Descrição */}
            <p className="text-gray-400 text-base mb-4">
              Preciso de alguém para me substituir na clínica onde trabalho
            </p>

            {/* Exemplos */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-300 font-semibold mb-2">Exemplos:</p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>• Vou viajar e preciso de substituto</li>
                <li>• Tenho um compromisso importante</li>
                <li>• Férias programadas</li>
              </ul>
            </div>

            {/* Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-full border border-brand-primary/20">
              <Briefcase className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-bold text-brand-primary">Você escolhe o substituto</span>
            </div>
          </motion.button>

          {/* Card Clínica */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setTipoSelecionado("CLINICA")}
            className={`group relative bg-[#13132B] rounded-3xl p-8 border hover:scale-105 transition-all duration-300 text-left ${tipoSelecionado === "CLINICA"
                ? "border-brand-secondary shadow-2xl shadow-brand-secondary/20 bg-brand-secondary/5"
                : "border-white/10 hover:border-brand-secondary/50"
              }`}
          >
            {tipoSelecionado === "CLINICA" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg"
              >
                ✓
              </motion.div>
            )}

            {/* Ícone */}
            <div className={`w-20 h-20 rounded-2xl mb-4 flex items-center justify-center transition-all ${tipoSelecionado === "CLINICA"
                ? "bg-brand-secondary text-white"
                : "bg-white/5 text-gray-400 group-hover:bg-brand-secondary/20 group-hover:text-brand-secondary"
              }`}>
              <Building2 className="w-10 h-10" />
            </div>

            {/* Título */}
            <h3 className="text-2xl font-black text-white mb-2">
              🏥 CLÍNICA
            </h3>

            {/* Descrição */}
            <p className="text-gray-400 text-base mb-4">
              A clínica precisa de um profissional para substituição
            </p>

            {/* Exemplos */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-300 font-semibold mb-2">Exemplos:</p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>• Profissional saiu da clínica</li>
                <li>• Cobertura temporária urgente</li>
                <li>• Reforço em dias específicos</li>
              </ul>
            </div>

            {/* Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary/10 rounded-full border border-brand-secondary/20">
              <Stethoscope className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm font-bold text-brand-secondary">Clínica escolhe o candidato</span>
            </div>
          </motion.button>
        </div>

        {/* Informação Importante */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Como funciona?</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs flex items-center justify-center flex-shrink-0 font-bold">1</span>
                  <span>Você cria a vaga com todos os detalhes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs flex items-center justify-center flex-shrink-0 font-bold">2</span>
                  <span>Profissionais se candidatam</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs flex items-center justify-center flex-shrink-0 font-bold">3</span>
                  <span>Você escolhe o melhor candidato</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs flex items-center justify-center flex-shrink-0 font-bold">4</span>
                  <span>Confirmação via WhatsApp com a clínica</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs flex items-center justify-center flex-shrink-0 font-bold">5</span>
                  <span>Substituição realizada! ✅</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Botão Continuar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={continuar}
            disabled={!tipoSelecionado}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${tipoSelecionado
                ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-xl hover:shadow-brand-primary/20 hover:scale-[1.02]"
                : "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
              }`}
          >
            {tipoSelecionado ? "CONTINUAR" : "SELECIONE UMA OPÇÃO"}
            {tipoSelecionado && <ArrowRight className="w-6 h-6" />}
          </button>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mt-8"
        >
          <div className="bg-[#13132B] border border-white/10 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-black bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">250+</div>
            <div className="text-xs text-gray-400 font-semibold mt-1">Substituições realizadas</div>
          </div>
          <div className="bg-[#13132B] border border-white/10 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-black bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">98%</div>
            <div className="text-xs text-gray-400 font-semibold mt-1">Taxa de sucesso</div>
          </div>
          <div className="bg-[#13132B] border border-white/10 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-black bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">4.9⭐</div>
            <div className="text-xs text-gray-400 font-semibold mt-1">Avaliação média</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}