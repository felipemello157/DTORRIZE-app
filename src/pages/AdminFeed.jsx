/**
 * ADMIN FEED - Página de gestão do feed de notícias
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Heart,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useNavigate } from "react-router-dom";

const tipoPostLabels = {
  NOVIDADE: "Novidade",
  NOTICIA_SAUDE: "Saúde",
  NOTICIA_IA: "IA & Tech",
  PARCEIRO: "Parceiro",
  PROMOCAO: "Promoção",
  CURSO: "Curso",
  DESTAQUE_MARKETPLACE: "Marketplace",
  COMUNIDADE: "Comunidade"
};

const tipoPostColors = {
  NOVIDADE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  NOTICIA_SAUDE: "bg-red-500/10 text-red-400 border-red-500/20",
  NOTICIA_IA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PARCEIRO: "bg-green-500/10 text-green-400 border-green-500/20",
  PROMOCAO: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  CURSO: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DESTAQUE_MARKETPLACE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  COMUNIDADE: "bg-teal-500/10 text-teal-400 border-teal-500/20"
};

const areaLabels = {
  ODONTOLOGIA: "Odontologia",
  MEDICINA: "Medicina",
  AMBOS: "Ambos"
};

function AdminFeedContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    tipo_post: "NOVIDADE",
    tipo_midia: "IMAGEM",
    titulo: "",
    descricao: "",
    imagem_url: "",
    video_url: "",
    fonte_nome: "",
    fonte_url: "",
    area: "AMBOS",
    destaque: false,
    ativo: true
  });

  // Buscar posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-feed-posts"],
    queryFn: async () => {
      return await base44.entities.FeedPost.list("-created_date");
    }
  });

  // Mutation para criar/editar
  const salvarMutation = useMutation({
    mutationFn: async (data) => {
      if (editingPost) {
        return await base44.entities.FeedPost.update(editingPost.id, data);
      }
      return await base44.entities.FeedPost.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      resetForm();
      toast.success(editingPost ? "✅ Post atualizado!" : "✅ Post criado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation para deletar
  const deletarMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.FeedPost.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      toast.success("🗑️ Post excluído");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation para toggle ativo
  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }) => {
      return await base44.entities.FeedPost.update(id, { ativo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      toast.success("Status atualizado");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  });

  // Mutation para toggle destaque
  const toggleDestaqueMutation = useMutation({
    mutationFn: async ({ id, destaque }) => {
      return await base44.entities.FeedPost.update(id, { destaque });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      toast.success("Destaque atualizado");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar destaque: " + error.message);
    }
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({
      tipo_post: "NOVIDADE",
      tipo_midia: "IMAGEM",
      titulo: "",
      descricao: "",
      imagem_url: "",
      video_url: "",
      fonte_nome: "",
      fonte_url: "",
      area: "AMBOS",
      destaque: false,
      ativo: true
    });
  };

  const handleEditar = (post) => {
    setEditingPost(post);
    setFormData({
      tipo_post: post.tipo_post || "NOVIDADE",
      tipo_midia: post.tipo_midia || "IMAGEM",
      titulo: post.titulo || "",
      descricao: post.descricao || "",
      imagem_url: post.imagem_url || "",
      video_url: post.video_url || "",
      fonte_nome: post.fonte_nome || "",
      fonte_url: post.fonte_url || "",
      area: post.area || "AMBOS",
      destaque: post.destaque || false,
      ativo: post.ativo !== false
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.descricao.trim()) {
      toast.error("Título e descrição são obrigatórios");
      return;
    }
    salvarMutation.mutate(formData);
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  // Contadores
  const ativos = posts.filter(p => p.ativo).length;
  const inativos = posts.filter(p => !p.ativo).length;
  const destaques = posts.filter(p => p.destaque).length;
  const postsComunitarios = posts.filter(p => p.tipo_post === "COMUNIDADE").length;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Gerenciar Feed</h1>
                <p className="text-gray-400">Conteúdos e notícias</p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Contadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Ativos" count={ativos} color="green" />
          <StatsCard label="Inativos" count={inativos} color="gray" />
          <StatsCard label="Destaques" count={destaques} color="yellow" />
          <StatsCard label="Comunidade" count={postsComunitarios} color="purple" />
        </div>

        {/* Lista de Posts */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-brand-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#13132B] rounded-3xl border border-white/10 p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum post criado ainda</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              Criar Primeiro Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-[#13132B] rounded-2xl border ${post.destaque ? "border-yellow-500/40" : "border-white/10"
                    } p-6 shadow-xl hover:border-white/20 transition-all relative ${!post.ativo ? "opacity-60" : ""}`}
                >
                  {post.destaque && (
                    <div className="absolute top-4 right-4 text-yellow-500">
                      <Star className="w-5 h-5 fill-yellow-500" />
                    </div>
                  )}

                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#0a0a1a] flex-shrink-0 border border-white/10">
                      {post.imagem_url ? (
                        <img
                          src={post.imagem_url}
                          alt={post.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          {post.video_url ? (
                            <Video className="w-8 h-8" />
                          ) : (
                            <ImageIcon className="w-8 h-8" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${tipoPostColors[post.tipo_post] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                          {tipoPostLabels[post.tipo_post] || post.tipo_post}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold border bg-white/5 text-gray-300 border-white/10">
                          {areaLabels[post.area]}
                        </span>
                        {!post.ativo && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold border border-red-500/30">
                            INATIVO
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg text-white mb-1 truncate pr-8">{post.titulo}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{post.descricao}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.visualizacoes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.curtidas || 0}
                        </span>
                        <span>{getTimeAgo(post.created_date)}</span>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-col gap-2 justify-center pl-4 border-l border-white/5">
                      <button
                        onClick={() => toggleAtivoMutation.mutate({ id: post.id, ativo: !post.ativo })}
                        className={`p-2 rounded-lg transition-all border ${post.ativo ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                          }`}
                        title={post.ativo ? "Desativar" : "Ativar"}
                      >
                        {post.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleDestaqueMutation.mutate({ id: post.id, destaque: !post.destaque })}
                        className={`p-2 rounded-lg transition-all border ${post.destaque ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                          }`}
                        title={post.destaque ? "Remover destaque" : "Destacar"}
                      >
                        <Star className={`w-4 h-4 ${post.destaque ? "fill-yellow-500" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleEditar(post)}
                        className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Excluir este post?")) {
                            deletarMutation.mutate(post.id);
                          }
                        }}
                        className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-6 max-w-2xl w-full my-8 relative"
            >
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                disabled={salvarMutation.isPending}
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-white mb-6">
                {editingPost ? "Editar Post" : "Novo Post"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Tipo de Post</label>
                    <select
                      value={formData.tipo_post}
                      onChange={(e) => setFormData({ ...formData, tipo_post: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all"
                    >
                      {Object.entries(tipoPostLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Área</label>
                    <select
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all"
                    >
                      {Object.entries(areaLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all"
                    placeholder="Título do post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Descrição *</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all resize-none"
                    placeholder="Conteúdo do post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">URL da Imagem</label>
                  <input
                    type="url"
                    value={formData.imagem_url}
                    onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">URL do Vídeo (opcional)</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Nome da Fonte</label>
                    <input
                      type="text"
                      value={formData.fonte_nome}
                      onChange={(e) => setFormData({ ...formData, fonte_nome: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all"
                      placeholder="Nome da fonte"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">URL da Fonte</label>
                    <input
                      type="url"
                      value={formData.fonte_url}
                      onChange={(e) => setFormData({ ...formData, fonte_url: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.destaque}
                      onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-[#0a0a1a] checked:bg-yellow-500 checked:border-yellow-500 accent-yellow-500"
                    />
                    <span className="font-bold text-gray-300">Destacar no topo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-[#0a0a1a] checked:bg-green-500 checked:border-green-500 accent-green-500"
                    />
                    <span className="font-bold text-gray-300">Post Ativo</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvarMutation.isPending}
                    className="flex-1 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {salvarMutation.isPending ? "Salvando..." : editingPost ? "Atualizar" : "Criar Post"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components

function StatsCard({ label, count, color }) {
  const colors = {
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className={`px-4 py-3 rounded-2xl border ${colors[color]} flex flex-col items-center justify-center`}>
      <span className="text-2xl font-black">{count}</span>
      <span className="text-xs uppercase font-bold opacity-70">{label}</span>
    </div>
  );
}

// Export com ProtectedRoute wrapper
export default function AdminFeed() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminFeedContent />
    </ProtectedRoute>
  );
}