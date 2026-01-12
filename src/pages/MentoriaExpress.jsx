"use client"

/**
 * MENTORIA EXPRESS - Doutorizze
 * DESATIVADO - Funcionalidade em desenvolvimento
 */

import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, Rocket } from "lucide-react"

export default function MentoriaExpress() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Mentoria Express</h1>
              <p className="text-sm text-white/60">Em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteudo Em Breve */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#A855F7]/20 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-12 h-12 text-[#A855F7]" />
          </div>

          <h2 className="text-3xl font-black text-white mb-4">Em Breve!</h2>

          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
            Estamos preparando uma experiência incrível de mentoria entre profissionais. Aguarde novidades!
          </p>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm mx-auto mb-8">
            <div className="flex items-center gap-3 text-white/70">
              <Clock className="w-5 h-5 text-[#FBBF24]" />
              <span className="text-sm">Previsão de lançamento: Em breve</span>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white font-bold rounded-xl hover:shadow-xl transition-all"
          >
            Voltar
          </button>
        </motion.div>
      </div>
    </div>
  )
}
