"use client"

import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Building2,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  Shield,
} from "lucide-react"

const CONTRATO_MOCK = {
  id: "CTR-2025-0001",
  tipo: "substituicao",
  status: "pendente", // pendente, aceito, em_andamento, concluido, cancelado
  criadoEm: "2025-01-03T10:00:00",

  profissional: {
    nome: "Dr. Carlos Silva",
    documento: "CRO-SP 12345",
    telefone: "(11) 99999-8888",
    foto: "/placeholder.svg?height=60&width=60",
  },

  clinica: {
    nome: "Clinica Sorriso Perfeito",
    cnpj: "12.345.678/0001-99",
    endereco: "Rua das Flores, 123 - Sao Paulo/SP",
    responsavel: "Dra. Maria Santos",
    telefone: "(11) 3333-4444",
  },

  detalhes: {
    data: "2025-01-10",
    horarioInicio: "08:00",
    horarioFim: "18:00",
    cargaHoraria: "10 horas",
    especialidade: "Clinico Geral",
    valor: 1500.0,
    formaPagamento: "PIX apos o plantao",
  },

  termos: [
    "O profissional devera comparecer com 15 minutos de antecedencia",
    "Uso obrigatorio de EPI fornecido pela clinica",
    "Em caso de cancelamento, avisar com 24h de antecedencia",
    "Pagamento sera realizado em ate 24h apos a conclusao",
    "A Doutorizze nao se responsabiliza por acordos fora da plataforma",
  ],
}

export default function ContratoDigital() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contratoId = searchParams.get("id") || CONTRATO_MOCK.id

  const [contrato] = useState(CONTRATO_MOCK)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [assinando, setAssinando] = useState(false)

  const handleAssinar = () => {
    setAssinando(true)
    // Simula assinatura
    setTimeout(() => {
      setAssinando(false)
      navigate("/dashboard-substituicoes?sucesso=contrato_assinado")
    }, 2000)
  }

  const getStatusColor = (status) => {
    const colors = {
      pendente: "#FBBF24",
      aceito: "#4ADE80",
      em_andamento: "#22D3EE",
      concluido: "#4ADE80",
      cancelado: "#EF4444",
    }
    return colors[status] || "#9CA3AF"
  }

  const getStatusLabel = (status) => {
    const labels = {
      pendente: "Aguardando Assinatura",
      aceito: "Aceito",
      em_andamento: "Em Andamento",
      concluido: "Concluido",
      cancelado: "Cancelado",
    }
    return labels[status] || status
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
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Contrato Digital</h1>
            <p className="text-xs text-white/50">{contratoId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10">
              <Download className="w-4 h-4 text-white/60" />
            </button>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10">
              <Share2 className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status */}
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: `${getStatusColor(contrato.status)}15` }}
        >
          <FileText className="w-5 h-5" style={{ color: getStatusColor(contrato.status) }} />
          <span className="font-medium" style={{ color: getStatusColor(contrato.status) }}>
            {getStatusLabel(contrato.status)}
          </span>
        </div>

        {/* Partes do contrato */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Profissional */}
          <div className="card-glass p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#E94560]" />
              <span className="text-xs text-white/50 uppercase">Profissional</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={contrato.profissional.foto || "/placeholder.svg"}
                alt={contrato.profissional.nome}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-white">{contrato.profissional.nome}</h3>
                <p className="text-xs text-white/50">{contrato.profissional.documento}</p>
                <p className="text-xs text-white/40">{contrato.profissional.telefone}</p>
              </div>
            </div>
          </div>

          {/* Clinica */}
          <div className="card-glass p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-[#FB923C]" />
              <span className="text-xs text-white/50 uppercase">Clinica</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{contrato.clinica.nome}</h3>
              <p className="text-xs text-white/50">CNPJ: {contrato.clinica.cnpj}</p>
              <p className="text-xs text-white/40">{contrato.clinica.responsavel}</p>
            </div>
          </div>
        </div>

        {/* Detalhes do servico */}
        <div className="card-glass p-4">
          <h3 className="font-semibold text-white mb-4">Detalhes do Servico</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-xs text-white/50">Data</p>
                <p className="text-sm font-medium text-white">
                  {new Date(contrato.detalhes.data).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-xs text-white/50">Horario</p>
                <p className="text-sm font-medium text-white">
                  {contrato.detalhes.horarioInicio} - {contrato.detalhes.horarioFim}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-xs text-white/50">Local</p>
                <p className="text-sm font-medium text-white">{contrato.clinica.endereco}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-xs text-white/50">Valor</p>
                <p className="text-sm font-medium text-[#4ADE80]">R$ {contrato.detalhes.valor.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Termos */}
        <div className="card-glass p-4">
          <h3 className="font-semibold text-white mb-4">Termos e Condicoes</h3>
          <ul className="space-y-3">
            {contrato.termos.map((termo, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{termo}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Aviso legal */}
        <div className="flex items-start gap-3 p-4 bg-[#FBBF24]/10 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-[#FBBF24] shrink-0" />
          <p className="text-xs text-white/70">
            A Doutorizze atua apenas como intermediadora, nao se responsabilizando por acordos, pagamentos ou disputas
            entre as partes. Este contrato tem valor de acordo entre as partes.
          </p>
        </div>

        {/* Assinatura */}
        {contrato.status === "pendente" && (
          <div className="card-glass p-4">
            <label className="flex items-start gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-[#E94560] focus:ring-[#E94560]"
              />
              <span className="text-sm text-white/70">
                Li e aceito todos os termos e condicoes deste contrato digital
              </span>
            </label>

            <button
              onClick={handleAssinar}
              disabled={!aceitouTermos || assinando}
              className="w-full py-3 bg-gradient-to-r from-[#E94560] to-[#FF6B6B] rounded-xl font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {assinando ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Shield className="w-5 h-5" />
                  </motion.div>
                  Assinando...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Assinar Contrato Digitalmente
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
