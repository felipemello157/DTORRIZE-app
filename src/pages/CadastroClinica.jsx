import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  ArrowRight,
  Building2,
  User,
  MapPin,
  Stethoscope,
  Upload,
  CheckCircle2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getEspecialidades } from "@/components/constants/especialidades";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import CityAutocomplete from "@/components/forms/CityAutocomplete";
import { createPageUrl } from "@/utils";
import { validarCNPJ, validarCPF } from "@/components/utils/cnpjValidator";

export default function CadastroClinica() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
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

        if (currentUser.vertical) {
          setFormData(prev => ({ ...prev, tipo_mundo: currentUser.vertical }));
        }
      } catch (error) {
        clearTimeout(timeoutId);
      }
    };
    checkUser();

    return () => { isMounted = false; };
  }, []);

  // Estado do formulário
  const [formData, setFormData] = useState({
    // ETAPA 1: Tipo e Dados da Empresa
    tipo_mundo: "",
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    telefone_comercial: "",
    email: "",
    whatsapp: "",

    // ETAPA 2: Responsável
    nome_responsavel: "",
    cpf_responsavel: "",
    cargo_responsavel: "",
    whatsapp_responsavel: "",
    documento_responsavel: null,

    // ETAPA 3: Endereço
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    ponto_referencia: "",
    google_maps_link: "",

    // ETAPA 4: Especialidades e Fotos
    especialidades_atendidas: [],
    logo_clinica: null,
    foto_fachada: null,
    fotos_clinica: [],
    instagram: "",

    // ETAPA 5: Revisão e Termos
    aceita_termos: false
  });

  const [showMapsHelp, setShowMapsHelp] = useState(false);

  const totalEtapas = 5;
  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  // Hook para buscar cidades após formData ser declarado
  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  // Funções de máscara
  const aplicarMascaraCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const handleInputChange = (campo, valor) => {
    // Normalizar nomes e razão social: remover espaços duplicados e trim inicial
    if (campo === "razao_social" || campo === "nome_fantasia" || campo === "nome_responsavel") {
      valor = valor.trimStart().replace(/\s{2,}/g, ' ');
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const buscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return;
    }

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
        complemento: data.complemento || ""
      }));

      toast.success("CEP encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
    setBuscandoCep(false);
  };

  const toggleEspecialidade = (especialidade) => {
    setFormData(prev => {
      const especialidades = prev.especialidades_atendidas.includes(especialidade)
        ? prev.especialidades_atendidas.filter(e => e !== especialidade)
        : [...prev.especialidades_atendidas, especialidade];
      return { ...prev, especialidades_atendidas: especialidades };
    });
  };

  const handleMultiplePhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.fotos_clinica.length + files.length > 5) {
      toast.error("Máximo de 5 fotos permitido!");
      return;
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        fotos_clinica: [...prev.fotos_clinica, ...uploadedUrls]
      }));
      toast.success("Fotos enviadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar fotos");
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      fotos_clinica: prev.fotos_clinica.filter((_, i) => i !== index)
    }));
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.tipo_mundo) {
          toast.error("Selecione o tipo de clínica");
          return false;
        }
        if (!formData.razao_social.trim() || formData.razao_social.trim().length < 3) {
          toast.error("Razão social deve ter no mínimo 3 caracteres");
          return false;
        }
        if (!formData.nome_fantasia.trim() || formData.nome_fantasia.trim().length < 3) {
          toast.error("Nome fantasia deve ter no mínimo 3 caracteres");
          return false;
        }
        if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
          toast.error("Preencha um CNPJ válido");
          return false;
        }
        if (!validarCNPJ(formData.cnpj)) {
          toast.error("CNPJ inválido");
          return false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error("Preencha um email válido");
          return false;
        }
        if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um WhatsApp válido");
          return false;
        }
        return true;

      case 2:
        if (!formData.nome_responsavel.trim() || formData.nome_responsavel.trim().length < 3) {
          toast.error("Nome do responsável deve ter no mínimo 3 caracteres");
          return false;
        }
        if (!formData.cpf_responsavel || formData.cpf_responsavel.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um CPF válido para o responsável");
          return false;
        }
        if (!validarCPF(formData.cpf_responsavel)) {
          toast.error("CPF do responsável inválido");
          return false;
        }
        if (!formData.cargo_responsavel) {
          toast.error("Preencha o cargo do responsável");
          return false;
        }
        if (!formData.whatsapp_responsavel || formData.whatsapp_responsavel.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um WhatsApp válido para o responsável");
          return false;
        }
        if (!formData.documento_responsavel) {
          toast.error("É obrigatório enviar o documento do responsável");
          return false;
        }
        return true;

      case 3:
        if (!formData.cep) {
          toast.error("Preencha o CEP");
          return false;
        }
        if (!formData.endereco || !formData.numero || !formData.cidade || !formData.uf) {
          toast.error("Preencha todos os campos obrigatórios do endereço");
          return false;
        }
        return true;

      case 4:
        if (formData.especialidades_atendidas.length === 0) {
          toast.error("Selecione pelo menos uma especialidade atendida");
          return false;
        }
        return true;

      case 5:
        if (!formData.aceita_termos) {
          toast.error("Você deve aceitar os Termos de Uso");
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

  const handleFileUpload = async (campo, file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Apenas imagens JPG/PNG ou PDF são permitidos");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange(campo, file_url);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar arquivo: " + error.message);
    }
  };

  const finalizarCadastro = async () => {
    if (!validarEtapa(5)) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();

      // Criar CompanyOwner
      const dadosOwner = {
        user_id: user.id,
        nome_completo: formData.nome_responsavel.trim(),
        cpf: formData.cpf_responsavel.replace(/\D/g, ""),
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        documento_frente_url: formData.documento_responsavel,
        status_cadastro: "EM_ANALISE"
      };

      const owner = await base44.entities.CompanyOwner.create(dadosOwner);

      // Criar CompanyUnit
      const dadosUnit = {
        owner_id: owner.id,
        razao_social: formData.razao_social.trim(),
        nome_fantasia: formData.nome_fantasia.trim(),
        cnpj: formData.cnpj.replace(/\D/g, ""),
        tipo_empresa: "CLINICA",
        tipo_mundo: formData.tipo_mundo,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        telefone_fixo: formData.telefone_comercial ? formData.telefone_comercial.replace(/\D/g, "") : "",
        cep: formData.cep.replace(/\D/g, ""),
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        ponto_referencia: formData.ponto_referencia,
        nome_responsavel: formData.nome_responsavel,
        documento_responsavel_url: formData.documento_responsavel,
        foto_fachada_url: formData.foto_fachada,
        status_cadastro: "EM_ANALISE",
        ativo: true
      };

      await base44.entities.CompanyUnit.create(dadosUnit);

      // Marcar onboarding como completo
      await base44.auth.updateMe({ onboarding_completo: true });

      toast.success("✅ Cadastro realizado com sucesso! Aguarde a aprovação.");
      navigate(createPageUrl("CadastroSucesso"));
    } catch (error) {
      toast.error("❌ Erro ao realizar cadastro: " + error.message);
    }
    setLoading(false);
  };

  const especialidades = getEspecialidades(formData.tipo_mundo);

  const etapasConfig = [
    { numero: 1, titulo: "Dados Empresa", icon: Building2 },
    { numero: 2, titulo: "Responsável", icon: User },
    { numero: 3, titulo: "Endereço", icon: MapPin },
    { numero: 4, titulo: "Especialidades", icon: Stethoscope },
    { numero: 5, titulo: "Documentos", icon: Upload }
  ];

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Tipo de Clínica - TRAVADO pelo vertical */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Tipo de Clínica:</label>
              <div className="p-5 bg-[#0d0d1f] border border-white/5 rounded-2xl relative overflow-hidden group">
                {/* Gradient Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-coral/10 to-brand-orange/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-3xl border border-white/10">
                    {user?.vertical === "ODONTOLOGIA" ? "🦷" : "🩺"}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xl">
                      {user?.vertical === "ODONTOLOGIA" ? "Clínica Odontológica" : "Clínica Médica"}
                    </p>
                    <p className="text-sm text-gray-400">Definido pela sua área de atuação</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção Dados da Empresa */}
            <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-xl text-white shadow-lg shadow-pink-500/20">🏢</div>
                Dados da Empresa
              </h3>
            </div>

            {/* Grid de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Razão Social *</label>
                <input
                  type="text"
                  value={formData.razao_social}
                  onChange={(e) => handleInputChange("razao_social", e.target.value)}
                  placeholder="Clínica Odontológica Silva Ltda"
                  maxLength={120}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{formData.razao_social.length}/120 caracteres</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Nome Fantasia *</label>
                <input
                  type="text"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                  placeholder="Clínica Silva"
                  maxLength={120}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{formData.nome_fantasia.length}/120 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">CNPJ *</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", aplicarMascaraCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Telefone Comercial (opcional)</label>
                <input
                  type="text"
                  value={formData.telefone_comercial}
                  onChange={(e) => handleInputChange("telefone_comercial", aplicarMascaraTelefone(e.target.value))}
                  placeholder="(62) 3333-3333"
                  maxLength={15}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contato@clinica.com"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">WhatsApp *</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", aplicarMascaraTelefone(e.target.value))}
                  placeholder="(62) 99999-9999"
                  maxLength={15}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Seção Responsável */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-xl text-white shadow-lg shadow-orange-500/20">👤</div>
                Responsável
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Nome do Responsável *</label>
                <input
                  type="text"
                  value={formData.nome_responsavel}
                  onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                  placeholder="Dr. João Silva"
                  maxLength={120}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">CPF do Responsável *</label>
                <input
                  type="text"
                  value={formData.cpf_responsavel}
                  onChange={(e) => handleInputChange("cpf_responsavel", aplicarMascaraCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Cargo *</label>
                <input
                  type="text"
                  value={formData.cargo_responsavel}
                  onChange={(e) => handleInputChange("cargo_responsavel", e.target.value)}
                  placeholder="Ex: Proprietário, Diretor Clínico"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-400 mb-2">WhatsApp do Responsável *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-xl">💬</div>
                  <input
                    type="text"
                    value={formData.whatsapp_responsavel}
                    onChange={(e) => handleInputChange("whatsapp_responsavel", aplicarMascaraTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Upload Documento Responsável */}
            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
                Documento do Responsável * <span className="text-xs text-gray-500">(RG ou CNH)</span>
              </label>
              <div className="border border-dashed border-red-500/30 rounded-2xl p-8 text-center hover:border-red-500 hover:bg-red-500/10 transition-all cursor-pointer group">
                <input
                  type="file"
                  id="documento_responsavel"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => handleFileUpload("documento_responsavel", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="documento_responsavel" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
                    <Upload className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-300 font-semibold">Clique para enviar</p>
                  <p className="text-gray-500 text-sm mt-1">PDF, JPG ou PNG</p>
                </label>
                {formData.documento_responsavel && (
                  <p className="text-green-500 text-sm mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Documento enviado!
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Seção Endereço e Localização */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-xl text-white shadow-lg shadow-green-500/20">📍</div>
                Endereço e Localização
              </h3>
            </div>

            {/* CEP */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">CEP *</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", aplicarMascaraCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={buscarCEP}
                  disabled={buscandoCep}
                  className="px-6 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-coral/20 transition-all disabled:opacity-50"
                >
                  {buscandoCep ? "..." : "Buscar"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Endereço *</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua, Avenida..."
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Número *</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Complemento</label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="Sala 101"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Bairro *</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Centro"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Estado *</label>
                <select
                  value={formData.uf}
                  onChange={(e) => {
                    handleInputChange("uf", e.target.value);
                    handleInputChange("cidade", "");
                  }}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-coral focus:ring-1 focus:ring-brand-coral appearance-none cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Cidade *</label>
                <CityAutocomplete
                  value={formData.cidade}
                  onChange={(cidade) => handleInputChange("cidade", cidade)}
                  cidades={cidades}
                  loading={loadingCidades}
                  disabled={!formData.uf}
                  placeholder={!formData.uf ? "Selecione UF primeiro" : "Selecione a cidade"}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Ponto de Referência (opcional)</label>
                <input
                  type="text"
                  value={formData.ponto_referencia}
                  onChange={(e) => handleInputChange("ponto_referencia", e.target.value)}
                  placeholder="Ex: Em frente ao Shopping..."
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>
            </div>

            {/* Link do Google Maps */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Link do Google Maps</label>
              <p className="text-xs text-gray-500 mb-2">Ajuda os profissionais a encontrar sua clínica</p>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🗺️</div>
                <input
                  type="text"
                  value={formData.google_maps_link}
                  onChange={(e) => handleInputChange("google_maps_link", e.target.value)}
                  placeholder="Cole o link do Google Maps aqui"
                  className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowMapsHelp(true)}
                className="text-sm text-brand-coral hover:text-brand-orange font-medium mt-2 flex items-center gap-1 transition-colors">
                ❓ Como conseguir o link do Google Maps?
              </button>
            </div>

            {/* Modal/Tooltip Google Maps */}
            {showMapsHelp && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMapsHelp(false)}>
                <div className="bg-[#13132B] border border-white/10 rounded-3xl p-8 max-w-md shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setShowMapsHelp(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    📍 Como pegar o link do Google Maps
                  </h3>
                  <ol className="space-y-3 text-gray-300 mb-6">
                    <li className="flex gap-3">
                      <span className="font-bold text-brand-coral">1.</span>
                      <span>Abra o Google Maps</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-brand-coral">2.</span>
                      <span>Pesquise sua clínica</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-brand-coral">3.</span>
                      <span>Clique em "Compartilhar"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-brand-coral">4.</span>
                      <span>Clique em "Copiar link"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-brand-coral">5.</span>
                      <span>Cole aqui no campo</span>
                    </li>
                  </ol>
                  <button
                    onClick={() => setShowMapsHelp(false)}
                    className="w-full py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl hover:shadow-lg transition-all">
                    Entendi
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Especialidades */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-xl text-white shadow-lg shadow-purple-500/20">🩺</div>
                Especialidades Atendidas
              </h3>
            </div>

            <p className="text-gray-400 text-sm mb-4">Selecione todas as especialidades que sua clínica oferece:</p>

            {/* Chips selecionados */}
            {formData.especialidades_atendidas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                {formData.especialidades_atendidas.map((esp) => (
                  <span
                    key={esp}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-brand-coral/20 text-brand-coral border border-brand-coral/30 rounded-full text-sm font-medium"
                  >
                    {esp}
                    <button
                      type="button"
                      onClick={() => toggleEspecialidade(esp)}
                      className="text-brand-coral hover:text-white font-bold text-lg leading-none ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-white/10 rounded-xl p-4 bg-[#0a0a1a] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {especialidades.map((esp) => (
                <div key={esp} className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    id={`esp-${esp}`}
                    checked={formData.especialidades_atendidas.includes(esp)}
                    onChange={() => toggleEspecialidade(esp)}
                    className="w-4 h-4 accent-brand-coral bg-[#0a0a1a] border-white/20"
                  />
                  <label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer text-gray-300 w-full">
                    {esp}
                  </label>
                </div>
              ))}
            </div>

            {/* Fotos da Clínica */}
            <div className="mt-8 bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-xl text-white shadow-lg shadow-pink-500/20">📸</div>
                Fotos da Clínica
              </h3>
            </div>

            {/* Foto da Fachada */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-400 mb-2">Foto da Fachada (opcional)</label>
              <div className="border border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-brand-coral hover:bg-white/5 transition-all cursor-pointer group relative">
                <input
                  type="file"
                  id="foto_fachada"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_fachada", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_fachada" className="cursor-pointer block w-full h-full">
                  {formData.foto_fachada ? (
                    <div className="relative h-48 w-full rounded-xl overflow-hidden">
                      <img src={formData.foto_fachada} alt="Fachada" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold">Trocar Foto</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 group-hover:bg-brand-coral/20 flex items-center justify-center transition-all">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-coral" />
                      </div>
                      <p className="text-gray-300 font-semibold">Foto principal da fachada</p>
                      <p className="text-gray-500 text-sm">Mostre sua clínica para os profissionais</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Outras Fotos */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Fotos do Interior (opcional - máx 5)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.fotos_clinica.map((foto, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                    <img src={foto} alt={`Foto ${index}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {formData.fotos_clinica.length < 5 && (
                  <label className="aspect-square border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-coral hover:bg-white/5 transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultiplePhotosUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-2">Adicionar</span>
                  </label>
                )}
              </div>
            </div>

            {/* Instagram */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-400 mb-2">Instagram da Clínica (opcional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500 text-xl">📷</div>
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">@</span>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                  placeholder="suaclinica"
                  className="w-full pl-16 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Tudo pronto!</h2>
              <p className="text-gray-400">Revise seus dados antes de finalizar.</p>
            </div>

            {/* Resumo */}
            <div className="bg-[#0a0a1a] rounded-xl p-6 border border-white/10 space-y-3 text-sm text-gray-300">
              <p><strong className="text-white">Empresa:</strong> {formData.razao_social}</p>
              <p><strong className="text-white">CNPJ:</strong> {formData.cnpj}</p>
              <p><strong className="text-white">Cidade:</strong> {formData.cidade} - {formData.uf}</p>
              <p><strong className="text-white">Responsável:</strong> {formData.nome_responsavel}</p>
              <p><strong className="text-white">Especialidades:</strong> {formData.especialidades_atendidas.length} selecionadas</p>
            </div>

            {/* Aceitar Termos */}
            <div className="border border-white/10 rounded-2xl p-5 hover:border-brand-coral transition-all bg-[#0a0a1a]">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="aceita_termos"
                  checked={formData.aceita_termos}
                  onChange={(e) => handleInputChange("aceita_termos", e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-brand-coral bg-[#0a0a1a] border-white/20"
                />
                <label htmlFor="aceita_termos" className="cursor-pointer text-sm text-gray-400">
                  Li e aceito os <span className="text-brand-coral font-bold underline">Termos de Uso</span> e{" "}
                  <span className="text-brand-coral font-bold underline">Política de Privacidade</span>, declarando que sou o responsável legal pela clínica.
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
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium py-2 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-2xl shadow-brand-coral/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">Cadastro da Clínica</h1>
          <p className="text-gray-400 mt-2">Cadastre sua unidade para contratar profissionais</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressoPercentual}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-brand-coral to-brand-orange shadow-[0_0_10px_rgba(255,107,107,0.5)]"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-3 px-1">
            <span>Etapa {etapaAtual} de {totalEtapas}</span>
            <span className="font-bold text-gray-400">{Math.round(progressoPercentual)}% completo</span>
          </div>
        </div>

        {/* Indicadores de Etapa */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-4 px-1 scrollbar-hide">
          {etapasConfig.map((etapa) => (
            <div key={etapa.numero} className="flex flex-col items-center min-w-[70px]">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${etapaAtual === etapa.numero
                  ? "bg-gradient-to-br from-brand-coral to-brand-orange text-white shadow-lg shadow-brand-coral/30 scale-110"
                  : etapaAtual > etapa.numero
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                    : "bg-white/5 text-gray-500 border border-white/5"
                }`}>
                {etapaAtual > etapa.numero ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <etapa.icon className="w-6 h-6" />
                )}
              </div>
              <span className={`text-xs font-semibold text-center transition-colors ${etapaAtual === etapa.numero ? "text-white" : "text-gray-500"
                }`}>
                {etapa.titulo}
              </span>
            </div>
          ))}
        </div>

        {/* Card do Formulário */}
        <motion.div
          key={etapaAtual}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          <div className="p-6 md:p-8">
            {renderEtapa()}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse md:flex-row gap-4 p-6 bg-[#0a0a1a]/50 border-t border-white/5">
            <button
              onClick={etapaAnterior}
              disabled={etapaAtual === 1}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5"
            >
              Voltar
            </button>

            {etapaAtual < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={finalizarCadastro}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Finalizando..." : "Finalizar Cadastro"}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}