import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  ChevronRight,
  Inbox,
  Clock,
  ShoppingBag,
  ArrowLeft
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Chats() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // MOCK USER FALLBACK (LOCALHOST)
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          setUser({
            id: "mock-user-123",
            nome_completo: "Dev Localhost",
            vertical: "ODONTOLOGIA"
          });
        }
      }
    };
    loadUser();
  }, []);

  // Buscar threads do usuário
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["chatThreads", user?.id],
    queryFn: async () => {
      // MOCK DATA PARA CHATS (LOCALHOST)
      if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && user?.id === "mock-user-123") {
        return [
          {
            id: "mock-thread-1",
            buyer_name: "Doutor Exemplo",
            seller_name: "Você",
            buyer_user_id: "mock-buyer-1",
            seller_user_id: "mock-user-123",
            item_title: "Cadeira Odontológica Kavo",
            last_message_preview: "Ainda está disponível?",
            last_message_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            unread_seller: 1,
            status: "ATIVO"
          },
          {
            id: "mock-thread-2",
            buyer_name: "Você",
            seller_name: "Clínica Integrada",
            buyer_user_id: "mock-user-123",
            seller_user_id: "mock-seller-2",
            item_title: "Autoclave 12L",
            last_message_preview: "Posso fazer por R$ 2.500 à vista.",
            last_message_at: new Date(Date.now() - 3600000).toISOString(),
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            unread_buyer: 0,
            status: "ATIVO"
          }
        ];
      }

      if (!user) return [];

      const allThreads = await base44.entities.ChatThread.filter({
        status: "ATIVO"
      });

      // Filtrar threads do usuário (comprador ou vendedor)
      const myThreads = allThreads.filter(
        t => t.buyer_user_id === user.id || t.seller_user_id === user.id
      );

      // Filtrar apenas não expiradas
      const now = new Date();
      const activeThreads = myThreads.filter(t => new Date(t.expires_at) > now);

      // Atualizar threads expiradas (side effect)
      const expiredThreads = myThreads.filter(t => new Date(t.expires_at) <= now && t.status === "ATIVO");
      expiredThreads.forEach(t => {
        base44.entities.ChatThread.update(t.id, { status: "EXPIRADO" });
      });

      // Ordenar por última atividade (mais recente primeiro)
      return activeThreads.sort((a, b) =>
        new Date(b.last_message_at || b.created_date) - new Date(a.last_message_at || a.created_date)
      );
    },
    enabled: !!user,
    refetchInterval: 10000 // Refresh a cada 10 segundos
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-brand-coral/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 relative z-10 mb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-coral to-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Meus Chats</h1>
              <p className="text-gray-400">Conversas do Marketplace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {threads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#13132B] rounded-3xl border border-white/10 p-12 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#0a0a1a] border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              Nenhum chat ativo
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Quando você entrar em contato com um vendedor ou alguém se interessar pelos seus anúncios, os chats aparecerão aqui.
            </p>
            <button
              onClick={() => navigate(createPageUrl("Marketplace"))}
              className="px-8 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-orange/20 transition-all hover:scale-[1.02]"
            >
              Ir para o Marketplace
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {threads.map((thread, index) => (
                <ChatCard
                  key={thread.id}
                  thread={thread}
                  user={user}
                  index={index}
                  navigate={navigate}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatCard({ thread, user, index, navigate }) {
  const isBuyer = user.id === thread.buyer_user_id;
  const otherUserName = isBuyer ? thread.seller_name : thread.buyer_name;
  const unreadCount = isBuyer ? thread.unread_buyer : thread.unread_seller;

  // Calcular tempo restante
  const now = new Date();
  const expiresAt = new Date(thread.expires_at);
  const horasRestantes = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60)));
  const isExpiringSoon = horasRestantes < 12;

  // Preview da última mensagem
  const preview = thread.last_message_preview || "Conversa iniciada";

  // Tempo desde última mensagem
  const lastMessageTime = thread.last_message_at || thread.created_date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(createPageUrl("ChatThread") + "?id=" + thread.id)}
      className="bg-[#13132B] rounded-3xl border border-white/10 p-5 hover:border-brand-orange/50 hover:bg-[#1E1E3F] transition-all cursor-pointer group shadow-lg hover:shadow-brand-orange/5"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-brand-orange/20">
          {otherUserName?.charAt(0).toUpperCase()}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white truncate text-lg group-hover:text-brand-orange transition-colors">
                  {otherUserName}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-brand-orange text-white rounded-full text-xs font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-orange/80 font-semibold truncate flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                {thread.item_title}
              </p>
            </div>
            <div className="flex items-center text-gray-500 text-xs whitespace-nowrap ml-2">
              {formatDistanceToNow(new Date(lastMessageTime), {
                addSuffix: true,
                locale: ptBR
              })}
              <ChevronRight className="w-5 h-5 text-gray-500 ml-1 group-hover:text-brand-orange transition-colors" />
            </div>
          </div>

          {/* Preview */}
          <p className={`text-sm mb-3 line-clamp-1 ${unreadCount > 0 ? "text-white font-medium" : "text-gray-400"}`}>
            {preview}
          </p>

          {/* Footer Time Status */}
          <div className="flex items-center justify-end border-t border-white/5 pt-3 mt-2">
            <div className={`flex items-center gap-1.5 font-bold text-xs px-2 py-1 rounded-lg ${isExpiringSoon ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-gray-400 border border-white/5"
              }`}>
              <Clock className="w-3.5 h-3.5" />
              {horasRestantes}h restantes para expirar
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}