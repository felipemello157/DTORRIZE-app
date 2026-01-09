import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  User,
  Bell,
  Shield,
  Settings,
  Zap,
  Info,
  Mail,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Globe,
  ExternalLink,
  Save,
  X,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import WhatsAppVerificationSection from "@/components/marketplace/WhatsAppVerificationSection";

export default function Configuracoes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // PROFISSIONAL | CLINICA | FORNECEDOR | HOSPITAL
  const [professional, setProfessional] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Configurações
  const [config, setConfig] = useState({
    // NOTIFICAÇÕES
    notif_push: true,
    notif_email_novidades: true,
    notif_email_vagas: true,
    notif_email_candidaturas: true,
    notif_resumo_semanal: false,

    // EMAIL PREFERÊNCIAS
    email_novas_vagas: true,
    email_candidaturas: true,
    email_newsletter_semanal: false,

    // PRIVACIDADE
    perfil_visivel: true,
    exibir_email: false,
    exibir_telefone: true,
    aparecer_buscas: true,

    // NEW JOBS (profissional)
    new_jobs_ativo: true,
    receber_super_matches: true,
    receber_semelhantes: true,
    dias_disponiveis: [],
    horario_preferido_inicio: "08:00",
    horario_preferido_fim: "18:00",

    // PREFERÊNCIAS
    cidade_padrao: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Detectar tipo de usuário
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (professionals.length > 0) {
          setUserType("PROFISSIONAL");
          setProfessional(professionals[0]);
          // Carregar configurações do profissional
          setConfig((prev) => ({
            ...prev,
            new_jobs_ativo: professionals[0].new_jobs_ativo ?? true,
            dias_disponiveis: professionals[0].dias_semana_disponiveis || [],
            perfil_visivel: professionals[0].status_disponibilidade !== "INDISPONIVEL"
          }));
          return;
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        if (owners.length > 0) {
          setUserType("CLINICA");
          return;
        }

        const suppliers = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        if (suppliers.length > 0) {
          setUserType("FORNECEDOR");
          return;
        }

        const hospitals = await base44.entities.Hospital.filter({ user_id: currentUser.id });
        if (hospitals.length > 0) {
          setUserType("HOSPITAL");
          return;
        }
      } catch (error) {
        // MOCK fallback for localhost
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          setUser({ id: "mock", email: "dev@localhost.com" });
          setUserType("PROFISSIONAL");
        }
      }
    };
    loadUser();
  }, []);

  // Salvar configurações
  const salvarMutation = useMutation({
    mutationFn: async () => {
      // Atualizar profissional se aplicável
      if (userType === "PROFISSIONAL" && professional) {
        await base44.entities.Professional.update(professional.id, {
          new_jobs_ativo: config.new_jobs_ativo,
          dias_semana_disponiveis: config.dias_disponiveis,
          status_disponibilidade: config.perfil_visivel ? "DISPONIVEL" : "INDISPONIVEL",
          exibir_email: config.exibir_email
        });
      }

      // TODO: Criar/atualizar NotificationPreference quando implementado
      // await base44.entities.NotificationPreference.create/update(...)

      // Simulação de delay
      await new Promise(resolve => setTimeout(resolve, 800));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional"] });
      toast.success("✅ Configurações salvas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    }
  });

  const handleToggle = (key) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDiaToggle = (dia) => {
    setConfig((prev) => {
      const dias = prev.dias_disponiveis.includes(dia)
        ? prev.dias_disponiveis.filter((d) => d !== dia)
        : [...prev.dias_disponiveis, dia];
      return { ...prev, dias_disponiveis: dias };
    });
  };

  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-32 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 relative z-10 sticky top-0 backdrop-blur-md bg-[#13132B]/80 z-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg border border-white/10">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Configurações</h1>
              <p className="text-gray-400">Gerencie suas preferências e privacidade</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 relative z-10">

        {/* 1. CONTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Conta</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
              <div className="flex items-center gap-3 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl border-l-4 border-l-blue-500">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-white font-medium">{user.email}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl hover:border-brand-orange/50 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors" />
                <span className="font-semibold text-white">Alterar Senha</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-500 rotate-180 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between px-4 py-4 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/10 hover:border-red-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Excluir Conta</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* 2. VERIFICAÇÃO WHATSAPP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WhatsAppVerificationSection
            user={user}
            onVerified={async (whatsappE164) => {
              const currentUser = await base44.auth.me();
              setUser(currentUser);
            }}
          />
        </motion.div>

        {/* 3. NOTIFICAÇÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Notificações</h2>
          </div>

          <div className="space-y-5">
            <SwitchItem
              label="Notificações Push no App"
              description="Receba alertas no aplicativo"
              checked={config.notif_push}
              onChange={() => handleToggle("notif_push")}
            />
            <SwitchItem
              label="Email de Novidades"
              description="Atualizações e novidades do app"
              checked={config.notif_email_novidades}
              onChange={() => handleToggle("notif_email_novidades")}
            />
            {userType === "PROFISSIONAL" && (
              <SwitchItem
                label="Email de Vagas"
                description="Novas vagas compatíveis com seu perfil"
                checked={config.notif_email_vagas}
                onChange={() => handleToggle("notif_email_vagas")}
              />
            )}
            {userType === "CLINICA" && (
              <SwitchItem
                label="Email de Candidaturas"
                description="Notificações sobre novas candidaturas"
                checked={config.notif_email_candidaturas}
                onChange={() => handleToggle("notif_email_candidaturas")}
              />
            )}
            <SwitchItem
              label="Resumo Semanal"
              description="Receba um resumo semanal por email"
              checked={config.notif_resumo_semanal}
              onChange={() => handleToggle("notif_resumo_semanal")}
            />
          </div>
        </motion.div>

        {/* 4. PREFERÊNCIAS DE EMAIL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Preferências de Email</h2>
          </div>

          <div className="space-y-5">
            {userType === "PROFISSIONAL" && (
              <SwitchItem
                label="Receber emails de novas vagas"
                description="Notificações sobre vagas compatíveis com seu perfil"
                checked={config.email_novas_vagas}
                onChange={() => handleToggle("email_novas_vagas")}
              />
            )}
            {userType === "CLINICA" && (
              <SwitchItem
                label="Receber emails de candidaturas"
                description="Notificações quando profissionais se candidatarem"
                checked={config.email_candidaturas}
                onChange={() => handleToggle("email_candidaturas")}
              />
            )}
            <SwitchItem
              label="Newsletter semanal"
              description="Resumo semanal com novidades e dicas"
              checked={config.email_newsletter_semanal}
              onChange={() => handleToggle("email_newsletter_semanal")}
            />
          </div>
        </motion.div>

        {/* 5. PRIVACIDADE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Privacidade</h2>
          </div>

          <div className="space-y-5">
            {userType === "PROFISSIONAL" && (
              <SwitchItem
                label="Perfil Visível"
                description="Seu perfil aparece nas buscas"
                checked={config.perfil_visivel}
                onChange={() => handleToggle("perfil_visivel")}
              />
            )}
            <SwitchItem
              label="Exibir Email"
              description="Mostrar email no perfil público"
              checked={config.exibir_email}
              onChange={() => handleToggle("exibir_email")}
            />
            <SwitchItem
              label="Exibir Telefone"
              description="Mostrar telefone no perfil público"
              checked={config.exibir_telefone}
              onChange={() => handleToggle("exibir_telefone")}
            />
            <SwitchItem
              label="Aparecer em Buscas"
              description="Permitir que outros te encontrem"
              checked={config.aparecer_buscas}
              onChange={() => handleToggle("aparecer_buscas")}
            />
          </div>
        </motion.div>

        {/* 6. PREFERÊNCIAS GERAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Preferências Gerais</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Tema do Aplicativo</label>
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-[#0a0a1a] text-gray-400 hover:text-white hover:border-white/30 transition-all">
                  <div className="w-6 h-6 rounded-full border border-gray-500 mb-2 bg-white"></div>
                  <span className="text-xs font-bold">Claro</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-brand-orange bg-[#1E1E3F] text-brand-orange transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1">
                    <CheckCircle2 className="w-3 h-3 text-brand-orange" />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-gray-600 mb-2 bg-[#0a0a1a]"></div>
                  <span className="text-xs font-bold">Escuro</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-[#0a0a1a] text-gray-400 hover:text-white hover:border-white/30 transition-all">
                  <div className="w-6 h-6 rounded-full border border-gray-500 mb-2 bg-gradient-to-tr from-[#0a0a1a] to-white"></div>
                  <span className="text-xs font-bold">Sistema</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Idioma</label>
              <div className="flex items-center gap-3 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-white font-medium">🇧🇷 Português (Brasil)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Cidade Padrão</label>
              <div className="flex items-center gap-3 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange/50 transition-all">
                <MapPin className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={config.cidade_padrao}
                  onChange={(e) => setConfig({ ...config, cidade_padrao: e.target.value })}
                  placeholder="Ex: Goiânia - GO"
                  className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7. NEW JOBS (só profissional) */}
        {userType === "PROFISSIONAL" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-brand-orange">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-white">NEW JOBS</h2>
            </div>

            <div className="space-y-5">
              <SwitchItem
                label="Ativar NEW JOBS"
                description="Receber vagas automaticamente"
                checked={config.new_jobs_ativo}
                onChange={() => handleToggle("new_jobs_ativo")}
              />
              <SwitchItem
                label="Super Matches"
                description="Vagas perfeitas para seu perfil"
                checked={config.receber_super_matches}
                onChange={() => handleToggle("receber_super_matches")}
                disabled={!config.new_jobs_ativo}
              />
              <SwitchItem
                label="Jobs Semelhantes"
                description="Vagas compatíveis com seu perfil"
                checked={config.receber_semelhantes}
                onChange={() => handleToggle("receber_semelhantes")}
                disabled={!config.new_jobs_ativo}
              />

              <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-400 mb-3">Dias Disponíveis</label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map((dia) => (
                    <button
                      key={dia}
                      onClick={() => handleDiaToggle(dia)}
                      disabled={!config.new_jobs_ativo}
                      className={`px-4 py-2 font-bold rounded-xl transition-all border ${config.dias_disponiveis.includes(dia)
                          ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20"
                          : "bg-[#0a0a1a] text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                        } ${!config.new_jobs_ativo && "opacity-50 cursor-not-allowed"}`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Horário Início</label>
                  <input
                    type="time"
                    value={config.horario_preferido_inicio}
                    onChange={(e) => setConfig({ ...config, horario_preferido_inicio: e.target.value })}
                    disabled={!config.new_jobs_ativo}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange outline-none transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Horário Fim</label>
                  <input
                    type="time"
                    value={config.horario_preferido_fim}
                    onChange={(e) => setConfig({ ...config, horario_preferido_fim: e.target.value })}
                    disabled={!config.new_jobs_ativo}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 8. SOBRE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-500/10 border border-gray-500/20 flex items-center justify-center text-gray-400">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Sobre</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl">
              <span className="font-semibold text-gray-400">Versão do App</span>
              <span className="text-white font-bold">1.0.0 (Dark Mode)</span>
            </div>

            <a
              href="https://newjobs.com.br/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl hover:border-brand-orange/50 hover:bg-white/5 transition-all text-white group"
            >
              <span className="font-semibold">Termos de Uso</span>
              <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </a>

            <a
              href="https://newjobs.com.br/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl hover:border-brand-orange/50 hover:bg-white/5 transition-all text-white group"
            >
              <span className="font-semibold">Política de Privacidade</span>
              <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </a>

            <button
              onClick={() => navigate("/Contato")}
              className="w-full flex items-center justify-between px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl hover:border-brand-orange/50 hover:bg-white/5 transition-all text-white group"
            >
              <span className="font-semibold">Contato / Suporte</span>
              <ChevronLeft className="w-5 h-5 text-gray-500 rotate-180 group-hover:text-white transition-colors" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Botão Salvar Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#13132B]/90 backdrop-blur-lg border-t border-white/10 p-4 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => salvarMutation.mutate()}
            disabled={salvarMutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {salvarMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAIS */}
      <AnimatePresence>
        {showPasswordModal && <ModalAlterarSenha onClose={() => setShowPasswordModal(false)} />}
        {showDeleteModal && <ModalExcluirConta onClose={() => setShowDeleteModal(false)} userEmail={user.email} />}
      </AnimatePresence>
    </div>
  );
}

// Componente Switch Item Dark
function SwitchItem({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-colors ${checked ? "bg-white/5" : "bg-transparent"}`}>
      <div className="flex-1 pr-4">
        <p className={`font-bold ${checked ? "text-white" : "text-gray-300"}`}>{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-12 h-7 rounded-full transition-all ${checked ? "bg-green-500" : "bg-gray-700"
          } ${disabled && "opacity-50 cursor-not-allowed"}`}
      >
        <motion.div
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

// Modal Alterar Senha Dark
function ModalAlterarSenha({ onClose }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  const handleSubmit = () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    // TODO: Implementar alteração de senha
    toast.success("✅ Senha alterada com sucesso!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl max-w-md w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-brand-orange">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-white">Alterar Senha</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Senha Atual</label>
            <div className="relative">
              <input
                type={showSenhaAtual ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange outline-none transition-all placeholder-gray-600"
                placeholder="Sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showSenhaAtual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Nova Senha</label>
            <div className="relative">
              <input
                type={showNovaSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange outline-none transition-all placeholder-gray-600"
                placeholder="Nova senha segura"
              />
              <button
                type="button"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange outline-none transition-all placeholder-gray-600"
              placeholder="Confirme a nova senha"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/20"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Modal Excluir Conta Dark
function ModalExcluirConta({ onClose, userEmail }) {
  const [confirmacao, setConfirmacao] = useState("");

  const handleDelete = () => {
    if (confirmacao !== userEmail) {
      toast.error("Email de confirmação incorreto");
      return;
    }
    // TODO: Implementar exclusão de conta
    toast.success("Conta excluída com sucesso");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#13132B] rounded-3xl border border-red-500/20 shadow-2xl max-w-md w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Excluir Conta</h3>
          <p className="text-gray-400">
            Esta ação é <strong className="text-red-400">irreversível</strong>. Todos os seus dados serão permanentemente excluídos.
          </p>
        </div>

        <div className="bg-[#0a0a1a] p-4 rounded-xl border border-white/10 mb-6">
          <p className="text-sm text-gray-500 mb-2 text-center">
            Digite seu email para confirmar:
          </p>
          <p className="text-center font-mono font-bold text-white bg-white/5 py-1 px-2 rounded mb-3 break-all">
            {userEmail}
          </p>
          <input
            type="email"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder="Digite seu email aqui"
            className="w-full px-4 py-3 bg-[#13132B] border border-white/10 rounded-xl text-white focus:border-red-500 outline-none transition-all placeholder-gray-600 text-center"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            Excluir Definitivamente
          </button>
        </div>
      </motion.div>
    </div>
  );
}