import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function OnboardingVertical() {
  const navigate = useNavigate();
  const [selectedVertical, setSelectedVertical] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkVertical = async () => {
      try {
        const user = await base44.auth.me();
        if (isMounted && user?.vertical) {
          navigate(createPageUrl("OnboardingTipoConta"));
        }
      } catch (error) {
        console.warn("Erro ao verificar vertical:", error?.message || error);
      }
    };
    checkVertical();

    return () => { isMounted = false; };
  }, []);

  const handleSelectVertical = async (vertical) => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ vertical });
      toast.success(`Área selecionada: ${vertical === "ODONTOLOGIA" ? "Odontologia 🦷" : "Medicina 🩺"}`);
      navigate(createPageUrl("OnboardingTipoConta"));
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden flex items-center justify-center p-6">
      {/* Elementos Decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[100px] opacity-20"></div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20"
          >
            <span className="text-4xl">🏥</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            Bem-vindo ao Doutorizze!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400"
          >
            Primeiro, qual é a sua área de atuação?
          </motion.p>
        </div>

        {/* Cards de Seleção */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Odontologia */}
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleSelectVertical("ODONTOLOGIA")}
            disabled={loading}
            className="group bg-[#13132B] rounded-3xl p-8 shadow-xl border border-white/10 hover:border-brand-primary/50 transition-all duration-300 disabled:opacity-50 text-center hover:bg-[#1A1A35]"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <span className="text-6xl">🦷</span>
            </div>

            <h2 className="text-3xl font-black text-white mb-3">
              Odontologia
            </h2>

            <p className="text-gray-400 mb-6">
              Dentistas, clínicas odontológicas e fornecedores da área
            </p>

            <div className="py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-2xl group-hover:shadow-lg hover:shadow-yellow-500/20 transition-all">
              Sou da Odontologia →
            </div>
          </motion.button>

          {/* Medicina */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => handleSelectVertical("MEDICINA")}
            disabled={loading}
            className="group bg-[#13132B] rounded-3xl p-8 shadow-xl border border-white/10 hover:border-brand-secondary/50 transition-all duration-300 disabled:opacity-50 text-center hover:bg-[#1A1A35]"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <span className="text-6xl">🩺</span>
            </div>

            <h2 className="text-3xl font-black text-white mb-3">
              Medicina
            </h2>

            <p className="text-gray-400 mb-6">
              Médicos, hospitais, clínicas médicas e fornecedores da área
            </p>

            <div className="py-4 px-6 bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold rounded-2xl group-hover:shadow-lg hover:shadow-pink-500/20 transition-all">
              Sou da Medicina →
            </div>
          </motion.button>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-full text-sm font-semibold backdrop-blur-sm">
            <span>ℹ️</span>
            <span>Esta escolha define que tipo de conteúdo você verá na plataforma</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}