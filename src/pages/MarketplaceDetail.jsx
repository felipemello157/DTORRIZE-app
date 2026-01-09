import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  MapPin,
  Tag,
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

export default function MarketplaceDetail() {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["marketplaceItem", itemId],
    queryFn: async () => {
      if (!itemId) throw new Error("ID não fornecido");

      const items = await base44.entities.MarketplaceItem.filter({ id: itemId });

      if (items.length === 0) throw new Error("Item não encontrado");

      return items[0];
    },
    enabled: !!itemId,
    retry: 1,
  });

  // Incrementar visualizações
  useEffect(() => {
    if (item?.id) {
      base44.entities.MarketplaceItem.update(item.id, {
        visualizacoes: (item.visualizacoes || 0) + 1,
      }).catch(() => { });
    }
  }, [item?.id]);

  const formatPrice = (price) => {
    if (!price) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: item?.titulo_item || "Equipamento",
        text: `Confira este item no Marketplace`,
        url: url,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const nextImage = () => {
    const images = item?.fotos || [];
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = item?.fotos || [];
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const iniciarChat = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (user.id === item.anunciante_id) {
      toast.error("Você não pode conversar com seu próprio anúncio");
      return;
    }

    setCreatingChat(true);
    try {
      // Buscar thread existente ativa
      const existingThreads = await base44.entities.ChatThread.filter({
        marketplace_item_id: item.id,
        buyer_user_id: user.id,
        seller_user_id: item.anunciante_id,
        status: "ATIVO"
      });

      let thread = null;

      // Verificar se tem thread não expirada
      const now = new Date();
      const activeThread = existingThreads.find(t => new Date(t.expires_at) > now);

      if (activeThread) {
        thread = activeThread;
      } else {
        // Criar nova thread
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        thread = await base44.entities.ChatThread.create({
          marketplace_item_id: item.id,
          buyer_user_id: user.id,
          buyer_name: user.full_name,
          seller_user_id: item.anunciante_id,
          seller_name: item.anunciante_nome,
          item_title: item.titulo_item,
          item_price: item.preco,
          item_photo: item.foto_frontal || item.fotos?.[0],
          expires_at: expiresAt.toISOString(),
          status: "ATIVO",
          unread_buyer: 0,
          unread_seller: 0
        });
      }

      navigate(createPageUrl(`ChatThread?id=${thread.id}`));
    } catch (error) {
      toast.error("Erro ao iniciar chat: " + error.message);
    }
    setCreatingChat(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-32 bg-white/10 rounded-xl"></div>
            <div className="h-96 bg-white/5 rounded-3xl"></div>
            <div className="h-32 bg-white/5 rounded-3xl"></div>
            <div className="h-64 bg-white/5 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!itemId || error || !item) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-50">😕</div>
          <h2 className="text-3xl font-black text-white mb-2">Equipamento não encontrado</h2>
          <p className="text-gray-400 mb-6">Este anúncio pode ter sido removido ou não existe.</p>
          <button
            onClick={() => navigate(createPageUrl("Marketplace"))}
            className="px-8 py-4 bg-brand-orange text-white font-bold rounded-2xl hover:bg-brand-orange/90 transition-all">
            Voltar ao Marketplace
          </button>
        </div>
      </div>
    );
  }

  const images = item?.fotos || [];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-32 relative overflow-hidden">
      {/* Ambient Backgorund */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-10" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-10" />
      </div>

      <div className="relative z-10">
        {/* Nav Header */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={() => navigate(createPageUrl("Marketplace"))}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium backdrop-blur-md bg-black/20 px-4 py-2 rounded-xl border border-white/5 hover:border-white/20">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <button
            onClick={() => navigate(createPageUrl("Denunciar") + "?tipo=MARKETPLACE&id=" + itemId)}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 font-medium transition-colors"
            title="Denunciar"
          >
            <Flag className="w-5 h-5" />
            <span className="text-sm">Denunciar</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Galeria de Imagens */}
          <div className="mb-8">
            <div className="relative rounded-3xl overflow-hidden bg-[#13132B] h-80 md:h-[500px] border border-white/10 shadow-2xl">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImageIndex]}
                    alt={item.titulo_item}
                    className="w-full h-full object-contain bg-black/50 backdrop-blur-xl"
                  />

                  {/* Imagem em blur no fundo para preencher */}
                  <div className="absolute inset-0 -z-10 blur-xl opacity-50">
                    <img src={images[selectedImageIndex]} className="w-full h-full object-cover" alt="" />
                  </div>

                  {/* Setas de navegação */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/20 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/20 transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Indicadores */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/40 rounded-full backdrop-blur-md border border-white/10">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${selectedImageIndex === idx ? "bg-brand-orange scale-125" : "bg-white/50 hover:bg-white/80"
                          }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-white/5 text-white/20">
                  {item.tipo_mundo === "ODONTOLOGIA" ? "🦷" : "⚕️"}
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-24 h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${selectedImageIndex === idx ? "border-brand-orange shadow-lg shadow-brand-orange/20" : "border-transparent opacity-60 hover:opacity-100"
                      }`}>
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Info Header */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-2 ${item.tipo_mundo === "ODONTOLOGIA" ? "text-orange-400" : "text-blue-400"
                    }`}>
                    {item.tipo_mundo === "ODONTOLOGIA" ? "🦷 Odontologia" : "⚕️ Medicina"}
                  </span>
                  {item.condicao && (
                    <span className={`px-3 py-1 rounded-lg border text-sm font-semibold ${item.condicao === "NOVO"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : item.condicao === "SEMINOVO"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                      {item.condicao === "NOVO" ? "✨ Novo" : item.condicao === "SEMINOVO" ? "⭐ Seminovo" : "🔧 Usado"}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-semibold text-sm">
                    ✅ Disponível
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                  {item.titulo_item}
                </h1>

                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  {item.marca && (
                    <div className="flex items-center gap-2 bg-[#13132B] px-3 py-1.5 rounded-lg border border-white/10">
                      <Tag className="w-4 h-4" />
                      <span>{item.marca} {item.ano_fabricacao && `• ${item.ano_fabricacao}`}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-[#13132B] px-3 py-1.5 rounded-lg border border-white/10">
                    <Eye className="w-4 h-4" />
                    <span>{item.visualizacoes || 0} views</span>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-[#13132B]/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center gap-3">
                  <h2 className="font-bold text-white text-lg">Descrição do Equipamento</h2>
                </div>
                <div className="p-6 text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                  {item.descricao || "Sem descrição disponível."}
                </div>
              </div>
            </div>

            {/* Sidebar de Preço e Contato */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl sticky top-24">
                <p className="text-gray-400 font-medium mb-1">Valor do investimento</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white tracking-tight">{formatPrice(item.preco)}</span>
                </div>

                <div className="flex items-start gap-3 mb-6 pb-6 border-b border-white/10">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Localização</p>
                    <p className="text-gray-400">{item.localizacao}</p>
                  </div>
                </div>

                {/* Info do Vendedor */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-xl text-white font-bold shadow-lg shadow-brand-orange/20">
                    {item.anunciante_nome?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.anunciante_nome || "Anunciante"}</p>
                    <p className="text-xs text-gray-400 px-2 py-0.5 bg-white/5 rounded inline-block mt-1 border border-white/10">
                      {item.anunciante_tipo === "DENTISTA" && "Dentista"}
                      {item.anunciante_tipo === "MEDICO" && "Médico"}
                      {item.anunciante_tipo === "CLINICA" && "Clínica"}
                      {item.anunciante_tipo === "FORNECEDOR" && "Fornecedor"}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação (Desktop/Tablet) */}
                <div className="space-y-3">
                  {item.whatsapp_visivel && item.whatsapp_verificado && (
                    <WhatsAppSafeButton
                      phone={item.telefone_contato}
                      message={`Olá! Vi no App Doutorizze e tenho interesse no item: ${item.titulo_item} - ${formatPrice(item.preco)}`}
                      className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      WhatsApp
                    </WhatsAppSafeButton>
                  )}

                  <button
                    onClick={iniciarChat}
                    disabled={creatingChat}
                    className={`w-full py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-coral/20 transition-all disabled:opacity-50 disabled:cursor-wait`}
                  >
                    {creatingChat ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        Chat do Aplicativo
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Botões Secundários */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => toast.info("Em breve!")}
                  className="py-3 bg-[#13132B]/60 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                  <Heart className="w-5 h-5" />
                  Salvar
                </button>
                <button
                  onClick={handleShare}
                  className="py-3 bg-[#13132B]/60 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação Fixos (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#13132B] border-t border-white/10 p-4 shadow-2xl z-50 safe-area-bottom">
        <div className="max-w-6xl mx-auto flex gap-3">
          {item.whatsapp_visivel && item.whatsapp_verificado ? (
            <>
              <WhatsAppSafeButton
                phone={item.telefone_contato}
                message={`Olá! Tenho interesse no item: ${item.titulo_item}`}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                WhatsApp
              </WhatsAppSafeButton>
              <button
                onClick={iniciarChat}
                className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat
              </button>
            </>
          ) : (
            <button
              onClick={iniciarChat}
              className="w-full py-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat do Vendedor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}