
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BottomBar from "@/components/navigation/BottomBar";
import Sidebar from "@/components/layout/Sidebar";
import SplashScreen from "@/components/shared/SplashScreen";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import OfflineBanner from "@/components/shared/OfflineBanner";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      // Timeout de segurança - máximo 1.5 segundos
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }, 1500);

      try {
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (isMounted) {
          // SE FOR LOCALHOST: Mockar usuário para permitir desenvolvimento visual
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn("⚠️ [DEV] API auth falhou (401). Usando MOCK USER para visualizar o app.");
            setUser({
              id: "mock-user-123",
              nome: "Dev Localhost",
              email: "dev@localhost.com",
              mock: true
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []); // Removido currentPageName para carregar apenas uma vez no mount

  const paginasSemBottomBar = [
    "OnboardingVertical",
    "OnboardingTipoConta",
    "EscolherTipoCadastro",
    "CadastroProfissional",
    "CadastroClinica",
    "CadastroSucesso",
    "AdminAprovacoes",
    "AvaliarClinica",
    "AvaliarProfissional",
    "Onboarding",
    "TermosUso",
    "PoliticaPrivacidade"
  ];

  const mostrarBottomBar = user && !paginasSemBottomBar.includes(currentPageName);

  return (
    <ErrorBoundary>
      <style>{`
        body, html, #root {
          overflow-x: hidden !important;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>

      {!loading && (
        <div className="min-h-screen bg-[#0a0a1a] flex flex-col lg:flex-row">
          <OfflineBanner />

          {/* Desktop Sidebar - same logic as BottomBar */}
          {mostrarBottomBar && <Sidebar />}

          <main className={`flex-1 w-full relative ${mostrarBottomBar ? "pb-20 lg:pb-0" : ""}`}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>

          {mostrarBottomBar && <BottomBar />}
        </div>
      )}

    </ErrorBoundary>
  );
}
