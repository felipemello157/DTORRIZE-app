"use client"

/**
 * PÁGINA: IAs DISPONÍVEIS NO DOUTORIZZE
 * Mostra todas as inteligências artificiais disponíveis no app
 */

import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Brain,
  Radio,
  DollarSign,
  Bell,
  Users,
  Search,
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  Clock,
  CheckCircle,
} from "lucide-react"

const IAS = [
  {
    id: "radar",
    name: "IA Radar",
    icon: Radio,
    color: "#FB923C",
    description: "Busca automaticamente produtos e oportunidades que você configurou",
    features: [
      "Monitora marketplace 24/7",
      "Alerta quando encontra o que você procura",
      "Filtra por preço, região e categoria",
      "Aprende suas preferências",
    ],
    stats: { matches: "850+/dia", precisao: "94%" },
  },
  {
    id: "precos",
    name: "IA de Preços",
    icon: DollarSign,
    color: "#4ADE80",
    description: "Sugere preços de mercado para vendedores e alerta compradores sobre boas ofertas",
    features: [
      "Analisa preços dos últimos 30 dias",
      "Sugere preço ideal para venda",
      "Alerta menor preço histórico",
      "Compara com concorrentes",
    ],
    stats: { economia: "32%", analises: "12k/mês" },
  },
  {
    id: "notificacoes",
    name: "IA de Notificações",
    icon: Bell,
    color: "#22D3EE",
    description: "Aprende os melhores horários para te notificar sem incomodar",
    features: [
      "Aprende sua rotina",
      "Agrupa notificações similares",
      "Prioriza urgências",
      "Modo silencioso inteligente",
    ],
    stats: { abertura: "78%", satisfacao: "4.8" },
  },
  {
    id: "matching",
    name: "IA de Matching",
    icon: Users,
    color: "#A855F7",
    description: "Conecta profissionais com clínicas baseado em compatibilidade",
    features: [
      "Analisa perfil e experiência",
      "Considera localização",
      "Verifica disponibilidade",
      "Ranqueia por compatibilidade",
    ],
    stats: { matches: "340/dia", sucesso: "89%" },
  },
  {
    id: "feed",
    name: "IA do Feed",
    icon: Sparkles,
    color: "#E94560",
    description: "Filtra e prioriza conteúdo relevante para sua especialidade",
    features: [
      "Filtra por área (odonto/medicina)",
      "Prioriza ofertas da região",
      "Destaca oportunidades urgentes",
      "Remove conteúdo irrelevante",
    ],
    stats: { relevancia: "98%", economia: "2h/dia" },
  },
  {
    id: "busca",
    name: "IA de Busca",
    icon: Search,
    color: "#FBBF24",
    description: "Entende o que você quer mesmo quando não sabe o nome exato",
    features: ["Busca semântica", "Sugestões inteligentes", "Correção de erros", "Histórico personalizado"],
    stats: { assertividade: "96%", velocidade: "<1s" },
  },
]

export default function IAsDisponiveis() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
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
            <h1 className="text-lg font-bold text-white">IAs Doutorizze</h1>
            <p className="text-xs text-white/50">Assistentes inteligentes 24/7</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#A855F7]/20 flex items-center justify-center mx-auto mb-6"
          >
            <Brain className="w-10 h-10 text-[#6366F1]" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">6 Inteligências Artificiais trabalhando para você</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Nossas IAs trabalham 24 horas por dia para encontrar oportunidades, filtrar conteúdo e conectar você com as
            melhores ofertas.
          </p>
        </div>
      </section>

      {/* Stats geral */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {[
            { label: "Matches/dia", value: "2.500+", icon: Target },
            { label: "Precisão média", value: "94%", icon: TrendingUp },
            { label: "Tempo economizado", value: "2h/dia", icon: Clock },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glass p-4 text-center"
            >
              <stat.icon className="w-5 h-5 text-[#E94560] mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lista de IAs */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {IAS.map((ia, i) => (
            <motion.div
              key={ia.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glass p-6"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${ia.color}20` }}
                >
                  <ia.icon className="w-7 h-7" style={{ color: ia.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{ia.name}</h3>
                  <p className="text-sm text-white/60 mb-4">{ia.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {ia.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" style={{ color: ia.color }} />
                        <span className="text-xs text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    {Object.entries(ia.stats).map(([key, value], j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-white/40" />
                        <span className="text-xs text-white/50">{key}:</span>
                        <span className="text-xs font-bold" style={{ color: ia.color }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/60 mb-6">Todas as IAs são ativadas automaticamente quando você se cadastra.</p>
          <button onClick={() => navigate("/cadastro-profissional")} className="btn-primary">
            Criar Conta e Ativar IAs
          </button>
        </div>
      </section>
    </div>
  )
}
