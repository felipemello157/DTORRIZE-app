import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { UserRound, Building2, Package, Hospital, GraduationCap, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingTipoConta() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) return;
      }, 5000);

      try {
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (!isMounted) return;

        setUser(currentUser);

        if (!currentUser?.vertical) {
          navigate(createPageUrl("OnboardingVertical"));
          return;
        }

        if (currentUser.tipo_conta) {
          navigate(createPageUrl("Feed"));
        }
      } catch (error) {
        clearTimeout(timeoutId);
      }
    };
    checkUser();

    return () => { isMounted = false; };
  }, []);

  const handleSelectTipoConta = async (tipoConta, routeCadastro) => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ tipo_conta: tipoConta });
      toast.success(`Tipo de conta: ${tipoConta}`);
      navigate(createPageUrl(routeCadastro));
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-coral"></div>
      </div>
    );
  }

  const verticalEmoji = user.vertical === "ODONTOLOGIA" ? "🦷" : "🩺";
  const verticalNome = user.vertical === "ODONTOLOGIA" ? "Odontologia" : "Medicina";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }
    })
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden p-6 pb-20">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-coral/10 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(createPageUrl("OnboardingVertical"))}
          className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar a seleção de vertical
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#13132B] border border-white/10 rounded-full shadow-lg mb-8 backdrop-blur-md">
            <span className="text-3xl">{verticalEmoji}</span>
            <span className="font-bold text-white tracking-wide">{verticalNome}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400 mb-4">
            Como você quer se cadastrar?
          </h1>
          <p className="text-xl text-gray-400">
            Escolha o tipo de conta ideal para você
          </p>
        </div>

        {/* Grid de Opções */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Profissional */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <button
              onClick={() => handleSelectTipoConta("PROFISSIONAL", "CadastroProfissional")}
              disabled={loading}
              className="w-full text-left bg-[#13132B]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 hover:border-brand-coral/50 transition-all duration-300 disabled:opacity-50 group shadow-2xl hover:shadow-brand-coral/10 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-brand-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform relative z-10">
                <UserRound className="w-10 h-10 text-white" strokeWidth={2} />
              </div>

              <h3 className="text-2xl font-black text-white text-center mb-3 relative z-10">
                Profissional
              </h3>

              <p className="text-gray-400 text-center mb-8 h-12 relative z-10">
                {user.vertical === "ODONTOLOGIA" ? "Dentista buscando vagas" : "Médico buscando vagas"}
              </p>

              <div className="py-3 px-6 bg-white/5 text-center text-gray-300 font-bold rounded-xl border border-white/10 group-hover:bg-brand-coral group-hover:text-white group-hover:border-brand-coral transition-all relative z-10">
                Continuar
              </div>
            </button>
          </motion.div>

          {/* Clínica/Consultório */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <button
              onClick={() => handleSelectTipoConta("CLINICA", "CadastroClinica")}
              disabled={loading}
              className="w-full text-left bg-[#13132B]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 hover:border-pink-500/50 transition-all duration-300 disabled:opacity-50 group shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform relative z-10">
                <Building2 className="w-10 h-10 text-white" strokeWidth={2} />
              </div>

              <h3 className="text-2xl font-black text-white text-center mb-3 relative z-10">
                Clínica / Consultório
              </h3>

              <p className="text-gray-400 text-center mb-8 h-12 relative z-10">
                Quero contratar profissionais
              </p>

              <div className="py-3 px-6 bg-white/5 text-center text-gray-300 font-bold rounded-xl border border-white/10 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500 transition-all relative z-10">
                Continuar
              </div>
            </button>
          </motion.div>

          {/* Fornecedor */}
          {/* <motion.div ... Fornecedor e outros seguem o mesmo padrão com cores diferentes ... /> */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <button
              onClick={() => handleSelectTipoConta("FORNECEDOR", "CadastroFornecedor")}
              disabled={loading}
              className="w-full text-left bg-[#13132B]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 hover:border-purple-500/50 transition-all duration-300 disabled:opacity-50 group shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform relative z-10">
                <Package className="w-10 h-10 text-white" strokeWidth={2} />
              </div>

              <h3 className="text-2xl font-black text-white text-center mb-3 relative z-10">
                Fornecedor / Revenda
              </h3>

              <p className="text-gray-400 text-center mb-8 h-12 relative z-10">
                Anunciar produtos e equipamentos
              </p>

              <div className="py-3 px-6 bg-white/5 text-center text-gray-300 font-bold rounded-xl border border-white/10 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-all relative z-10">
                Continuar
              </div>
            </button>
          </motion.div>

          {/* Hospital */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <button
              onClick={() => handleSelectTipoConta("HOSPITAL", "CadastroHospital")}
              disabled={loading}
              className="w-full text-left bg-[#13132B]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 hover:border-blue-500/50 transition-all duration-300 disabled:opacity-50 group shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform relative z-10">
                <Hospital className="w-10 h-10 text-white" strokeWidth={2} />
              </div>

              <h3 className="text-2xl font-black text-white text-center mb-3 relative z-10">
                Hospital
              </h3>

              <p className="text-gray-400 text-center mb-8 h-12 relative z-10">
                Contratar médicos e equipe
              </p>

              <div className="py-3 px-6 bg-white/5 text-center text-gray-300 font-bold rounded-xl border border-white/10 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all relative z-10">
                Continuar
              </div>
            </button>
          </motion.div>

          {/* Instituição */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <button
              onClick={() => handleSelectTipoConta("INSTITUICAO", "CadastroInstituicao")}
              disabled={loading}
              className="w-full text-left bg-[#13132B]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 hover:border-indigo-500/50 transition-all duration-300 disabled:opacity-50 group shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform relative z-10">
                <GraduationCap className="w-10 h-10 text-white" strokeWidth={2} />
              </div>

              <h3 className="text-2xl font-black text-white text-center mb-3 relative z-10">
                Instituição de Ensino
              </h3>

              <p className="text-gray-400 text-center mb-8 h-12 relative z-10">
                Oferecer cursos e pós
              </p>

              <div className="py-3 px-6 bg-white/5 text-center text-gray-300 font-bold rounded-xl border border-white/10 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all relative z-10">
                Continuar
              </div>
            </button>
          </motion.div>

        </div>

      </div>
    </div>
  );
}