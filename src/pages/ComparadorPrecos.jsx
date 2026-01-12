"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Package,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from "lucide-react"

const PRODUTOS_MOCK = [
  {
    id: 1,
    nome: "Resina Composit Z350",
    categoria: "Material Dentario",
    imagem: "/placeholder.svg?height=80&width=80",
    fornecedores: [
      {
        id: 1,
        nome: "Dental Supply",
        preco: 189.9,
        precoAntigo: 220.0,
        avaliacao: 4.8,
        entregas: 342,
        cidade: "Sao Paulo",
        tempoEntrega: "2-3 dias",
        verificado: true,
      },
      {
        id: 2,
        nome: "OdontoMais",
        preco: 195.0,
        precoAntigo: 210.0,
        avaliacao: 4.6,
        entregas: 156,
        cidade: "Rio de Janeiro",
        tempoEntrega: "3-5 dias",
        verificado: true,
      },
      {
        id: 3,
        nome: "ProDental",
        preco: 199.9,
        precoAntigo: 199.9,
        avaliacao: 4.2,
        entregas: 89,
        cidade: "Curitiba",
        tempoEntrega: "4-6 dias",
        verificado: false,
      },
    ],
    menorPreco30dias: 185.0,
    maiorPreco30dias: 230.0,
  },
  {
    id: 2,
    nome: "Luvas Nitrilo Caixa 100un",
    categoria: "Descartaveis",
    imagem: "/placeholder.svg?height=80&width=80",
    fornecedores: [
      {
        id: 4,
        nome: "MedSupply",
        preco: 45.9,
        precoAntigo: 52.0,
        avaliacao: 4.9,
        entregas: 1203,
        cidade: "Sao Paulo",
        tempoEntrega: "1-2 dias",
        verificado: true,
      },
      {
        id: 5,
        nome: "Dental Supply",
        preco: 48.0,
        precoAntigo: 55.0,
        avaliacao: 4.8,
        entregas: 342,
        cidade: "Sao Paulo",
        tempoEntrega: "2-3 dias",
        verificado: true,
      },
      {
        id: 6,
        nome: "SafeHands",
        preco: 52.9,
        precoAntigo: 52.9,
        avaliacao: 4.4,
        entregas: 67,
        cidade: "Belo Horizonte",
        tempoEntrega: "5-7 dias",
        verificado: false,
      },
    ],
    menorPreco30dias: 42.0,
    maiorPreco30dias: 58.0,
  },
  {
    id: 3,
    nome: "Anestesico Lidocaina 2%",
    categoria: "Anestesicos",
    imagem: "/placeholder.svg?height=80&width=80",
    fornecedores: [
      {
        id: 7,
        nome: "PharmaOdonto",
        preco: 78.0,
        precoAntigo: 85.0,
        avaliacao: 4.7,
        entregas: 892,
        cidade: "Campinas",
        tempoEntrega: "2-3 dias",
        verificado: true,
      },
      {
        id: 8,
        nome: "Dental Supply",
        preco: 82.0,
        precoAntigo: 90.0,
        avaliacao: 4.8,
        entregas: 342,
        cidade: "Sao Paulo",
        tempoEntrega: "2-3 dias",
        verificado: true,
      },
    ],
    menorPreco30dias: 75.0,
    maiorPreco30dias: 95.0,
  },
]

export default function ComparadorPrecos() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState("")
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [ordenacao, setOrdenacao] = useState("preco") // preco, avaliacao, entrega

  const produtosFiltrados = PRODUTOS_MOCK.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))

  const ordenarFornecedores = (fornecedores) => {
    return [...fornecedores].sort((a, b) => {
      if (ordenacao === "preco") return a.preco - b.preco
      if (ordenacao === "avaliacao") return b.avaliacao - a.avaliacao
      if (ordenacao === "entrega") return Number.parseInt(a.tempoEntrega) - Number.parseInt(b.tempoEntrega)
      return 0
    })
  }

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
            <h1 className="text-lg font-bold text-white">Comparador de Precos</h1>
            <p className="text-xs text-white/50">IA analisa os melhores precos</p>
          </div>
          <Sparkles className="w-5 h-5 text-[#E94560] ml-auto" />
        </div>
      </header>

      {/* Busca */}
      <section className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar produto para comparar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E94560]/50"
            />
          </div>
        </div>
      </section>

      {!produtoSelecionado ? (
        // Lista de produtos
        <section className="px-4 pb-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-sm font-medium text-white/60">Produtos disponiveis para comparacao</h2>
            {produtosFiltrados.map((produto) => (
              <motion.button
                key={produto.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setProdutoSelecionado(produto)}
                className="w-full card-glass p-4 flex items-center gap-4 text-left hover:border-[#E94560]/30 transition-colors"
              >
                <img
                  src={produto.imagem || "/placeholder.svg"}
                  alt={produto.nome}
                  className="w-16 h-16 rounded-lg object-cover bg-white/5"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{produto.nome}</h3>
                  <p className="text-xs text-white/50">{produto.categoria}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[#4ADE80]">{produto.fornecedores.length} fornecedores</span>
                    <span className="text-xs text-white/30">|</span>
                    <span className="text-xs text-white/50">
                      A partir de R$ {Math.min(...produto.fornecedores.map((f) => f.preco)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </motion.button>
            ))}
          </div>
        </section>
      ) : (
        // Comparacao detalhada
        <section className="px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Produto selecionado */}
            <div className="card-glass p-4 mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={produtoSelecionado.imagem || "/placeholder.svg"}
                  alt={produtoSelecionado.nome}
                  className="w-20 h-20 rounded-lg object-cover bg-white/5"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{produtoSelecionado.nome}</h3>
                  <p className="text-sm text-white/50">{produtoSelecionado.categoria}</p>

                  {/* Historico de precos */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-[#4ADE80]" />
                      <span className="text-xs text-white/60">Min 30d:</span>
                      <span className="text-xs font-bold text-[#4ADE80]">
                        R$ {produtoSelecionado.menorPreco30dias.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-[#EF4444]" />
                      <span className="text-xs text-white/60">Max 30d:</span>
                      <span className="text-xs font-bold text-[#EF4444]">
                        R$ {produtoSelecionado.maiorPreco30dias.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setProdutoSelecionado(null)} className="text-xs text-[#E94560]">
                  Trocar
                </button>
              </div>
            </div>

            {/* Filtros de ordenacao */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <SlidersHorizontal className="w-4 h-4 text-white/40 shrink-0" />
              {[
                { id: "preco", label: "Menor Preco" },
                { id: "avaliacao", label: "Melhor Avaliacao" },
                { id: "entrega", label: "Entrega Rapida" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOrdenacao(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    ordenacao === opt.id ? "bg-[#E94560] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Lista de fornecedores */}
            <div className="space-y-3">
              {ordenarFornecedores(produtoSelecionado.fornecedores).map((fornecedor, index) => {
                const economia = fornecedor.precoAntigo - fornecedor.preco
                const economiaPercent = ((economia / fornecedor.precoAntigo) * 100).toFixed(0)
                const isMenorPreco = index === 0 && ordenacao === "preco"

                return (
                  <motion.div
                    key={fornecedor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`card-glass p-4 ${isMenorPreco ? "border-[#4ADE80]/50" : ""}`}
                  >
                    {isMenorPreco && (
                      <div className="flex items-center gap-1 mb-2">
                        <BarChart3 className="w-3 h-3 text-[#4ADE80]" />
                        <span className="text-xs font-bold text-[#4ADE80]">MELHOR PRECO</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{fornecedor.nome}</h4>
                          {fornecedor.verificado && <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {fornecedor.avaliacao}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {fornecedor.entregas} entregas
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {fornecedor.cidade}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                          <Clock className="w-3 h-3" />
                          {fornecedor.tempoEntrega}
                        </div>
                      </div>

                      <div className="text-right">
                        {economia > 0 && (
                          <span className="text-xs line-through text-white/40">
                            R$ {fornecedor.precoAntigo.toFixed(2)}
                          </span>
                        )}
                        <div className="text-xl font-bold text-white">R$ {fornecedor.preco.toFixed(2)}</div>
                        {economia > 0 && <span className="text-xs text-[#4ADE80]">-{economiaPercent}% no app</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/fornecedor/${fornecedor.id}`)}
                      className="w-full mt-4 py-2 bg-gradient-to-r from-[#E94560] to-[#FF6B6B] rounded-lg text-sm font-medium text-white"
                    >
                      Ver Fornecedor
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
