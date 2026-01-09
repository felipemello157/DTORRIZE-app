import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Package,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Star,
  CheckCircle,
  Clock,
  MessageCircle,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

const tiposLabels = {
  EQUIPAMENTOS: "Equipamentos",
  MATERIAIS: "Materiais",
  SOFTWARE: "Software",
  MOVEIS: "Móveis",
  OUTROS: "Outros"
};

export default function DetalheFornecedor() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const fornId = urlParams.get("id");

  const { data: fornecedor, isLoading } = useQuery({
    queryKey: ["fornecedor", fornId],
    queryFn: async () => {
      const results = await base44.entities.Supplier.filter({ id: fornId });
      return results[0];
    },
    enabled: !!fornId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-white/10 border-t-brand-orange rounded-full" />
      </div>
    );
  }

  if (!fornecedor) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="bg-[#13132B] rounded-3xl p-8 text-center border border-white/10 max-w-md w-full">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Fornecedor não encontrado</h2>
          <button
            onClick={() => navigate(createPageUrl("Fornecedores"))}
            className="mt-4 px-6 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange/80 transition-all w-full"
          >
            Ver fornecedores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white overflow-hidden relative">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[120px] pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative pt-6 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
        </div>
      </div>

      {/* Card principal */}
      <div className="px-4 -mt-10 max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-8"
        >
          {/* Logo e nome */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-3xl bg-[#0a0a1a] flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
              {fornecedor.logo_url ? (
                <img src={fornecedor.logo_url} alt={fornecedor.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-10 h-10 text-brand-orange" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white truncate">{fornecedor.nome_fantasia}</h1>
                {fornecedor.status_cadastro === "APROVADO" && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-400 text-sm mb-3">{fornecedor.razao_social}</p>
              <div className="flex flex-wrap gap-2">
                {fornecedor.tipo_produtos?.slice(0, 3).map((tipo, i) => (
                  <span key={i} className="px-3 py-1 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {tiposLabels[tipo]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Avaliação */}
          {fornecedor.media_avaliacoes > 0 && (
            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl mb-8 border border-white/5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= fornecedor.media_avaliacoes ? "fill-brand-orange text-brand-orange" : "text-gray-700"}`} />
                ))}
              </div>
              <span className="font-bold text-white text-lg">{fornecedor.media_avaliacoes.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({fornecedor.total_avaliacoes} avaliações)</span>
            </div>
          )}

          {/* Fotos do Local */}
          {fornecedor.fotos_local?.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-white mb-4 text-lg">Fotos do Estabelecimento</h3>
              <div className="grid grid-cols-2 gap-3">
                {fornecedor.fotos_local.slice(0, 4).map((foto, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-[#0a0a1a] border border-white/10 shadow-lg">
                    <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="space-y-4 mb-2">
            <h3 className="font-bold text-white text-lg mb-2">Informações de Contato</h3>

            <div className="flex items-start gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-orange/30 transition-colors">
              <MapPin className="w-5 h-5 text-brand-orange mt-1" />
              <div>
                <p className="text-sm text-gray-400 mb-1">Endereço</p>
                <p className="text-white font-medium">{fornecedor.endereco}, {fornecedor.numero}</p>
                <p className="text-gray-400 text-sm">{fornecedor.bairro}, {fornecedor.cidade} - {fornecedor.uf}</p>
              </div>
            </div>

            {fornecedor.google_maps_link && (
              <a
                href={fornecedor.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 bg-[#0a0a1a] border border-white/10 rounded-2xl text-blue-400 font-bold hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
              >
                <MapPin className="w-5 h-5" />
                Ver no Google Maps
                <ExternalLink className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
              </a>
            )}

            {fornecedor.horarios_atendimento && (
              <div className="bg-[#0a0a1a] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-brand-orange" />
                  <h4 className="font-bold text-white">Horários de Atendimento</h4>
                </div>
                <div className="space-y-2 text-sm">
                  {Object.entries(fornecedor.horarios_atendimento).map(([dia, horario]) => (
                    horario && (
                      <div key={dia} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                        <span className="text-gray-400 capitalize">{dia}</span>
                        <span className="font-semibold text-white">{horario}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {fornecedor.email && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-orange/30 transition-colors group">
                <Mail className="w-5 h-5 text-brand-orange group-hover:text-white transition-colors" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <a href={`mailto:${fornecedor.email}`} className="text-white font-medium hover:text-brand-orange transition-colors underline-offset-4 hover:underline">
                    {fornecedor.email}
                  </a>
                </div>
              </div>
            )}

            {fornecedor.site && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-orange/30 transition-colors group">
                <Globe className="w-5 h-5 text-brand-orange group-hover:text-white transition-colors" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Website</p>
                  <a href={fornecedor.site.startsWith("http") ? fornecedor.site : `https://${fornecedor.site}`} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-brand-orange transition-colors underline-offset-4 hover:underline flex items-center gap-1">
                    {fornecedor.site}
                  </a>
                </div>
              </div>
            )}

            {fornecedor.instagram && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-orange/30 transition-colors group">
                <Instagram className="w-5 h-5 text-brand-orange group-hover:text-white transition-colors" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Instagram</p>
                  <a href={`https://instagram.com/${fornecedor.instagram}`} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-brand-orange transition-colors underline-offset-4 hover:underline">
                    @{fornecedor.instagram}
                  </a>
                </div>
              </div>
            )}

            {fornecedor.catalogo_produtos_url && (
              <a
                href={fornecedor.catalogo_produtos_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-brand-orange/10 border border-brand-orange/20 rounded-2xl text-brand-orange hover:bg-brand-orange/20 transition-all font-bold group"
              >
                <Package className="w-5 h-5" />
                Ver Catálogo de Produtos
                <ExternalLink className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#13132B]/90 backdrop-blur-xl border-t border-white/10 p-4 shadow-2xl z-20">
        <div className="max-w-2xl mx-auto flex gap-3">
          {fornecedor.telefone_fixo && (
            <a
              href={`tel:${fornecedor.telefone_fixo}`}
              className="flex-1 py-4 bg-[#0a0a1a] border border-white/10 text-gray-300 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all"
            >
              <Phone className="w-5 h-5" /> Ligar
            </a>
          )}
          <WhatsAppSafeButton
            phone={fornecedor.whatsapp}
            message={`Olá! Vi o perfil de ${fornecedor.nome_fantasia} no Doutorizze e gostaria de mais informações.`}
            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all"
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp
          </WhatsAppSafeButton>
        </div>
      </div>
    </div>
  );
}