import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useUserArea } from "@/components/hooks/useUserArea";
import {
  ChevronLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  CheckCircle2,
  Lock
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import CityAutocomplete from "@/components/forms/CityAutocomplete";

export default function CriarVaga() {
  const navigate = useNavigate();
  const { userArea } = useUserArea();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    // ETAPA 1
    titulo: "",
    descricao: "",
    tipo_vaga: "",
    tipo_profissional: userArea === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO",

    // ETAPA 2
    especialidades_aceitas: [],
    exige_experiencia: false,
    tempo_experiencia_minimo: "",
    falar_com: "",

    // ETAPA 3
    selecao_dias: "",
    dias_semana: [],
    horario_inicio: "",
    horario_fim: "",
    cidade: "",
    uf: "",
    instagram_clinica: "",

    // ETAPA 4
    valor_proposto: "",
    tipo_remuneracao: "",
    aceita_termos: false
  });

  const totalEtapas = 4;
  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  // Hook para buscar cidades após formData ser declarado
  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  // Carregar unidade da clínica
  useEffect(() => {
    const loadUnit = async () => {
      try {
        const user = await base44.auth.me();
        const owner = await base44.entities.CompanyOwner.filter({ user_id: user.id });
        if (owner[0]) {
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owner[0].id });
          if (units[0]) {
            setUnit(units[0]);
            // Preencher TODOS os campos da clínica (BLOQUEADOS - anti-fraude)
            setFormData(prev => ({
              ...prev,
              cidade: units[0].cidade || "",
              uf: units[0].uf || "",
              nome_clinica: units[0].nome_fantasia || "",
              endereco_completo: `${units[0].endereco || ""}, ${units[0].numero || ""} - ${units[0].bairro || ""}, ${units[0].cidade || ""}/${units[0].uf || ""}`
            }));
          }
        }
      } catch (error) {
        // MOCK DATA (LOCALHOST)
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          const mockUnit = {
            id: "mock-unit-1",
            owner_id: "mock-owner-1",
            nome_fantasia: "Clínica Dev Mock",
            cidade: "São Paulo",
            uf: "SP",
            endereco: "Av. Paulista",
            numero: "1000",
            bairro: "Bela Vista",
            whatsapp: "11999999999",
            tipo_mundo: "ODONTOLOGIA"
          };
          setUnit(mockUnit);
          setFormData(prev => ({
            ...prev,
            cidade: mockUnit.cidade,
            uf: mockUnit.uf,
            nome_clinica: mockUnit.nome_fantasia,
            endereco_completo: `${mockUnit.endereco}, ${mockUnit.numero} - ${mockUnit.bairro}, ${mockUnit.cidade}/${mockUnit.uf}`
          }));
          return;
        }
        toast.error("Erro ao carregar dados da clínica");
      }
    };
    loadUnit();
  }, []);

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const toggleEspecialidade = (especialidade) => {
    setFormData(prev => {
      const especialidades = prev.especialidades_aceitas.includes(especialidade)
        ? prev.especialidades_aceitas.filter(e => e !== especialidade)
        : [...prev.especialidades_aceitas, especialidade];
      return { ...prev, especialidades_aceitas: especialidades };
    });
  };

  const toggleDiaSemana = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia];
      return { ...prev, dias_semana: dias };
    });
  };

  // Máscara para valor monetário
  const aplicarMascaraDinheiro = (value) => {
    const numero = value.replace(/\D/g, "");
    if (!numero) return "";
    const valorEmReais = (parseInt(numero) / 100).toFixed(2);
    return valorEmReais.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Especialidades por tipo
  const especialidadesOdonto = [
    "Clínico Geral", "Ortodontia", "Endodontia", "Implantodontia",
    "Periodontia", "Prótese", "Odontopediatria", "Cirurgia Bucomaxilofacial",
    "Radiologia Odontológica", "Estética Dental"
  ];

  const especialidadesMedicina = [
    "Clínico Geral", "Cardiologia", "Dermatologia", "Ginecologia e Obstetrícia",
    "Ortopedia e Traumatologia", "Pediatria", "Psiquiatria", "Oftalmologia"
  ];

  const especialidades = formData.tipo_profissional === "DENTISTA"
    ? especialidadesOdonto
    : especialidadesMedicina;

  // Validação por etapa
  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.titulo.trim()) {
          toast.error("Preencha o título da vaga");
          return false;
        }
        if (!formData.descricao.trim()) {
          toast.error("Preencha a descrição da vaga");
          return false;
        }
        if (!formData.tipo_vaga) {
          toast.error("Selecione o tipo de vaga");
          return false;
        }
        if (!formData.tipo_profissional) {
          toast.error("Selecione o tipo de profissional");
          return false;
        }
        return true;

      case 2:
        if (formData.especialidades_aceitas.length === 0) {
          toast.error("Selecione pelo menos uma especialidade");
          return false;
        }
        if (formData.exige_experiencia && !formData.tempo_experiencia_minimo) {
          toast.error("Informe o tempo mínimo de experiência");
          return false;
        }
        if (!formData.falar_com.trim()) {
          toast.error("Informe com quem os candidatos devem falar");
          return false;
        }
        return true;

      case 3:
        if (!formData.selecao_dias) {
          toast.error("Selecione o tipo de período");
          return false;
        }
        if (formData.selecao_dias === "ESPECIFICOS" && formData.dias_semana.length === 0) {
          toast.error("Selecione pelo menos um dia da semana");
          return false;
        }
        if (!formData.horario_inicio || !formData.horario_fim) {
          toast.error("Preencha os horários");
          return false;
        }
        if (!formData.cidade.trim() || !formData.uf) {
          toast.error("Preencha a cidade e UF");
          return false;
        }
        return true;

      case 4:
        if (formData.tipo_remuneracao !== "A_COMBINAR" && !formData.valor_proposto) {
          toast.error("Informe o valor proposto ou selecione 'A Combinar'");
          return false;
        }
        if (!formData.tipo_remuneracao) {
          toast.error("Selecione o tipo de remuneração");
          return false;
        }
        if (!formData.aceita_termos) {
          toast.error("Você deve aceitar os termos");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const proximaEtapa = () => {
    if (validarEtapa(etapaAtual)) {
      setEtapaAtual(prev => Math.min(prev + 1, totalEtapas));
    }
  };

  const etapaAnterior = () => {
    setEtapaAtual(prev => Math.max(prev - 1, 1));
  };

  const publicarVaga = async () => {
    if (!validarEtapa(4)) return;
    if (!unit) {
      toast.error("Unidade não encontrada");
      return;
    }

    setLoading(true);
    try {
      // Converter valor proposto
      const valorPropostoNumero = formData.valor_proposto
        ? parseFloat(formData.valor_proposto.replace(/\./g, "").replace(",", "."))
        : null;

      // Data de expiração (30 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const dadosVaga = {
        unit_id: unit.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        tipo_vaga: formData.tipo_vaga,
        tipo_profissional: formData.tipo_profissional,
        especialidades_aceitas: formData.especialidades_aceitas,
        exige_experiencia: formData.exige_experiencia,
        tempo_experiencia_minimo: formData.exige_experiencia ? parseInt(formData.tempo_experiencia_minimo) : 0,
        selecao_dias: formData.selecao_dias,
        dias_semana: formData.selecao_dias === "ESPECIFICOS" ? formData.dias_semana : [],
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        cidade: formData.cidade,
        uf: formData.uf,
        valor_proposto: valorPropostoNumero,
        tipo_remuneracao: formData.tipo_remuneracao,
        falar_com: formData.falar_com,
        instagram_clinica: formData.instagram_clinica || "",
        status: "ABERTO",
        published_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };

      const vagaCriada = await base44.entities.Job.create(dadosVaga);

      // 🚀 GAP-001 CORRIGIDO: Webhook NOVA_VAGA
      try {
        await fetch('http://164.152.59.49:5678/webhook/nova-vaga', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vaga_id: vagaCriada.id,
            titulo: formData.titulo,
            especialidade: formData.especialidades_aceitas[0] || "Geral",
            cidade: formData.cidade,
            estado: formData.uf,
            tipo_contrato: formData.tipo_vaga,
            valor: valorPropostoNumero,
            criador_id: unit.owner_id,
            criador_nome: unit.nome_fantasia
          })
        });
      } catch (e) {
        // Erro silencioso no webhook
      }

      // Buscar profissionais matching e enviar notificações
      try {
        const profissionais = await base44.entities.Professional.filter({
          tipo_profissional: formData.tipo_profissional,
          status_cadastro: "APROVADO",
          new_jobs_ativo: true
        });

        // Filtrar profissionais que tem matching (cidade, especialidade, etc)
        const profissionaisMatching = profissionais.filter(prof => {
          const cidadeMatch = prof.cidades_atendimento?.includes(formData.cidade);
          const especialidadeMatch = formData.especialidades_aceitas.some(esp =>
            prof.especialidade_principal?.includes(esp)
          );
          return cidadeMatch || especialidadeMatch;
        });

        // Enviar emails e push notifications para profissionais com matching
        for (const prof of profissionaisMatching.slice(0, 50)) { // Limitar a 50
          try {
            const userProf = await base44.entities.User.filter({ id: prof.user_id });
            if (userProf[0]?.email) {
              // Email
              await fetch('http://164.152.59.49:5678/webhook/email-notificacao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: userProf[0].email,
                  subject: `🎯 Nova vaga: ${formData.titulo}`,
                  template: 'NOVA_VAGA',
                  data: {
                    nome: prof.nome_completo,
                    titulo_vaga: formData.titulo,
                    cidade: formData.cidade,
                    uf: formData.uf,
                    tipo_vaga: formData.tipo_vaga
                  }
                })
              });

              // Push notification
              await fetch('http://164.152.59.49:5678/webhook/push-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: prof.user_id,
                  title: '🎯 Nova Vaga Disponível!',
                  body: `${formData.titulo} em ${formData.cidade}/${formData.uf}`,
                  data: { type: 'NOVA_VAGA', job_id: vagaCriada.id }
                })
              });
            }
          } catch (e) {
            // Erro silencioso no envio de notificação
          }
        }
      } catch (e) {
        // Erro silencioso no sistema de notificações
      }

      toast.success("✅ Vaga publicada com sucesso!");
      navigate(createPageUrl("MinhasVagas"));
    } catch (error) {
      toast.error("❌ Erro ao publicar vaga: " + error.message);
    }
    setLoading(false);
  };

  const etapasConfig = [
    { numero: 1, titulo: "Informações", icon: Briefcase },
    { numero: 2, titulo: "Requisitos", icon: FileText },
    { numero: 3, titulo: "Horários", icon: Clock },
    { numero: 4, titulo: "Remuneração", icon: DollarSign }
  ];

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Título da Vaga *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Ex: Dentista para Ortodontia"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Descrição Detalhada *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva a vaga, responsabilidades, perfil desejado..."
                className="w-full min-h-[150px] px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.descricao.length}/1000</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Tipo de Vaga *</label>
                <select
                  value={formData.tipo_vaga}
                  onChange={(e) => handleInputChange("tipo_vaga", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="PLANTAO">Plantão</option>
                  <option value="SUBSTITUICAO">Substituição</option>
                  <option value="FIXO">Fixo</option>
                  <option value="TEMPORARIO">Temporário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Tipo de Profissional</label>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-3 bg-brand-orange/10 text-brand-orange font-bold rounded-xl border border-brand-orange/30">
                    {userArea === "ODONTOLOGIA" ? "🦷 Dentista" : "⚕️ Médico"}
                  </span>
                  <span className="text-sm text-gray-500">Definido pela sua clínica</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Especialidades Aceitas *</label>
              {!formData.tipo_profissional && (
                <p className="text-sm text-gray-500 mb-4">Selecione o tipo de profissional primeiro</p>
              )}

              {formData.especialidades_aceitas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
                  {formData.especialidades_aceitas.map((esp) => (
                    <span
                      key={esp}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-orange/20 text-brand-orange rounded-full text-sm font-medium"
                    >
                      {esp}
                      <button
                        type="button"
                        onClick={() => toggleEspecialidade(esp)}
                        className="text-brand-orange/80 hover:text-brand-orange font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {formData.tipo_profissional && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto border border-white/10 rounded-xl p-4 bg-[#0a0a1a]">
                  {especialidades.map((esp) => (
                    <div key={esp} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`esp-${esp}`}
                        checked={formData.especialidades_aceitas.includes(esp)}
                        onChange={() => toggleEspecialidade(esp)}
                        className="w-4 h-4 accent-brand-orange bg-zinc-800 border-zinc-700"
                      />
                      <label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer text-gray-300 hover:text-white transition-colors">
                        {esp}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-white/10 rounded-xl p-5 bg-[#0a0a1a]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-400">Exige Experiência?</label>
                <button
                  type="button"
                  onClick={() => handleInputChange("exige_experiencia", !formData.exige_experiencia)}
                  className={`w-14 h-8 rounded-full transition-all ${formData.exige_experiencia ? "bg-brand-orange" : "bg-gray-600"
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${formData.exige_experiencia ? "ml-7" : "ml-1"
                    }`}></div>
                </button>
              </div>

              {formData.exige_experiencia && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Tempo Mínimo (anos) *</label>
                  <input
                    type="number"
                    value={formData.tempo_experiencia_minimo}
                    onChange={(e) => handleInputChange("tempo_experiencia_minimo", e.target.value)}
                    placeholder="Ex: 2"
                    min="0"
                    className="w-full px-4 py-3 bg-[#13132B] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Falar com *</label>
              <input
                type="text"
                value={formData.falar_com}
                onChange={(e) => handleInputChange("falar_com", e.target.value)}
                placeholder="Ex: Dr. João Silva"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Nome do responsável para contato</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Período *</label>
              <div className="space-y-3">
                {[
                  { value: "ESPECIFICOS", label: "📅 Dias Específicos" },
                  { value: "SEMANA_TODA", label: "🗓️ Semana Toda (Seg-Sex)" },
                  { value: "MES_TODO", label: "📆 Mês Todo (disponibilidade integral)" }
                ].map((opcao) => (
                  <div
                    key={opcao.value}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all ${formData.selecao_dias === opcao.value
                      ? "border-brand-orange bg-brand-orange/10"
                      : "border-white/10 bg-[#0a0a1a] hover:border-brand-orange/50"
                      }`}
                    onClick={() => handleInputChange("selecao_dias", opcao.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.selecao_dias === opcao.value ? "border-brand-orange" : "border-gray-500"
                        }`}>
                        {formData.selecao_dias === opcao.value && (
                          <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                        )}
                      </div>
                      <span className="font-medium text-white">{opcao.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.selecao_dias === "ESPECIFICOS" && (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">Selecione os Dias *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: "SEG", label: "Seg" },
                    { value: "TER", label: "Ter" },
                    { value: "QUA", label: "Qua" },
                    { value: "QUI", label: "Qui" },
                    { value: "SEX", label: "Sex" },
                    { value: "SAB", label: "Sáb" },
                    { value: "DOM", label: "Dom" },
                    { value: "INTEGRAL", label: "Integral" }
                  ].map((dia) => (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.value)}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${formData.dias_semana.includes(dia.value)
                        ? "bg-gradient-to-r from-brand-coral to-brand-orange text-white shadow-lg shadow-brand-orange/20"
                        : "bg-[#0a0a1a] border border-white/10 text-gray-400 hover:border-brand-orange hover:text-white"
                        }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Horário Início *</label>
                <input
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => handleInputChange("horario_inicio", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none time-input-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Horário Fim *</label>
                <input
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => handleInputChange("horario_fim", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none time-input-dark"
                />
              </div>
            </div>

            {/* Nome da Clínica - BLOQUEADO */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                Nome da Clínica *
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Travado
                </span>
              </label>
              <div className="px-4 py-4 bg-[#13132B] border border-white/10 rounded-xl text-gray-300 font-semibold opacity-70">
                {unit?.nome_fantasia || "Carregando..."}
              </div>
              <p className="text-xs text-gray-500 mt-1">Nome vem automaticamente do cadastro da sua clínica (anti-fraude)</p>
            </div>

            {/* Endereço Completo - BLOQUEADO */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                Endereço da Clínica *
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Travado
                </span>
              </label>
              <div className="px-4 py-4 bg-[#13132B] border border-white/10 rounded-xl text-gray-300 opacity-70">
                {formData.endereco_completo || "Carregando..."}
              </div>
              <p className="text-xs text-gray-500 mt-1">Endereço verificado no cadastro da clínica (anti-fraude)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                  UF *
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                  </span>
                </label>
                <div className="px-4 py-4 bg-[#13132B] border border-white/10 rounded-xl text-gray-300 font-bold opacity-70">
                  {formData.uf || "Carregando..."}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                  Cidade *
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                  </span>
                </label>
                <div className="px-4 py-4 bg-[#13132B] border border-white/10 rounded-xl text-gray-300 font-bold opacity-70">
                  {formData.cidade || "Carregando..."}
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-sm text-yellow-500">
                🛡️ <strong>Segurança:</strong> Nome, endereço e localização são puxados automaticamente
                do cadastro verificado da sua clínica para prevenir fraudes.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Instagram da Clínica (opcional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">@</span>
                <input
                  type="text"
                  value={formData.instagram_clinica}
                  onChange={(e) => handleInputChange("instagram_clinica", e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                  placeholder="suaclinica"
                  className="w-full pl-10 pr-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Tipo de Remuneração *</label>
              <select
                value={formData.tipo_remuneracao}
                onChange={(e) => handleInputChange("tipo_remuneracao", e.target.value)}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer transition-all outline-none"
              >
                <option value="">Selecione</option>
                <option value="FIXO">Fixo (mensal)</option>
                <option value="DIARIA">Diária</option>
                <option value="PORCENTAGEM">Porcentagem</option>
                <option value="A_COMBINAR">A Combinar</option>
              </select>
            </div>

            {formData.tipo_remuneracao !== "A_COMBINAR" && (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Valor Proposto *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                  <input
                    type="text"
                    value={formData.valor_proposto}
                    onChange={(e) => handleInputChange("valor_proposto", aplicarMascaraDinheiro(e.target.value))}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {/* Resumo */}
            <div className="bg-gradient-to-r from-[#13132B] to-[#0a0a1a] rounded-2xl p-6 border border-brand-orange/30 shadow-lg shadow-brand-orange/5">
              <h3 className="text-lg font-bold text-white mb-4">📋 Resumo da Vaga</h3>
              <div className="bg-[#0a0a1a] border border-white/10 rounded-xl p-5 space-y-2 text-sm text-gray-300">
                <p><strong className="text-white">Título:</strong> {formData.titulo}</p>
                <p><strong className="text-white">Tipo:</strong> {formData.tipo_vaga}</p>
                <p><strong className="text-white">Profissional:</strong> {formData.tipo_profissional}</p>
                <p><strong className="text-white">Especialidades:</strong> {formData.especialidades_aceitas.slice(0, 3).join(", ")}{formData.especialidades_aceitas.length > 3 && "..."}</p>
                <p><strong className="text-white">Período:</strong> {formData.selecao_dias}</p>
                <p><strong className="text-white">Horário:</strong> {formData.horario_inicio} - {formData.horario_fim}</p>
                <p><strong className="text-white">Local:</strong> {formData.cidade} - {formData.uf}</p>
                <p><strong className="text-white">Remuneração:</strong> {formData.tipo_remuneracao === "A_COMBINAR" ? "A Combinar" : `R$ ${formData.valor_proposto}`}</p>
              </div>
            </div>

            {/* Aceitar Termos */}
            <div className="border border-white/10 rounded-2xl p-5 hover:border-brand-orange/50 transition-all bg-[#0a0a1a]">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="aceita_termos"
                  checked={formData.aceita_termos}
                  onChange={(e) => handleInputChange("aceita_termos", e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-brand-orange bg-zinc-800 border-zinc-700"
                />
                <label htmlFor="aceita_termos" className="cursor-pointer text-sm text-gray-400">
                  Li e aceito os <span className="text-brand-orange font-bold underline">Termos de Publicação</span> e concordo
                  que esta vaga será visível para profissionais cadastrados na plataforma
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-3 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-brand-orange font-medium py-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-xl shadow-brand-coral/20">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Criar Nova Vaga</h1>
          <p className="text-gray-400 mt-2">Preencha as informações da oportunidade</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-[#13132B] rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressoPercentual}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-brand-coral to-brand-orange"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2 px-1">
            <span>Etapa {etapaAtual} de {totalEtapas}</span>
            <span className="font-bold text-gray-400">{Math.round(progressoPercentual)}% completo</span>
          </div>
        </div>

        {/* Indicadores de Etapa */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2 px-1">
          {etapasConfig.map((etapa) => {
            const isActive = etapaAtual >= etapa.numero;
            const isCurrent = etapaAtual === etapa.numero;
            return (
              <div key={etapa.numero} className="flex flex-col items-center min-w-[80px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all border-2 ${isActive
                    ? "bg-brand-orange border-brand-orange text-white"
                    : "bg-[#13132B] border-white/10 text-gray-500"
                    } ${isCurrent ? "ring-4 ring-brand-orange/20 scale-110" : ""}`}
                >
                  <etapa.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isActive ? "text-brand-orange" : "text-gray-600"
                  }`}>
                  {etapa.titulo}
                </span>
              </div>
            );
          })}
        </div>

        {/* Formulário Card */}
        <motion.div
          key={etapaAtual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#13132B]/60 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8"
        >
          {renderEtapa()}

          {/* Navegação */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
            {etapaAtual > 1 ? (
              <button
                onClick={etapaAnterior}
                className="px-6 py-3 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-all"
              >
                Voltar
              </button>
            ) : (
              <div></div>
            )}

            {etapaAtual < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="px-8 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl shadow-lg hover:shadow-brand-coral/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                Próxima Etapa
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={publicarVaga}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Publicar Vaga
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}