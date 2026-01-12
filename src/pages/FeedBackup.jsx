"use client"

import React, { useState, useEffect, useRef } from "react"
import { base44 } from "@/api/base44Client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Heart,
  Eye,
  ExternalLink,
  Newspaper,
  MapPin,
  Bell,
  Store,
  Wand2,
  ShoppingBag,
  BookOpen,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/components/utils/logger"
import VideoModal from "@/components/feed/VideoModal"
import ComunidadeTelegramCard from "@/components/feed/ComunidadeTelegramCard"
import { useAuth } from "@/contexts/AuthContext"

// ============================================
// QUICK ACTIONS COMPONENT
// ============================================
function QuickActions({ navigate }) {
  const actions = [
    {
      icon: Store,
      label: "Fornecedores",
      page: "Fornecedores",
      gradient: "from-[#E94560] to-[#FB923C]",
    },
    {
      icon: Wand2,
      label: "Marketing IA",
      page: "MarketingIA",
      gradient: "from-[#A855F7] to-[#EC4899]",
    },
    {
      icon: ShoppingBag,
      label: "Market",
      page: "Marketplace",
      gradient: "from-[#4ADE80] to-[#22D3EE]",
    },
    {
      icon: BookOpen,
      label: "Cursos",
      page: "CursosDisponiveis",
      gradient: "from-[#3B82F6] to-[#8B5CF6]",
    },
  ]

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            onClick={() => navigate(createPageUrl(action.page))}
            className="flex flex-col items-center gap-2"
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
            >
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white/70">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// STORIES PROFISSIONAIS DISPONÍVEIS
// ============================================
function StoriesProfissionais({ items, onItemClick, totalOnline }) {
  const scrollRef = useRef(null)

  if (items.length === 0) return null

  return (
    <div className="px-4 py-3">
      {/* Header Inovador */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          <span className="text-sm font-bold text-white">Profissionais</span>
          <span className="text-sm font-bold text-[#4ADE80]">Disponíveis</span>
          <span className="text-xs text-white/50">• {totalOnline} online</span>
        </div>
        <button
          onClick={() => onItemClick({ page: "BuscarProfissionais" })}
          className="text-xs text-white/40 font-medium hover:text-white/60 transition-colors"
        >
          Ver todos
        </button>
      </div>

      {/* Stories Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item, index) => (
          <motion.button
            key={`${item.id}-${index}`}
            onClick={() => onItemClick(item)}
            className="flex-shrink-0 flex flex-col items-center w-[85px]"
            style={{ scrollSnapAlign: "start" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Avatar com Borda Gradiente */}
            <div className="relative mb-2">
              <div
                className="w-16 h-16 rounded-full p-[2.5px]"
                style={{ background: "linear-gradient(135deg, #E94560 0%, #FB923C 50%, #FBBF24 100%)" }}
              >
                <div className="w-full h-full rounded-full bg-[#0D0D0D] p-[2px]">
                  {item.foto ? (
                    <img
                      src={item.foto || "/placeholder.svg"}
                      alt={item.nome}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <span className="text-lg font-bold text-white/60">{item.nome?.charAt(0) || "?"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge de Status */}
              {item.statusBadge === "ONLINE" && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#4ADE80] rounded-full">
                  <span className="text-[8px] font-black text-black">DISPONÍVEL</span>
                </div>
              )}
              {item.isUrgente && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FBBF24] rounded-full">
                  <span className="text-[8px] font-black text-black">IMEDIATO</span>
                </div>
              )}
            </div>

            {/* Nome */}
            <span className="text-[11px] font-bold text-white truncate max-w-[80px] text-center">
              {item.nome?.split(" ")[0]}
            </span>

            {/* Especialidade + Rating */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-white/50 truncate max-w-[50px] uppercase">
                {item.especialidade?.substring(0, 12)}
              </span>
              <span className="text-[9px] text-[#FBBF24]">4.8</span>
              <Star className="w-2.5 h-2.5 text-[#FBBF24] fill-[#FBBF24]" />
            </div>

            {/* Localização */}
            <div className="flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#E94560]" />
              <span className="text-[8px] text-white/40 truncate max-w-[60px]">{item.cidade}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// STATS COMPACTO
// ============================================
function StatsCompacto({ stats }) {
  const now = new Date()
  const hora = now.getHours().toString().padStart(2, "0")
  const minuto = now.getMinutes().toString().padStart(2, "0")

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-[11px] text-white/40">
        <span className="font-medium">{stats.clinicas} Clínicas</span>
        <span>•</span>
        <span className="font-medium">{stats.especialidade} Especialidade</span>
        <span>•</span>
        <span className="font-medium">{stats.substituicao} Substituição</span>
        <span>•</span>
        <span className="text-white/30">
          atualizado {hora}:{minuto}
        </span>
      </div>
    </div>
  )
}

// ============================================
// ODONTO NEWS SECTION
// ============================================
function OdontoNewsHeader() {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #E94560 0%, #FB923C 100%)" }}
        >
          <Newspaper className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">OdontoNews</h2>
          <p className="text-[10px] text-white/40 italic -mt-0.5">Novidades do mundo da saúde</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// FEED CARD MODERNIZADO (Dark Theme)
// ============================================
function FeedCardDark({ post, onVideoClick, onCurtir }) {
  const tipoConfig = {
    NOTICIA_IA: { emoji: "🤖", label: "IA & Tech", color: "#60A5FA" },
    VIDEO: { emoji: "🎬", label: "Vídeo", color: "#F87171" },
    DICA: { emoji: "💡", label: "Dica", color: "#FBBF24" },
    PARCEIRO: { emoji: "🏪", label: "Parceiro", color: "#4ADE80" },
    COMUNIDADE: { emoji: "📱", label: "Comunidade", color: "#A855F7" },
    ADMIN: { emoji: "📢", label: "Novidade", color: "#FB923C" },
    NOVIDADE: { emoji: "✨", label: "Novidade", color: "#EC4899" },
    NOTICIA_SAUDE: { emoji: "🏥", label: "Saúde", color: "#22D3EE" },
    PROMOCAO: { emoji: "🎁", label: "Promoção", color: "#F87171" },
    CURSO: { emoji: "📚", label: "Curso", color: "#8B5CF6" },
    DESTAQUE_MARKETPLACE: { emoji: "🛒", label: "Market", color: "#4ADE80" },
  }

  const config = tipoConfig[post.tipo_post] || tipoConfig.ADMIN
  const temVideo = post.tipo_midia === "VIDEO" && post.video_url

  const getYouTubeId = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(post.video_url)
  const thumbnailUrl =
    post.imagem_url || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null)

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
    } catch {
      return "Recente"
    }
  }

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div
          className={`relative aspect-video bg-white/5 ${temVideo ? "cursor-pointer group" : ""}`}
          onClick={() => temVideo && onVideoClick && onVideoClick(post)}
        >
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt={post.titulo}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/640x360/1A1A2E/ffffff?text=Imagem"
            }}
          />

          {temVideo && (
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-900 border-b-8 border-b-transparent ml-1" />
              </div>
            </div>
          )}

          {post.fonte_nome && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
              {post.fonte_nome}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Badge + Time */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
              border: `1px solid ${config.color}30`,
            }}
          >
            {config.emoji} {config.label}
          </span>
          <span className="text-[10px] text-white/40">{getTimeAgo(post.created_date)}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-base mb-2 line-clamp-2">{post.titulo}</h3>

        {/* Description */}
        <p className="text-white/60 text-sm mb-4 line-clamp-2">{post.descricao}</p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onCurtir && onCurtir(post.id)}
              className="flex items-center gap-1.5 text-white/50 hover:text-[#E94560] transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">{post.curtidas || 0}</span>
            </button>

            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Eye className="w-3.5 h-3.5" />
              {post.visualizacoes || 0}
            </span>
          </div>

          {post.fonte_url && (
            <a
              href={post.fonte_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#E94560] via-[#FB923C] to-[#FBBF24] text-white text-xs font-bold rounded-full hover:shadow-lg transition-all"
            >
              Ver mais
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN FEED COMPONENT
// ============================================
export default function Feed() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  const [userType, setUserType] = useState(null)
  const [userArea, setUserArea] = useState(null)
  const [userLocation, setUserLocation] = useState({ cidade: null, uf: null })
  const [videoModal, setVideoModal] = useState({ open: false, post: null })

  // Carregar dados do usuário
  useEffect(() => {
    if (authLoading || !user) return

    const loadUserData = async () => {
      try {
        const professionals = await base44.entities.Professional.filter({ user_id: user.id })

        if (professionals.length > 0) {
          const prof = professionals[0]
          setUserType("PROFISSIONAL")
          setUserArea(prof.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")
          setUserLocation({
            cidade: prof.cidades_atendimento?.[0]?.split(" - ")[0] || "Não informada",
            uf: prof.uf_conselho || "Não informado",
          })
          return
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: user.id })

        if (owners.length > 0) {
          setUserType("CLINICA")
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id })

          if (units.length > 0) {
            const unit = units[0]
            setUserArea(
              unit.tipo_mundo === "ODONTOLOGIA" ? "ODONTOLOGIA" : unit.tipo_mundo === "MEDICINA" ? "MEDICINA" : "AMBOS",
            )
            setUserLocation({
              cidade: unit.cidade,
              uf: unit.uf,
            })
          }
          return
        }

        const suppliers = await base44.entities.Supplier.filter({ user_id: user.id })
        if (suppliers.length > 0) {
          setUserType("FORNECEDOR")
          return
        }

        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id })
        if (hospitals.length > 0) {
          setUserType("HOSPITAL")
          const hosp = hospitals[0]
          setUserLocation({ cidade: hosp.cidade, uf: hosp.uf })
          return
        }
      } catch (error) {
        logger.error("Erro ao carregar dados do usuário:", error)
      }
    }
    loadUserData()
  }, [user, authLoading])

  // Buscar profissionais/clínicas próximos
  const { data: storiesItems = [] } = useQuery({
    queryKey: ["storiesItems", userType, userLocation.uf, userArea],
    queryFn: async () => {
      if (!userLocation.uf) return []

      if (userType === "CLINICA") {
        // Clínica vê profissionais disponíveis
        const profissionais = await base44.entities.Professional.filter({
          status_disponibilidade_substituicao: "ONLINE",
          disponivel_substituicao: true,
          status_cadastro: "APROVADO",
        })

        return profissionais
          .filter((p) => p.uf_conselho === userLocation.uf)
          .slice(0, 15)
          .map((p) => ({
            id: p.id,
            nome: p.nome_completo || p.nome,
            foto: p.selfie_documento_url,
            especialidade: p.especialidade_principal || "Clínica Geral",
            cidade: p.cidades_atendimento?.[0]?.split(" - ")[0] || "N/A",
            uf: p.uf_conselho,
            statusBadge: "ONLINE",
            page: "VerProfissional",
          }))
      } else if (userType === "PROFISSIONAL") {
        // Profissional vê vagas de substituição
        const vagas = await base44.entities.SubstituicaoUrgente.filter({ status: "ABERTA" })

        return vagas
          .filter((v) => v.uf === userLocation.uf)
          .slice(0, 15)
          .map((v) => ({
            id: v.id,
            nome: v.nome_clinica,
            foto: null,
            especialidade: v.especialidade_necessaria,
            cidade: v.cidade,
            uf: v.uf,
            isUrgente: v.tipo_data === "IMEDIATO",
            page: "DetalheSubstituicao",
          }))
      }

      return []
    },
    enabled: !!userType && !!userLocation.uf,
  })

  // Buscar posts do feed
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feedPosts", userArea],
    queryFn: async () => {
      const feedPosts = await base44.entities.FeedPost.filter({ ativo: true })

      const now = new Date()
      const filteredPosts = feedPosts.filter((post) => {
        if (post.expires_at && new Date(post.expires_at) < now) return false
        return post.area === "AMBOS" || post.area === userArea
      })

      return filteredPosts.sort((a, b) => {
        if (a.destaque && !b.destaque) return -1
        if (!a.destaque && b.destaque) return 1
        return new Date(b.created_date) - new Date(a.created_date)
      })
    },
    enabled: !!user && !!userArea,
  })

  // Handler para curtir
  const handleCurtir = async (postId) => {
    try {
      const post = posts.find((p) => p.id === postId)
      if (!post) return

      await base44.entities.FeedPost.update(postId, {
        curtidas: (post.curtidas || 0) + 1,
      })
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] })
      toast.success("Curtido!")
    } catch (error) {
      logger.error("Erro ao curtir:", error)
    }
  }

  // Handler para clique no story
  const handleStoryClick = (item) => {
    if (item.page === "VerProfissional") {
      navigate(createPageUrl("VerProfissional") + `?id=${item.id}`)
    } else if (item.page === "DetalheSubstituicao") {
      navigate(createPageUrl("DetalheSubstituicao") + `?id=${item.id}`)
    } else if (item.page === "BuscarProfissionais") {
      navigate(createPageUrl("BuscarProfissionais"))
    }
  }

  // Stats mockados (você pode buscar dados reais)
  const stats = {
    clinicas: 12,
    especialidade: 5,
    substituicao: 3,
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header Premium */}
      <div
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: "rgba(13, 13, 13, 0.9)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #E94560 0%, #FB923C 50%, #FBBF24 100%)" }}
            >
              <span className="text-white font-black text-sm">D</span>
            </div>
            <div>
              <h1
                className="text-lg font-black tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #E94560 0%, #FB923C 50%, #FBBF24 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                DOUTORIZZE
              </h1>
            </div>
          </div>

          {/* Notificações */}
          <motion.button
            onClick={() => navigate(createPageUrl("NotificationCenter"))}
            className="relative w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-5 h-5 text-white/70" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E94560] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </motion.button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions navigate={navigate} />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4" />

      {/* Stories Profissionais */}
      <StoriesProfissionais
        items={storiesItems}
        userType={userType}
        onItemClick={handleStoryClick}
        totalOnline={storiesItems.length}
      />

      {/* Stats Compacto */}
      <StatsCompacto stats={stats} />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4" />

      {/* OdontoNews Header */}
      <OdontoNewsHeader />

      {/* Feed Posts */}
      <div className="px-4 py-2 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Nenhuma novidade ainda</h3>
            <p className="text-white/50 text-sm">Em breve teremos conteúdos incríveis!</p>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <FeedCardDark
                  post={post}
                  onVideoClick={(p) => setVideoModal({ open: true, post: p })}
                  onCurtir={handleCurtir}
                />

                {/* CTA Telegram a cada 5 posts */}
                {(index + 1) % 5 === 0 && <ComunidadeTelegramCard key={`telegram-${index}`} />}
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Modal de Vídeo */}
      <VideoModal
        isOpen={videoModal.open}
        onClose={() => setVideoModal({ open: false, post: null })}
        post={videoModal.post}
        onCurtir={handleCurtir}
      />
    </div>
  )
}
