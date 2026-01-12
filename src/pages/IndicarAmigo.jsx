"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Gift, Users, Copy, Share2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function IndicarAmigo() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock data
  const codigoIndicacao = "DOUT2025FMP"
  const linkIndicacao = `https://doutorizze.com.br/cadastro?ref=${codigoIndicacao}`
  const indicacoesDoMes = 3
  const limiteIndicacoes = 10
  const pontosGanhos = 150

  const indicados = [
    { nome: "Dr. Carlos Silva", status: "ativo", pontos: 50 },
    { nome: "Dra. Maria Santos", status: "pendente", pontos: 0 },
    { nome: "Dr. Pedro Lima", status: "ativo", pontos: 50 },
  ]

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkIndicacao)
    toast.success("Link copiado!")
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigoIndicacao)
    toast.success("Codigo copiado!")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Conheca o Doutorizze!",
          text: "Estou usando o Doutorizze e recomendo! Use meu codigo para ganhar beneficios.",
          url: linkIndicacao,
        })
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyLink()
    }
  }

  const handleEnviarConvite = async () => {
    if (!email) {
      toast.error("Digite um email valido")
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)

    toast.success("Convite enviado!")
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Indicar Amigo
            </h1>
            <p className="text-sm text-white/80">Ganhe beneficios indicando colegas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/10 border-white/20 p-3 text-center">
            <div className="text-2xl font-bold">{indicacoesDoMes}</div>
            <div className="text-xs text-white/80">Este mes</div>
          </Card>
          <Card className="bg-white/10 border-white/20 p-3 text-center">
            <div className="text-2xl font-bold">{limiteIndicacoes - indicacoesDoMes}</div>
            <div className="text-xs text-white/80">Restantes</div>
          </Card>
          <Card className="bg-white/10 border-white/20 p-3 text-center">
            <div className="text-2xl font-bold">{pontosGanhos}</div>
            <div className="text-xs text-white/80">Pontos</div>
          </Card>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4">
        {/* Como funciona */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Como funciona
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <p className="text-sm text-gray-600">Compartilhe seu codigo ou link com um colega</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p className="text-sm text-gray-600">Seu colega se cadastra usando seu codigo</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p className="text-sm text-gray-600">Quando ele fizer a primeira compra, voces dois ganham pontos!</p>
            </div>
          </div>
        </Card>

        {/* Codigo e Link */}
        <Card className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Seu codigo de indicacao</label>
            <div className="flex gap-2">
              <Input value={codigoIndicacao} readOnly className="font-mono text-lg text-center" />
              <Button variant="outline" onClick={handleCopyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Ou compartilhe o link</label>
            <div className="flex gap-2">
              <Input value={linkIndicacao} readOnly className="text-sm" />
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button onClick={handleShare} className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </Card>

        {/* Enviar por email */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Enviar convite por email</h3>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleEnviarConvite} disabled={loading}>
              {loading ? "..." : "Enviar"}
            </Button>
          </div>
        </Card>

        {/* Indicados */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            Seus indicados
          </h3>

          {indicados.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Voce ainda nao indicou ninguem</p>
          ) : (
            <div className="space-y-3">
              {indicados.map((indicado, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{indicado.nome}</p>
                      <p className={`text-xs ${indicado.status === "ativo" ? "text-green-600" : "text-yellow-600"}`}>
                        {indicado.status === "ativo" ? "Ativo" : "Aguardando primeira compra"}
                      </p>
                    </div>
                  </div>
                  {indicado.pontos > 0 && (
                    <span className="text-sm font-medium text-amber-600">+{indicado.pontos} pts</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="text-xs text-gray-500 text-center">
          Limite de {limiteIndicacoes} indicacoes por mes. Indicacoes nao sao acumulativas.
        </p>
      </div>
    </div>
  )
}
