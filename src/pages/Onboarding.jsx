import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Briefcase,
  Zap,
  ShoppingBag,
  Sparkles
} from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setNeedsLogin(true);
          setIsLoading(false);
        }
      }, 5000);

      try {
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (!isMounted) return;

        setUser(currentUser);

        // Detectar tipo de usuário
        try {
          const [professionals, owners, suppliers, hospitals] = await Promise.all([
            base44.entities.Professional.filter({ user_id: currentUser.id }),
            base44.entities.CompanyOwner.filter({ user_id: currentUser.id }),
            base44.entities.Supplier.filter({ user_id: currentUser.id }),
            base44.entities.Hospital.filter({ user_id: currentUser.id })
          ]);

          let detectedType = null;
          if (professionals.length > 0) detectedType = "PROFISSIONAL";
          else if (owners.length > 0) detectedType = "CLINICA";
          else if (suppliers.length > 0) detectedType = "FORNECEDOR";
          else if (hospitals.length > 0) detectedType = "HOSPITAL";

          setUserType(detectedType);

          if (currentUser?.onboarding_completo && detectedType) {
            // Redirecionar para dashboard apropriado
            if (detectedType === "PROFISSIONAL") navigate(createPageUrl("NewJobs"));
            else if (detectedType === "CLINICA") navigate(createPageUrl("DashboardClinica"));
            else if (detectedType === "FORNECEDOR") navigate(createPageUrl("DashboardFornecedor"));
            else if (detectedType === "HOSPITAL") navigate(createPageUrl("DashboardHospital"));
            else navigate(createPageUrl("Feed"));
            return;
          }
        } catch (entityError) {
          console.log("Erro ao detectar tipo de usuário:", entityError);
        }

        setIsLoading(false);
      } catch (error) {
        clearTimeout(timeoutId);
        setNeedsLogin(true);
        setIsLoading(false);
      }
    };
    loadUser();

    return () => { isMounted = false; };
  }, []);

  const redirectToDashboard = () => {
    if (userType === "PROFISSIONAL") {
      navigate(createPageUrl("NewJobs"));
    } else if (userType === "CLINICA") {
      navigate(createPageUrl("DashboardClinica"));
    } else if (userType === "FORNECEDOR") {
      navigate(createPageUrl("DashboardFornecedor"));
    } else if (userType === "HOSPITAL") {
      navigate(createPageUrl("DashboardHospital"));
    } else {
      navigate(createPageUrl("Feed"));
    }
  };

  const handleComplete = async () => {
    try {
      // Marcar onboarding como completo
      await base44.auth.updateMe({ onboarding_completo: true });
      redirectToDashboard();
    } catch (error) {
      redirectToDashboard();
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      icon: Sparkles,
      title: "Bem-vindo ao Doutorizze!",
      description: "A maior plataforma de vagas para profissionais de saúde",
      color: "from-brand-coral to-brand-orange",
      illustration: "👋"
    },
    {
      icon: Briefcase,
      title: "Encontre vagas perfeitas para você",
      description: "Nosso algoritmo encontra oportunidades que combinam com seu perfil",
      color: "from-blue-500 to-cyan-500",
      illustration: "🎯"
    },
    {
      icon: Zap,
      title: "Ative o New Jobs",
      description: "Receba alertas instantâneos de vagas com match perfeito",
      color: "from-yellow-400 to-orange-500",
      illustration: "⚡"
    },
    {
      icon: ShoppingBag,
      title: "Compre e venda equipamentos",
      description: "Marketplace exclusivo para profissionais de saúde",
      color: "from-green-500 to-emerald-600",
      illustration: "🛒"
    }
  ];

  const currentStepData = steps[currentStep];

  // Loading state handling
  const [isLoading, setIsLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  // Usar método do SDK Base44 para login
  const handleLogin = () => {
    // Redireciona para a página de login do Base44 com callback para o site atual
    const callbackUrl = window.location.origin + "/login";
    base44.auth.redirectToLogin(callbackUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-coral"></div>
      </div>
    );
  }

  // Tela de Login quando usuário não está autenticado
  if (needsLogin) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-8">🏥</div>
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-brand-coral to-brand-orange bg-clip-text text-transparent">
            Doutorizze
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            A maior plataforma de vagas para profissionais de saúde
          </p>
          <button
            onClick={handleLogin}
            className="w-full px-8 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all mb-4"
          >
            Entrar / Criar Conta
          </button>
          <button
            onClick={() => navigate(createPageUrl("Feed"))}
            className="w-full px-8 py-4 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-2xl hover:bg-white/10 transition-all"
          >
            Explorar sem conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden flex flex-col">
      {/* Background Mesh Gradients */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
        className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-brand-coral/10 rounded-full blur-[120px] pointer-events-none opacity-40"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none opacity-30"
      />

      {/* Botão Pular */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
          <button
            onClick={() => {
              localStorage.removeItem("dev_force_logout");
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-500/10 text-red-400 font-bold rounded-full text-xs hover:bg-red-500/20 transition-all border border-red-500/20"
          >
            🔧 Reset Dev Login
          </button>
        )}

        <button
          onClick={handleSkip}
          className="px-6 py-2 text-gray-400 hover:text-white font-bold transition-all hover:bg-white/10 rounded-full"
        >
          Pular
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Ilustração/Emoji Animado */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <div className="text-9xl mb-6 animate-bounce drop-shadow-2xl">
                  {currentStepData.illustration}
                </div>
                <div className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-2xl shadow-brand-coral/20 relative group`}>
                  <div className="absolute inset-0 bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <currentStepData.icon className="w-14 h-14 text-white relative z-10" />
                </div>
              </motion.div>

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400 mb-6"
              >
                {currentStepData.title}
              </motion.h1>

              {/* Descrição */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed"
              >
                {currentStepData.description}
              </motion.p>

              {/* Indicadores de Progresso */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3 mb-10"
              >
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                      ? "w-12 bg-gradient-to-r " + currentStepData.color
                      : "w-2 bg-white/10 hover:bg-white/20"
                      }`}
                  />
                ))}
              </motion.div>

              {/* Botões de Navegação */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4"
              >
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-8 py-4 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
                  >
                    Voltar
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className={`px-10 py-4 bg-gradient-to-r ${currentStepData.color} text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3`}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Começar
                      <Sparkles className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}