import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { MessageCircle, Users, Zap, TrendingUp, ChevronRight, ExternalLink } from "lucide-react";

export default function ComunidadeTelegram() {
  const [user, setUser] = useState(null);
  const [userArea, setUserArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserArea = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Detectar área do usuário
        let area = currentUser?.vertical;

        if (!area && currentUser?.role === "admin") {
          area = "AMBOS";
        }

        if (!area) {
          // Tentar detectar pela entidade do usuário
          const [prof, clinic, hospital] = await Promise.all([
            base44.entities.Professional.filter({ user_id: currentUser.id }).catch(() => []),
            base44.entities.CompanyUnit.filter({}).catch(() => []),
            base44.entities.Hospital.filter({ user_id: currentUser.id }).catch(() => [])
          ]);

          if (prof[0]) area = prof[0].tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA";
          else if (clinic[0]) area = clinic[0].tipo_mundo;
          else if (hospital[0]) area = "MEDICINA";
        }

        setUserArea(area || "ODONTOLOGIA");
      } catch (error) {
        setUserArea("ODONTOLOGIA");
      }
      setLoading(false);
    };

    loadUserArea();
  }, []);

  const grupoTelegram = {
    ODONTOLOGIA: {
      id: import.meta.env.VITE_TELEGRAM_GRUPO_ODONTO_ID || "-1002359866821",
      nome: "Comunidade Doutorizze - Odontologia 🦷",
      descricao: "Grupo exclusivo para dentistas, clínicas odontológicas e profissionais da área.",
      icone: "🦷",
      cor: "from-brand-orange to-red-500",
      corTexto: "text-brand-orange"
    },
    MEDICINA: {
      id: import.meta.env.VITE_TELEGRAM_GRUPO_MEDICINA_ID || "-1002293506112",
      nome: "Comunidade Doutorizze - Medicina 🩺",
      descricao: "Grupo exclusivo para médicos, hospitais, clínicas médicas e profissionais da área.",
      icone: "🩺",
      cor: "from-brand-primary to-brand-secondary",
      corTexto: "text-brand-primary"
    },
    AMBOS: {
      id: import.meta.env.VITE_TELEGRAM_GRUPO_ODONTO_ID || "-1002359866821",
      nome: "Comunidade Doutorizze 🏥",
      descricao: "Comunidades exclusivas para profissionais da saúde.",
      icone: "🏥",
      cor: "from-purple-500 to-pink-500",
      corTexto: "text-purple-400"
    }
  };

  const grupo = grupoTelegram[userArea] || grupoTelegram.ODONTOLOGIA;
  const linkGrupo = `https://t.me/c/${grupo.id.replace('-100', '')}/1`;

  const beneficios = [
    { icone: "💼", titulo: "Vagas Exclusivas", desc: "Oportunidades compartilhadas primeiro no grupo" },
    { icone: "🤝", titulo: "Networking", desc: "Conecte-se com profissionais da sua área" },
    { icone: "💡", titulo: "Dicas & Insights", desc: "Aprenda com experiências de outros profissionais" },
    { icone: "🎯", titulo: "Avisos em Tempo Real", desc: "Seja notificado instantaneamente sobre novidades" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando comunidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Comunidade Telegram
          </h1>
          <p className="text-lg text-gray-400">
            Faça parte da maior comunidade de profissionais da saúde
          </p>
        </motion.div>

        {/* Card Principal do Grupo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          <div className={`bg-gradient-to-r ${grupo.cor} p-8 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 blur-[50px] pointer-events-none mix-blend-overlay"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 opacity-90 drop-shadow-md">{grupo.icone}</div>
              <h2 className="text-3xl font-black mb-2">{grupo.nome}</h2>
              <p className="text-white/90 text-lg font-medium">{grupo.descricao}</p>
            </div>
          </div>

          <div className="p-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all"></div>
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2 relative z-10" />
                <p className="text-2xl font-black text-white relative z-10">500+</p>
                <p className="text-sm text-gray-400 relative z-10">Membros Ativos</p>
              </div>
              <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-2xl relative overflow-hidden group hover:border-green-500/40 transition-all">
                <div className="absolute inset-0 bg-green-500/5 blur-xl group-hover:bg-green-500/10 transition-all"></div>
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2 relative z-10" />
                <p className="text-2xl font-black text-white relative z-10">24/7</p>
                <p className="text-sm text-gray-400 relative z-10">Sempre Ativo</p>
              </div>
            </div>

            {/* Benefícios */}
            <h3 className="text-xl font-black text-white mb-4">Por que entrar?</h3>
            <div className="space-y-3 mb-8">
              {beneficios.map((beneficio, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                  <div className="text-3xl group-hover:scale-110 transition-transform">{beneficio.icone}</div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-brand-primary transition-colors">{beneficio.titulo}</h4>
                    <p className="text-sm text-gray-400">{beneficio.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Botão Principal */}
            <a
              href={linkGrupo}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-5 px-6 bg-gradient-to-r ${grupo.cor} text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-center gap-3 relative z-10">
                <MessageCircle className="w-6 h-6" />
                <span>Entrar no Grupo do Telegram</span>
                <ExternalLink className="w-5 h-5 opacity-70" />
              </div>
            </a>

            <p className="text-center text-xs text-gray-500 mt-4">
              Ao clicar você será redirecionado para o Telegram
            </p>
          </div>
        </motion.div>

        {/* Admin: Ambos os Grupos */}
        {userArea === "AMBOS" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-4"
          >
            <div className="bg-[#13132B] border border-white/10 rounded-2xl shadow-lg p-6 hover:border-brand-primary/30 transition-all">
              <div className="text-4xl mb-3">🦷</div>
              <h3 className="text-lg font-bold text-white mb-2">Grupo Odontologia</h3>
              <a
                href={`https://t.me/c/${grupoTelegram.ODONTOLOGIA.id.replace('-100', '')}/1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange/80 font-bold text-sm"
              >
                Acessar <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-[#13132B] border border-white/10 rounded-2xl shadow-lg p-6 hover:border-brand-primary/30 transition-all">
              <div className="text-4xl mb-3">🩺</div>
              <h3 className="text-lg font-bold text-white mb-2">Grupo Medicina</h3>
              <a
                href={`https://t.me/c/${grupoTelegram.MEDICINA.id.replace('-100', '')}/1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 font-bold text-sm"
              >
                Acessar <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}

        {/* Info Extra */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-warning/10 border border-brand-warning/30 rounded-2xl p-6 text-center mt-6"
        >
          <Zap className="w-8 h-8 text-brand-warning mx-auto mb-3" />
          <p className="text-brand-warning font-semibold">
            <strong>Dica:</strong> Ative as notificações do grupo para não perder nenhuma oportunidade!
          </p>
        </motion.div>
      </div>
    </div>
  );
}