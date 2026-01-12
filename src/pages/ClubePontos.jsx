"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Star,
  Trophy,
  Users,
  CheckCircle,
  Award,
  Crown,
  Shield,
  Zap,
  Clock,
  MessageSquare,
  ShoppingBag,
  Briefcase,
  Target,
  Medal,
  Gem,
} from "lucide-react"

const NIVEIS = [
  {
    nome: "Bronze",
    icon: Medal,
    cor: "#CD7F32",
    bg: "rgba(205, 127, 50, 0.15)",
    requisitos: "Cadastro completo",
    beneficios: ["5 anuncios/dia", "Chat basico", "Acesso ao Feed"],
    minPontos: 0,
  },
  {
    nome: "Prata",
    icon: Award,
    cor: "#C0C0C0",
    bg: "rgba(192, 192, 192, 0.15)",
    requisitos: "10 negociacoes + 30 dias ativo",
    beneficios: ["7 anuncios/dia", "Badge no perfil", "Prioridade no Feed"],
    minPontos: 500,
  },
  {
    nome: "Ouro",
    icon: Trophy,
    cor: "#FFD700",
    bg: "rgba(255, 215, 0, 0.15)",
    requisitos: "50 negociacoes + 4.5 estrelas",
    beneficios: ["10 anuncios/dia", "Destaque no Radar", "Selo dourado"],
    minPontos: 2000,
  },
  {
    nome: "Diamante",
    icon: Gem,
    cor: "#00CED1",
    bg: "rgba(0, 206, 209, 0.15)",
    requisitos: "100 negociacoes + 4.8 estrelas + 6 meses",
    beneficios: ["15 anuncios/dia", "Perfil verificado premium", "Suporte prioritario", "Acesso beta"],
    minPontos: 5000,
  },
]

const SELOS = [
  {
    id: "verificado",
    nome: "Identidade Verificada",
    icon: Shield,
    cor: "#4ADE80",
    descricao: "Enviou documentos e selfie",
    como: "Completar verificacao de identidade",
  },
  {
    id: "respondedor",
    nome: "Responde Rapido",
    icon: Zap,
    cor: "#FBBF24",
    descricao: "Responde em menos de 1 hora",
    como: "Manter tempo medio de resposta < 1h",
  },
  {
    id: "confiavel",
    nome: "100% Confiavel",
    icon: CheckCircle,
    cor: "#60A5FA",
    descricao: "Nunca cancelou uma negociacao",
    como: "0 cancelamentos em 50+ transacoes",
  },
  {
    id: "veterano",
    nome: "Veterano",
    icon: Clock,
    cor: "#A78BFA",
    descricao: "Mais de 1 ano na plataforma",
    como: "Completar 12 meses de uso ativo",
  },
  {
    id: "avaliado",
    nome: "Super Avaliado",
    icon: Star,
    cor: "#F472B6",
    descricao: "Media acima de 4.8 estrelas",
    como: "Manter media >= 4.8 com 20+ avaliacoes",
  },
  {
    id: "indicador",
    nome: "Embaixador",
    icon: Users,
    cor: "#34D399",
    descricao: "Indicou 10+ amigos",
    como: "Ter 10 indicacoes que se cadastraram",
  },
  {
    id: "top_vendedor",
    nome: "Top Vendedor",
    icon: ShoppingBag,
    cor: "#FB923C",
    descricao: "100+ vendas no Marketplace",
    como: "Completar 100 vendas com sucesso",
  },
  {
    id: "especialista",
    nome: "Especialista",
    icon: Briefcase,
    cor: "#EC4899",
    descricao: "50+ substituicoes realizadas",
    como: "Completar 50 plantoes/substituicoes",
  },
]

const RANKING = [
  { pos: 1, nome: "Dra. Ana Silva", nivel: "Diamante", selos: 6, avaliacoes: 4.9 },
  { pos: 2, nome: "Dr. Carlos Lima", nivel: "Diamante", selos: 5, avaliacoes: 4.8 },
  { pos: 3, nome: "Dra. Marina Costa", nivel: "Ouro", selos: 5, avaliacoes: 4.9 },
  { pos: 4, nome: "Dr. Pedro Santos", nivel: "Ouro", selos: 4, avaliacoes: 4.7 },
  { pos: 5, nome: "Dra. Julia Ferreira", nivel: "Ouro", selos: 4, avaliacoes: 4.8 },
]

const COMO_SUBIR = [
  { acao: "Completar uma venda/compra", pontos: "+50 rep", icon: ShoppingBag },
  { acao: "Receber avaliacao 5 estrelas", pontos: "+30 rep", icon: Star },
  { acao: "Completar substituicao", pontos: "+40 rep", icon: Briefcase },
  { acao: "Indicar amigo que se cadastrou", pontos: "+100 rep", icon: Users },
  { acao: "Responder mensagem em < 1h", pontos: "+10 rep", icon: MessageSquare },
  { acao: "Manter perfil 100% completo", pontos: "+20 rep/semana", icon: Target },
]

export default function ClubePontos() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("niveis")

  // Mock do usuario atual
  const usuarioAtual = {
    nivel: "Prata",
    pontos: 850,
    proximoNivel: 2000,
    selos: ["verificado", "respondedor"],
  }

  const progresso = ((usuarioAtual.pontos - 500) / (usuarioAtual.proximoNivel - 500)) * 100

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Niveis e Selos</h1>
            <p className="text-xs text-white/50">Sua reputacao na plataforma</p>
          </div>
        </div>
      </header>

      {/* Seu Status Atual */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass p-6 border border-[#C0C0C0]/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(192, 192, 192, 0.15)" }}
                >
                  <Award className="w-8 h-8" style={{ color: "#C0C0C0" }} />
                </div>
                <div>
                  <p className="text-white/50 text-sm">Seu nivel atual</p>
                  <h2 className="text-2xl font-bold text-white">{usuarioAtual.nivel}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-sm">Reputacao</p>
                <p className="text-2xl font-bold text-[#FBBF24]">{usuarioAtual.pontos}</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Prata</span>
                <span>Ouro ({usuarioAtual.proximoNivel} rep)</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progresso}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#C0C0C0] to-[#FFD700] rounded-full"
                />
              </div>
              <p className="text-xs text-white/50 mt-1 text-center">
                Faltam {usuarioAtual.proximoNivel - usuarioAtual.pontos} pontos para o proximo nivel
              </p>
            </div>

            {/* Selos conquistados */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-white/50 mb-2">Seus selos ({usuarioAtual.selos.length})</p>
              <div className="flex gap-2">
                {SELOS.filter((s) => usuarioAtual.selos.includes(s.id)).map((selo) => (
                  <div
                    key={selo.id}
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${selo.cor}20` }}
                    title={selo.nome}
                  >
                    <selo.icon className="w-5 h-5" style={{ color: selo.cor }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "niveis", label: "Niveis" },
              { id: "selos", label: "Selos" },
              { id: "como", label: "Como Subir" },
              { id: "ranking", label: "Top 5" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-[80px] py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  tab === t.id
                    ? "bg-gradient-to-r from-[#F97316] to-[#FBBF24] text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Conteudo das tabs */}
          {tab === "niveis" && (
            <div className="space-y-4">
              {NIVEIS.map((nivel, i) => (
                <motion.div
                  key={nivel.nome}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card-glass p-5 ${usuarioAtual.nivel === nivel.nome ? "border border-white/30" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: nivel.bg }}
                    >
                      <nivel.icon className="w-7 h-7" style={{ color: nivel.cor }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{nivel.nome}</h3>
                        {usuarioAtual.nivel === nivel.nome && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#4ADE80]">
                            Seu nivel
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/50 mb-3">{nivel.requisitos}</p>
                      <div className="flex flex-wrap gap-2">
                        {nivel.beneficios.map((b, j) => (
                          <span key={j} className="text-xs px-2 py-1 rounded-lg bg-white/5 text-white/70">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "selos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SELOS.map((selo, i) => {
                const conquistado = usuarioAtual.selos.includes(selo.id)
                return (
                  <motion.div
                    key={selo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`card-glass p-4 ${conquistado ? "border border-white/20" : "opacity-60"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${selo.cor}20` }}
                      >
                        <selo.icon className="w-6 h-6" style={{ color: selo.cor }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{selo.nome}</h3>
                          {conquistado && <CheckCircle className="w-4 h-4 text-[#4ADE80]" />}
                        </div>
                        <p className="text-xs text-white/50 mb-2">{selo.descricao}</p>
                        <p className="text-xs text-white/30">
                          <span className="text-white/50">Como obter:</span> {selo.como}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {tab === "como" && (
            <div className="space-y-3">
              <p className="text-center text-white/50 text-sm mb-4">Ganhe reputacao por suas acoes na plataforma</p>
              {COMO_SUBIR.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-glass p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <span className="text-white">{item.acao}</span>
                  </div>
                  <span className="font-bold text-[#4ADE80]">{item.pontos}</span>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "ranking" && (
            <div className="space-y-3">
              <p className="text-center text-white/50 text-sm mb-4">Profissionais com maior reputacao este mes</p>
              {RANKING.map((user, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card-glass p-4 flex items-center justify-between ${
                    user.pos === 1 ? "border border-[#FBBF24]/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        user.pos === 1
                          ? "bg-[#FBBF24] text-black"
                          : user.pos === 2
                            ? "bg-gray-300 text-black"
                            : user.pos === 3
                              ? "bg-[#CD7F32] text-white"
                              : "bg-white/10 text-white"
                      }`}
                    >
                      {user.pos}
                    </div>
                    <div>
                      <span className="text-white font-medium">{user.nome}</span>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>{user.nivel}</span>
                        <span>·</span>
                        <span>{user.selos} selos</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-[#FBBF24]" />
                          {user.avaliacoes}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user.pos === 1 && <Crown className="w-5 h-5 text-[#FBBF24]" />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass p-4 border border-[#4ADE80]/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#4ADE80] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Sistema de merito</p>
                <p className="text-xs text-white/50 mt-1">
                  Niveis e selos sao conquistados por suas acoes reais na plataforma. Nao ha como comprar reputacao -
                  ela e construida com o tempo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
