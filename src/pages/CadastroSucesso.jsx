import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CadastroSucesso() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Parar confetes depois de 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Gerar confetes com posições e delays aleatórios
  const confettiColors = ["bg-brand-coral", "bg-brand-orange", "bg-pink-500", "bg-purple-500", "bg-yellow-400", "bg-green-400"];
  const confettiCount = 30;

  const confettiElements = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    size: Math.random() > 0.5 ? "w-3 h-3" : "w-2 h-2",
    shape: Math.random() > 0.5 ? "rounded-full" : "rounded-sm"
  }));

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a1a] overflow-hidden px-4">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Confetes Animados */}
      {showConfetti && confettiElements.map((confetti) => (
        <motion.div
          key={confetti.id}
          className={`absolute ${confetti.size} ${confetti.shape} ${confetti.color}`}
          style={{ left: confetti.left, top: "-50px" }}
          initial={{ y: -100, opacity: 0, rotate: 0 }}
          animate={{
            y: [0, 100, 200, 300, window.innerHeight + 100],
            opacity: [0, 1, 1, 0.5, 0],
            rotate: [0, 180, 360, 540, 720],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 50 - 25]
          }}
          transition={{
            duration: confetti.duration,
            delay: confetti.delay,
            ease: "easeOut",
            repeat: 2
          }}
        />
      ))}

      {/* Estrelas nos Cantos */}
      <motion.div
        className="absolute top-10 left-10 text-4xl opacity-50"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ⭐
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 text-3xl opacity-50"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -15, 15, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        ✨
      </motion.div>

      {/* Sparkles Flutuantes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-6 h-6 text-brand-orange" />
        </motion.div>
      ))}

      {/* Card Central */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-md w-full text-center relative z-10"
      >
        {/* Ícone de Sucesso Animado */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/20"
        >
          <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
        </motion.div>

        {/* Título com Animação */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl md:text-4xl font-black text-white mb-4"
        >
          🎉 Parabéns! 🎉
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-6"
        >
          Cadastro Realizado com Sucesso!
        </motion.h2>

        {/* Mensagem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 leading-relaxed mb-8 space-y-3"
        >
          <p className="text-base">
            Seu cadastro foi enviado e está em <strong className="text-white">análise</strong>.
          </p>
          <div className="p-4 bg-brand-coral/10 rounded-xl border border-brand-coral/20">
            <p className="text-sm text-brand-coral font-semibold">
              ⏱️ Seu perfil estará ativo em alguns minutos!
            </p>
          </div>
          <p className="text-sm">
            Em breve você receberá uma confirmação por e-mail.
          </p>
        </motion.div>

        {/* Decoração - Linha */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-1 w-8 bg-gradient-to-r from-brand-coral to-brand-orange rounded-full"></div>
          <div className="h-1 w-8 bg-gradient-to-r from-brand-orange to-pink-500 rounded-full"></div>
          <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Botão */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => navigate(createPageUrl("HomePage"))}
            className="w-full py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Ir para o Início
          </button>
        </motion.div>

        {/* Estrelas de Avaliação */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex justify-center gap-2"
        >
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{
                delay: 1 + i * 0.1,
                type: "spring",
                stiffness: 200
              }}
              className="text-2xl"
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        {/* Mensagem Final */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 text-sm text-gray-500 italic"
        >
          Estamos felizes em ter você conosco! 💚
        </motion.p>
      </motion.div>
    </div>
  );
}