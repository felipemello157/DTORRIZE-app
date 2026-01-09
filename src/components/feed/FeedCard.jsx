import React from "react";
import { Heart, Play, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoConfig = {
  NOTICIA_IA: { emoji: "📰", label: "Notícia", bg: "bg-blue-500/20", text: "text-blue-300" },
  VIDEO: { emoji: "🎬", label: "Vídeo", bg: "bg-red-500/20", text: "text-red-300" },
  DICA: { emoji: "💡", label: "Dica", bg: "bg-yellow-500/20", text: "text-yellow-300" },
  PARCEIRO: { emoji: "🏪", label: "Parceiro", bg: "bg-green-500/20", text: "text-green-300" },
  COMUNIDADE: { emoji: "📱", label: "Comunidade", bg: "bg-purple-500/20", text: "text-purple-300" },
  ADMIN: { emoji: "📢", label: "Novidade", bg: "bg-orange-500/20", text: "text-orange-300" },
  NOVIDADE: { emoji: "✨", label: "Novidade", bg: "bg-pink-500/20", text: "text-pink-300" },
  NOTICIA_SAUDE: { emoji: "🏥", label: "Saúde", bg: "bg-teal-500/20", text: "text-teal-300" },
  PROMOCAO: { emoji: "🎁", label: "Promoção", bg: "bg-red-500/20", text: "text-red-300" },
  CURSO: { emoji: "📚", label: "Curso", bg: "bg-indigo-500/20", text: "text-indigo-300" },
  DESTAQUE_MARKETPLACE: { emoji: "🛒", label: "Marketplace", bg: "bg-emerald-500/20", text: "text-emerald-300" }
};

export default function FeedCard({ post, onVideoClick, onCurtir }) {
  const config = tipoConfig[post.tipo_post] || tipoConfig.ADMIN;
  const temVideo = post.tipo_midia === "VIDEO" && post.video_url;

  // Extrair ID do YouTube para thumbnail
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(post.video_url);
  const thumbnailUrl = post.imagem_url ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null);

  // Formatar duração do vídeo
  const formatDuracao = (segundos) => {
    if (!segundos) return "";
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  return (
    <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden hover:border-brand-coral/30 transition-all shadow-lg hover:shadow-brand-coral/10">
      {/* Thumbnail/Imagem */}
      {thumbnailUrl && (
        <div
          className={`relative aspect-video bg-gray-900 ${temVideo ? 'cursor-pointer group' : ''}`}
          onClick={() => temVideo && onVideoClick && onVideoClick(post)}
        >
          <img
            src={thumbnailUrl}
            alt={post.titulo}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/640x360?text=Imagem+indisponível';
            }}
          />

          {/* Overlay de vídeo */}
          {temVideo && (
            <>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                <div className="w-16 h-16 bg-brand-coral/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg backdrop-blur-sm">
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Duração */}
              {post.video_duracao && (
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded">
                  {formatDuracao(post.video_duracao)}
                </div>
              )}
            </>
          )}

          {/* Badge fonte */}
          {post.fonte_nome && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-xs font-bold rounded flex items-center gap-1 backdrop-blur-md">
              {post.fonte_tipo === "YOUTUBE" && "📺"}
              {post.fonte_tipo === "INSTAGRAM" && "📷"}
              {post.fonte_tipo === "TELEGRAM" && "📱"}
              {post.fonte_tipo === "SITE" && "🌐"}
              {post.fonte_tipo === "REVISTA" && "📖"}
              {post.fonte_nome}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-5">
        {/* Badge tipo + tempo */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className={`px-3 py-1 ${config.bg} ${config.text} text-xs font-bold rounded-full border border-white/5`}>
            {config.emoji} {config.label}
          </span>
          {post.area && post.area !== "AMBOS" && (
            <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full border border-white/5">
              {post.area === "ODONTOLOGIA" ? "🦷" : "🩺"} {post.area}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {getTimeAgo(post.created_date)}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 leading-tight">
          {post.titulo}
        </h3>

        {/* Descrição */}
        <p className="text-gray-400 text-sm mb-5 line-clamp-3 leading-relaxed">
          {post.descricao}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onCurtir && onCurtir(post.id)}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors group"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{post.curtidas || 0}</span>
            </button>

            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <span className="text-xs">
                👁️
              </span>
              <span className="text-sm font-medium">{post.visualizacoes || 0}</span>
            </button>
          </div>

          {post.fonte_url && (
            <a
              href={post.fonte_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-brand-coral to-brand-orange text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-brand-coral/20 hover:scale-105 transition-all"
            >
              Ver mais
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}