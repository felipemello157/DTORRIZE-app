import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  FlaskConical,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  CheckCircle,
  Package,
  User,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

const tiposLabels = {
  PROTESE_DENTARIA: "Prótese Dentária",
  ANALISES_CLINICAS: "Análises Clínicas",
  IMAGEM: "Diagnóstico por Imagem",
  PATOLOGIA: "Patologia",
  OUTRO: "Outro"
};

export default function DetalheLaboratorio() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const labId = urlParams.get("id");

  const { data: laboratorio, isLoading } = useQuery({
    queryKey: ["laboratorio", labId],
    queryFn: async () => {
      const results = await base44.entities.Laboratorio.filter({ id: labId });
      return results[0];
    },
    enabled: !!labId
  });

  const handleWhatsApp = () => {
    if (!laboratorio?.whatsapp) return;
    const numero = laboratorio.whatsapp.replace(/\D/g, "");
    const msg = `Olá! Vi o perfil do ${laboratorio.nome_fantasia} no Doutorizze e gostaria de mais informações.`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-white/10 border-t-brand-primary rounded-full" />
      </div>
    );
  }

  if (!laboratorio) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="bg-[#13132B] rounded-3xl p-8 text-center border border-white/10 max-w-md w-full">
          <FlaskConical className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Laboratório não encontrado</h2>
          <button
            onClick={() => navigate(createPageUrl("Laboratorios"))}
            className="mt-4 px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/80 transition-all w-full"
          >
            Ver laboratórios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white overflow-hidden relative">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative pt-6 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/10 to-transparent pointer-events-none" />

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
              {laboratorio.logo_url ? (
                <img src={laboratorio.logo_url} alt={laboratorio.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                <FlaskConical className="w-10 h-10 text-brand-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white truncate">{laboratorio.nome_fantasia}</h1>
                {laboratorio.status_cadastro === "APROVADO" && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-400 text-sm mb-3">{laboratorio.razao_social}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {tiposLabels[laboratorio.tipo_laboratorio]}
                </span>
              </div>
            </div>
          </div>

          {/* Avaliação */}
          {laboratorio.media_avaliacoes > 0 && (
            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl mb-8 border border-white/5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= laboratorio.media_avaliacoes ? "fill-brand-orange text-brand-orange" : "text-gray-700"}`} />
                ))}
              </div>
              <span className="font-bold text-white text-lg">{laboratorio.media_avaliacoes.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({laboratorio.total_avaliacoes} avaliações)</span>
            </div>
          )}

          {/* Descrição */}
          {laboratorio.descricao && (
            <div className="mb-8">
              <h3 className="font-bold text-white mb-3 text-lg">Sobre</h3>
              <p className="text-gray-400 leading-relaxed">{laboratorio.descricao}</p>
            </div>
          )}

          {/* Serviços */}
          {laboratorio.servicos_oferecidos?.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-brand-primary" /> Serviços Oferecidos
              </h3>
              <div className="flex flex-wrap gap-2">
                {laboratorio.servicos_oferecidos.map((servico, i) => (
                  <span key={i} className="px-4 py-2 bg-[#0a0a1a] border border-white/10 text-gray-300 rounded-xl text-sm hover:border-brand-primary/30 transition-colors cursor-default">
                    {servico}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="space-y-4 mb-2">
            <h3 className="font-bold text-white text-lg mb-2">Informações de Contato</h3>

            <div className="flex items-start gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors">
              <MapPin className="w-5 h-5 text-brand-primary mt-1" />
              <div>
                <p className="text-sm text-gray-400 mb-1">Endereço</p>
                <p className="text-white font-medium">{laboratorio.endereco}, {laboratorio.numero}</p>
                <p className="text-gray-400 text-sm">{laboratorio.bairro}, {laboratorio.cidade} - {laboratorio.uf}</p>
              </div>
            </div>

            {laboratorio.horario_funcionamento && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors">
                <Clock className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Horário de Funcionamento</p>
                  <span className="text-white font-medium">{laboratorio.horario_funcionamento}</span>
                </div>
              </div>
            )}

            {laboratorio.prazo_entrega_medio && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors">
                <Package className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Prazo de Entrega</p>
                  <span className="text-white font-medium">{laboratorio.prazo_entrega_medio}</span>
                </div>
              </div>
            )}

            {laboratorio.nome_responsavel && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors">
                <User className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Responsável Técnico</p>
                  <span className="text-white font-medium">{laboratorio.nome_responsavel} {laboratorio.registro_responsavel && `(${laboratorio.registro_responsavel})`}</span>
                </div>
              </div>
            )}

            {laboratorio.email && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
                <Mail className="w-5 h-5 text-brand-primary group-hover:text-white transition-colors" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <a href={`mailto:${laboratorio.email}`} className="text-white font-medium hover:text-brand-primary transition-colors underline-offset-4 hover:underline">
                    {laboratorio.email}
                  </a>
                </div>
              </div>
            )}

            {laboratorio.site && (
              <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
                <Globe className="w-5 h-5 text-brand-primary group-hover:text-white transition-colors" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Website</p>
                  <a href={laboratorio.site.startsWith("http") ? laboratorio.site : `https://${laboratorio.site}`} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-brand-primary transition-colors underline-offset-4 hover:underline">
                    {laboratorio.site}
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#13132B]/90 backdrop-blur-xl border-t border-white/10 p-4 shadow-2xl z-20">
        <div className="max-w-2xl mx-auto flex gap-3">
          {laboratorio.telefone && (
            <a
              href={`tel:${laboratorio.telefone}`}
              className="flex-1 py-4 bg-[#0a0a1a] border border-white/10 text-gray-300 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all"
            >
              <Phone className="w-5 h-5" /> Ligar
            </a>
          )}
          <WhatsAppSafeButton
            phone={laboratorio.whatsapp}
            message={`Olá! Vi o perfil do ${laboratorio.nome_fantasia} no Doutorizze e gostaria de mais informações.`}
            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all"
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp
          </WhatsAppSafeButton>
        </div>
      </div>
    </div>
  );
}