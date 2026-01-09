import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  Newspaper,
  Heart,
  Cpu,
  Building2,
  Tag,
  GraduationCap,
  ShoppingBag,
  MapPin,
  Bell,
  Save
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tiposConteudo = [
  { id: "NOVIDADE", label: "Novidades Doutorizze", icon: Newspaper, defaultOn: true },
  { id: "NOTICIA_SAUDE", label: "Notícias de Saúde", icon: Heart, defaultOn: true },
  { id: "NOTICIA_IA", label: "IA & Tecnologia", icon: Cpu, defaultOn: true },
  { id: "PARCEIRO", label: "Parceiros e Financeiras", icon: Building2, defaultOn: true },
  { id: "PROMOCAO", label: "Promoções", icon: Tag, defaultOn: true },
  { id: "CURSO", label: "Cursos e Pós-graduação", icon: GraduationCap, defaultOn: true },
  { id: "DESTAQUE_MARKETPLACE", label: "Destaques Marketplace", icon: ShoppingBag, defaultOn: true }
];

export default function FeedConfig() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({
    tiposAtivos: tiposConteudo.map(t => t.id),
    apenasEstado: false,
    estadoFiltro: "",
    frequenciaNotificacao: "SEMPRE"
  });
  const [saving, setSaving] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Buscar preferências salvas
        const prefs = await base44.entities.NotificationPreference.filter({ user_id: currentUser.id });
        if (prefs.length > 0 && prefs[0].feed_config) {
          setConfig(prefs[0].feed_config);
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadConfig();
  }, []);

  const toggleTipo = (tipoId) => {
    setConfig(prev => ({
      ...prev,
      tiposAtivos: prev.tiposAtivos.includes(tipoId)
        ? prev.tiposAtivos.filter(t => t !== tipoId)
        : [...prev.tiposAtivos, tipoId]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar nas preferências de notificação
      const prefs = await base44.entities.NotificationPreference.filter({ user_id: user.id });
      if (prefs.length > 0) {
        await base44.entities.NotificationPreference.update(prefs[0].id, { feed_config: config });
      } else {
        await base44.entities.NotificationPreference.create({
          user_id: user.id,
          feed_config: config
        });
      }
      toast.success("Configurações salvas!");
      navigate(createPageUrl("Feed"));
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* Header */}
      <div className="bg-[#13132B]/50 border-b border-white/10 backdrop-blur-xl p-6 relative z-10">
        <button
          onClick={() => navigate(createPageUrl("Feed"))}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Configurar Feed</h1>
            <p className="text-gray-400 text-sm">Personalize o que você quer ver</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-6 container mx-auto max-w-2xl relative z-10 text-white">
        {/* Tipos de Conteúdo */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Tipos de Conteúdo</h2>
          <div className="space-y-4">
            {tiposConteudo.map((tipo) => {
              const Icon = tipo.icon;
              const isActive = config.tiposAtivos.includes(tipo.id);
              return (
                <div
                  key={tipo.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/5 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {tipo.label}
                    </span>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => toggleTipo(tipo.id)}
                    className="data-[state=checked]:bg-brand-primary"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtro Geográfico */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-secondary" />
            Filtro por Região
          </h2>

          <div className="flex items-center justify-between py-2 mb-4">
            <span className="font-medium text-gray-300">Mostrar apenas do meu estado</span>
            <Switch
              checked={config.apenasEstado}
              onCheckedChange={(checked) => setConfig({ ...config, apenasEstado: checked })}
              className="data-[state=checked]:bg-brand-secondary"
            />
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-primary" />
            Notificações
          </h2>

          <Select
            value={config.frequenciaNotificacao}
            onValueChange={(value) => setConfig({ ...config, frequenciaNotificacao: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-[#0a0a1a] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#13132B] border-white/10 text-white">
              <SelectItem value="SEMPRE" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Notificar sempre</SelectItem>
              <SelectItem value="DIARIO" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Resumo diário</SelectItem>
              <SelectItem value="NUNCA" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Não notificar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#13132B] border-t border-white/10 z-20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full max-w-2xl mx-auto py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:shadow-brand-primary/20 transition-all"
        >
          <Save className="w-5 h-5" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}