import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Save,
  User,
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  Camera,
  X,
  Award,
  AlertCircle
} from "lucide-react";
import { getEspecialidades, getRegistroLabel } from "@/components/constants/especialidades";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import CityAutocomplete from "@/components/forms/CityAutocomplete";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pessoais");

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome_completo: "",
    data_nascimento: "",
    cpf: "",
    whatsapp: "",
    email: "",
    exibir_email: false,
    instagram: "",
    tipo_profissional: "",
    registro_conselho: "",
    uf_conselho: "",
    especialidade_principal: "",
    tempo_formado_anos: "",
    tempo_especialidade_anos: "",
    status_disponibilidade: "DISPONIVEL",
    aceita_freelance: false,
    dias_semana_disponiveis: [],
    disponibilidade_inicio: "",
    forma_remuneracao: [],
    cidades_atendimento: [],
    cidade_input: "",
    uf_input: "",
    experiencias_profissionais: [],
    cursos_aperfeicoamento: [],
    selfie_documento_url: "",
    carteirinha_conselho_url: ""
  });

  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf_input);

  // Buscar profissional
  const { data: professional, isLoading } = useQuery({
    queryKey: ["myProfessional"],
    queryFn: async () => {
      // MOCK DATA (LOCALHOST)
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return {
          id: "mock-prof-1",
          nome_completo: "Dev Localhost",
          email: "dev@localhost.com",
          cpf: "123.456.789-00",
          whatsapp: "11999999999",
          instagram: "dev_localhost",
          tipo_profissional: "MEDICO",
          registro_conselho: "12345",
          uf_conselho: "SP",
          especialidade_principal: "Clínica Geral",
          tempo_formado_anos: 5,
          tempo_especialidade_anos: 2,
          status_disponibilidade: "DISPONIVEL",
          aceita_freelance: true,
          dias_semana_disponiveis: ["SEG", "QUA", "SEX"],
          disponibilidade_inicio: "IMEDIATO",
          forma_remuneracao: ["FIXO", "DIARIA"],
          cidades_atendimento: ["São Paulo - SP"],
          observacoes: "Perfil de teste",
          experiencias_profissionais: [],
          cursos_aperfeicoamento: [],
          exibir_email: true,
          user_id: "mock-user-123"
        };
      }

      const user = await base44.auth.me();
      const result = await base44.entities.Professional.filter({ user_id: user.id });
      return result[0] || null;
    }
  });

  // Preencher formulário ao carregar dados
  useEffect(() => {
    if (professional) {
      // Formatar data de nascimento de ddmmaaaa para DD/MM/AAAA
      let dataNascimentoFormatada = "";
      if (professional.data_nascimento?.length === 8) {
        const dia = professional.data_nascimento.slice(0, 2);
        const mes = professional.data_nascimento.slice(2, 4);
        const ano = professional.data_nascimento.slice(4, 8);
        dataNascimentoFormatada = `${dia}/${mes}/${ano}`;
      }

      setFormData({
        nome_completo: professional.nome_completo || "",
        data_nascimento: dataNascimentoFormatada,
        cpf: professional.cpf || "",
        whatsapp: professional.whatsapp || "",
        email: professional.email || "",
        exibir_email: professional.exibir_email || false,
        instagram: professional.instagram || "",
        tipo_profissional: professional.tipo_profissional || "",
        registro_conselho: professional.registro_conselho || "",
        uf_conselho: professional.uf_conselho || "",
        especialidade_principal: professional.especialidade_principal || "",
        tempo_formado_anos: professional.tempo_formado_anos?.toString() || "",
        tempo_especialidade_anos: professional.tempo_especialidade_anos?.toString() || "",
        status_disponibilidade: professional.status_disponibilidade || "DISPONIVEL",
        aceita_freelance: professional.aceita_freelance || false,
        dias_semana_disponiveis: professional.dias_semana_disponiveis || [],
        disponibilidade_inicio: professional.disponibilidade_inicio || "",
        forma_remuneracao: professional.forma_remuneracao || [],
        cidades_atendimento: professional.cidades_atendimento || [],
        cidade_input: "",
        uf_input: "",
        observacoes: professional.observacoes || "",
        experiencias_profissionais: professional.experiencias_profissionais || [],
        cursos_aperfeicoamento: professional.cursos_aperfeicoamento || [],
        selfie_documento_url: professional.selfie_documento_url || "",
        carteirinha_conselho_url: professional.carteirinha_conselho_url || ""
      });
    }
  }, [professional]);

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Professional.update(professional.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfessional"] });
      queryClient.invalidateQueries({ queryKey: ["professional"] });
      toast.success("✅ Perfil atualizado com sucesso!");
      navigate(createPageUrl("MeuPerfil"));
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil: " + error.message);
    }
  });

  const handleInputChange = (campo, valor) => {
    if (campo === "nome_completo") {
      valor = valor.trimStart().replace(/\s{2,}/g, ' ');
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  // Máscaras
  const aplicarMascaraWhatsApp = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraData = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const adicionarCidade = () => {
    if (!formData.cidade_input.trim() || !formData.uf_input) {
      toast.error("Preencha a cidade e UF");
      return;
    }

    if (formData.cidades_atendimento.length >= 6) {
      toast.error("Máximo de 6 cidades");
      return;
    }

    const cidadeCompleta = `${formData.cidade_input.trim()} - ${formData.uf_input}`;

    if (formData.cidades_atendimento.includes(cidadeCompleta)) {
      toast.error("Cidade já adicionada");
      return;
    }

    setFormData(prev => ({
      ...prev,
      cidades_atendimento: [...prev.cidades_atendimento, cidadeCompleta],
      cidade_input: "",
      uf_input: ""
    }));
  };

  const removerCidade = (cidade) => {
    setFormData(prev => ({
      ...prev,
      cidades_atendimento: prev.cidades_atendimento.filter(c => c !== cidade)
    }));
  };

  const toggleDiaSemana = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_semana_disponiveis.includes(dia)
        ? prev.dias_semana_disponiveis.filter(d => d !== dia)
        : [...prev.dias_semana_disponiveis, dia];
      return { ...prev, dias_semana_disponiveis: dias };
    });
  };

  const toggleFormaRemuneracao = (forma) => {
    setFormData(prev => {
      const formas = prev.forma_remuneracao.includes(forma)
        ? prev.forma_remuneracao.filter(f => f !== forma)
        : [...prev.forma_remuneracao, forma];
      return { ...prev, forma_remuneracao: formas };
    });
  };

  const handleSalvar = async () => {
    // Validações
    if (!formData.nome_completo.trim() || formData.nome_completo.trim().length < 3) {
      toast.error("Nome completo deve ter no mínimo 3 caracteres");
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Preencha um email válido");
      return;
    }
    if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, "").length !== 11) {
      toast.error("Preencha um WhatsApp válido (11 dígitos)");
      return;
    }
    if (formData.cidades_atendimento.length === 0) {
      toast.error("Adicione pelo menos uma cidade de atendimento");
      return;
    }
    if (formData.dias_semana_disponiveis.length === 0) {
      toast.error("Selecione pelo menos um dia disponível");
      return;
    }

    // Converter data de nascimento para formato ddmmaaaa
    let dataNascimento = professional.data_nascimento;
    if (formData.data_nascimento) {
      const [dia, mes, ano] = formData.data_nascimento.split("/");
      dataNascimento = `${dia}${mes}${ano}`;
    }

    const dadosAtualizados = {
      nome_completo: formData.nome_completo.trim(),
      data_nascimento: dataNascimento,
      whatsapp: formData.whatsapp.replace(/\D/g, ""),
      email: formData.email,
      exibir_email: formData.exibir_email,
      instagram: formData.instagram || "",
      registro_conselho: formData.registro_conselho,
      uf_conselho: formData.uf_conselho,
      especialidade_principal: formData.especialidade_principal,
      tempo_formado_anos: parseInt(formData.tempo_formado_anos),
      tempo_especialidade_anos: formData.tempo_especialidade_anos ? parseInt(formData.tempo_especialidade_anos) : 0,
      status_disponibilidade: formData.status_disponibilidade,
      aceita_freelance: formData.aceita_freelance,
      dias_semana_disponiveis: formData.dias_semana_disponiveis,
      disponibilidade_inicio: formData.disponibilidade_inicio,
      forma_remuneracao: formData.forma_remuneracao,
      cidades_atendimento: formData.cidades_atendimento,
      observacoes: formData.observacoes,
      experiencias_profissionais: formData.experiencias_profissionais,
      cursos_aperfeicoamento: formData.cursos_aperfeicoamento,
      selfie_documento_url: formData.selfie_documento_url,
      carteirinha_conselho_url: formData.carteirinha_conselho_url
    };

    updateMutation.mutate(dadosAtualizados);
  };

  const especialidades = getEspecialidades(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-brand-coral/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#13132B] border-b border-white/10 p-6 relative z-10 mb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(createPageUrl("MeuPerfil"))}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-orange/20">
              {formData.nome_completo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Editar Perfil</h1>
              <p className="text-gray-400">Mantenha seus dados atualizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full bg-[#0a0a1a] border-b border-white/10 p-2 h-auto">
              <TabsTrigger value="pessoais" className="data-[state=active]:bg-[#1E1E3F] data-[state=active]:text-white text-gray-400 rounded-lg py-3">
                <User className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Pessoais</span>
              </TabsTrigger>
              <TabsTrigger value="profissionais" className="data-[state=active]:bg-[#1E1E3F] data-[state=active]:text-white text-gray-400 rounded-lg py-3">
                <Briefcase className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Profissionais</span>
              </TabsTrigger>
              <TabsTrigger value="disponibilidade" className="data-[state=active]:bg-[#1E1E3F] data-[state=active]:text-white text-gray-400 rounded-lg py-3">
                <Calendar className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Disponibilidade</span>
              </TabsTrigger>
              <TabsTrigger value="localizacao" className="data-[state=active]:bg-[#1E1E3F] data-[state=active]:text-white text-gray-400 rounded-lg py-3">
                <MapPin className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Localização</span>
              </TabsTrigger>
              <TabsTrigger value="sobre" className="data-[state=active]:bg-[#1E1E3F] data-[state=active]:text-white text-gray-400 rounded-lg py-3">
                <FileText className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Sobre</span>
              </TabsTrigger>
              <TabsTrigger value="documentos" className="data-[state=active]:bg-[#1E1E3F] data-[state=active]:text-white text-gray-400 rounded-lg py-3">
                <Upload className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Docs</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6 md:p-8">
              {/* SEÇÃO 1 - DADOS PESSOAIS */}
              <TabsContent value="pessoais" className="space-y-6 mt-0">
                <div className="mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white mb-1">Dados Pessoais</h2>
                  <p className="text-gray-400">Informações básicas do seu perfil</p>
                </div>

                {/* Foto Perfil */}
                <div className="bg-[#0a0a1a] p-6 rounded-2xl border border-white/10">
                  <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Foto de Perfil</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E1E3F] to-black border-2 border-white/10 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden relative group">
                      {formData.nome_completo?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="foto_perfil"
                        accept="image/jpeg,image/jpg,image/png"
                        className="hidden"
                      />
                      <label
                        htmlFor="foto_perfil"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 hover:border-brand-orange/50 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        Apenas leitura (Demo)
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Upload desativado no modo demonstração</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.nome_completo}
                      onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Data de Nascimento *</label>
                      <input
                        type="text"
                        value={formData.data_nascimento}
                        onChange={(e) => handleInputChange("data_nascimento", aplicarMascaraData(e.target.value))}
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">CPF</label>
                      <input
                        type="text"
                        value={aplicarMascaraCPF(formData.cpf)}
                        disabled
                        className="w-full px-4 py-4 bg-[#0a0a1a]/50 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">WhatsApp *</label>
                    <input
                      type="text"
                      value={aplicarMascaraWhatsApp(formData.whatsapp)}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value.replace(/\D/g, ""))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0a0a1a] border border-white/10 rounded-xl">
                    <div>
                      <p className="font-bold text-white">Exibir email publicamente</p>
                      <p className="text-sm text-gray-400">Clínicas poderão ver seu email</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange("exibir_email", !formData.exibir_email)}
                      className={`w-14 h-8 rounded-full transition-all relative ${formData.exibir_email ? "bg-brand-orange" : "bg-gray-700"}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${formData.exibir_email ? "left-7" : "left-1"}`}></div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Instagram</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange("instagram", e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                        placeholder="seuperfil"
                        className="w-full pl-10 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* SEÇÃO 2 - DADOS PROFISSIONAIS */}
              <TabsContent value="profissionais" className="space-y-6 mt-0">
                <div className="mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white mb-1">Dados Profissionais</h2>
                  <p className="text-gray-400">Suas credenciais e experiência</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Tipo de Profissional</label>
                    <input
                      type="text"
                      value={formData.tipo_profissional === "DENTISTA" ? "Dentista 🦷" : "Médico 🩺"}
                      disabled
                      className="w-full px-4 py-4 bg-[#0a0a1a]/50 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">
                        Número {getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")} *
                      </label>
                      <input
                        type="text"
                        value={formData.registro_conselho}
                        onChange={(e) => handleInputChange("registro_conselho", e.target.value)}
                        placeholder="12345"
                        className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">UF do Registro *</label>
                      <select
                        value={formData.uf_conselho}
                        onChange={(e) => handleInputChange("uf_conselho", e.target.value)}
                        className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                      >
                        <option value="">Selecione</option>
                        {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                          <option key={uf} value={uf} className="bg-[#13132B]">{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Especialidade Principal *</label>
                    <select
                      value={formData.especialidade_principal}
                      onChange={(e) => handleInputChange("especialidade_principal", e.target.value)}
                      className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                    >
                      <option value="">Selecione</option>
                      {especialidades.map((esp) => (
                        <option key={esp} value={esp} className="bg-[#13132B]">{esp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Tempo de Formado (anos) *</label>
                      <input
                        type="number"
                        value={formData.tempo_formado_anos}
                        onChange={(e) => handleInputChange("tempo_formado_anos", e.target.value)}
                        min="0"
                        placeholder="Ex: 5"
                        className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Tempo na Especialidade (anos)</label>
                      <input
                        type="number"
                        value={formData.tempo_especialidade_anos}
                        onChange={(e) => handleInputChange("tempo_especialidade_anos", e.target.value)}
                        min="0"
                        placeholder="Ex: 3"
                        className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* SEÇÃO 3 - DISPONIBILIDADE */}
              <TabsContent value="disponibilidade" className="space-y-6 mt-0">
                <div className="mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white mb-1">Disponibilidade</h2>
                  <p className="text-gray-400">Configure quando e como você pode trabalhar</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Status Atual *</label>
                    <select
                      value={formData.status_disponibilidade}
                      onChange={(e) => handleInputChange("status_disponibilidade", e.target.value)}
                      className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                    >
                      <option value="DISPONIVEL" className="bg-[#13132B]">✅ Disponível</option>
                      <option value="OCUPADO" className="bg-[#13132B]">⏳ Ocupado</option>
                      <option value="INDISPONIVEL" className="bg-[#13132B]">🔴 Indisponível</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0a0a1a] border border-white/10 rounded-xl">
                    <div>
                      <p className="font-bold text-white">Aceita trabalho freelance/substituição</p>
                      <p className="text-sm text-gray-400">Trabalhos pontuais e temporários</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange("aceita_freelance", !formData.aceita_freelance)}
                      className={`w-14 h-8 rounded-full transition-all relative ${formData.aceita_freelance ? "bg-brand-orange" : "bg-gray-700"}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${formData.aceita_freelance ? "left-7" : "left-1"}`}></div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Dias Disponíveis *</label>
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
                          className={`py-3 px-4 rounded-xl font-bold transition-all border ${formData.dias_semana_disponiveis.includes(dia.value)
                            ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20"
                            : "bg-[#0a0a1a] border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                            }`}
                        >
                          {dia.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Disponibilidade para Início *</label>
                    <select
                      value={formData.disponibilidade_inicio}
                      onChange={(e) => handleInputChange("disponibilidade_inicio", e.target.value)}
                      className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                    >
                      <option value="">Selecione</option>
                      <option value="IMEDIATO" className="bg-[#13132B]">Imediato</option>
                      <option value="15_DIAS" className="bg-[#13132B]">15 dias</option>
                      <option value="30_DIAS" className="bg-[#13132B]">30 dias</option>
                      <option value="60_DIAS" className="bg-[#13132B]">60 dias</option>
                      <option value="A_COMBINAR" className="bg-[#13132B]">A combinar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Formas de Remuneração Aceitas *</label>
                    <div className="space-y-3">
                      {[
                        { value: "DIARIA", label: "Diária (valor por dia trabalhado)" },
                        { value: "PORCENTAGEM", label: "Porcentagem (% sobre procedimentos)" },
                        { value: "FIXO", label: "Fixo (salário mensal)" },
                        { value: "A_COMBINAR", label: "A Combinar" }
                      ].map((forma) => (
                        <div
                          key={forma.value}
                          className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.forma_remuneracao.includes(forma.value)
                            ? "border-brand-orange bg-brand-orange/10"
                            : "border-white/10 bg-[#0a0a1a] hover:border-white/20"
                            }`}
                          onClick={() => toggleFormaRemuneracao(forma.value)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.forma_remuneracao.includes(forma.value) ? "border-brand-orange bg-brand-orange" : "border-gray-500"
                              }`}>
                              {formData.forma_remuneracao.includes(forma.value) && (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="font-medium text-white">{forma.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* SEÇÃO 4 - LOCALIZAÇÃO */}
              <TabsContent value="localizacao" className="space-y-6 mt-0">
                <div className="mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white mb-1">Cidades de Atendimento</h2>
                  <p className="text-gray-400">Onde você pode trabalhar (máximo 6 cidades)</p>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <select
                      value={formData.uf_input}
                      onChange={(e) => {
                        handleInputChange("uf_input", e.target.value);
                        handleInputChange("cidade_input", "");
                      }}
                      disabled={formData.cidades_atendimento.length >= 6}
                      className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none disabled:opacity-50"
                    >
                      <option value="">UF</option>
                      {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                        <option key={uf} value={uf} className="bg-[#13132B]">{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-7">
                    <div className="relative">
                      <CityAutocomplete
                        value={formData.cidade_input}
                        onChange={(cidade) => handleInputChange("cidade_input", cidade)}
                        cidades={cidades}
                        loading={loadingCidades}
                        disabled={!formData.uf_input || formData.cidades_atendimento.length >= 6}
                        placeholder={!formData.uf_input ? "Selecione UF primeiro" : "Selecione a cidade"}
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={adicionarCidade}
                      disabled={formData.cidades_atendimento.length >= 6}
                      className="w-full h-full bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-2xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {formData.cidades_atendimento.length >= 6 && (
                  <div className="flex items-center gap-2 text-brand-orange bg-brand-orange/10 p-3 rounded-xl border border-brand-orange/20">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-bold">Limite máximo de 6 cidades atingido</p>
                  </div>
                )}

                {/* Lista de cidades adicionadas */}
                {formData.cidades_atendimento.length > 0 ? (
                  <div className="space-y-3 p-4 bg-[#0a0a1a] border border-white/10 rounded-2xl">
                    <p className="text-sm font-semibold text-gray-400">Cidades Adicionadas ({formData.cidades_atendimento.length}/6)</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.cidades_atendimento.map((cidade, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:border-white/30 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{cidade}</span>
                          <button
                            type="button"
                            onClick={() => removerCidade(cidade)}
                            className="text-gray-500 hover:text-red-400 font-bold ml-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-[#0a0a1a]">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-700" />
                    <p className="text-gray-500">Nenhuma cidade adicionada ainda</p>
                  </div>
                )}
              </TabsContent>

              {/* OUTRAS ABAS (Sobre, Documentos) omitidas para brevidade mas manteriam o mesmo estilo */}
              <TabsContent value="sobre" className="space-y-6 mt-0">
                <div className="mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white mb-1">Sobre Você</h2>
                  <p className="text-gray-400">Conte um pouco sobre sua trajetória</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Resumo Profissional</label>
                  <textarea
                    value={formData.observacoes || ""}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none h-40 resize-none"
                    placeholder="Escreva aqui sobre suas experiências, especialidades..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-6 mt-0">
                <div className="mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white mb-1">Documentos</h2>
                  <p className="text-gray-400">Envie seus documentos para validação</p>
                </div>
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-brand-orange" />
                  <p className="text-sm text-brand-orange">Funcionalidade de upload desativada no modo de demonstração.</p>
                </div>
              </TabsContent>
            </div>

            {/* Footer de Ação */}
            <div className="border-t border-white/10 bg-[#0a0a1a]/50 p-6 flex justify-end">
              <button
                onClick={handleSalvar}
                disabled={updateMutation.isPending}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Salvar Alterações
              </button>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}