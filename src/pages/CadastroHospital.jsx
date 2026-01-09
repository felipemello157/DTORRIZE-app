import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  Building2,
  Users,
  Upload,
  CheckCircle,
  Loader2,
  ChevronRight
} from "lucide-react";

const tiposInstituicao = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "REDE", label: "Rede de Clínicas" },
  { value: "UPA", label: "UPA/Pronto Socorro" },
  { value: "CLINICA_GRANDE", label: "Clínica de Grande Porte" },
  { value: "LABORATORIO_REDE", label: "Laboratório/Rede" }
];

const portes = [
  { value: "PEQUENO", label: "Pequeno" },
  { value: "MEDIO", label: "Médio" },
  { value: "GRANDE", label: "Grande" }
];

const areasAtuacao = [
  { value: "ODONTOLOGIA", label: "Odontologia" },
  { value: "MEDICINA", label: "Medicina" },
  { value: "ENFERMAGEM", label: "Enfermagem" },
  { value: "OUTROS", label: "Outros" }
];

export default function CadastroHospital() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    tipo_instituicao: "",
    porte: "",
    numero_leitos: "",
    areas_atuacao: [],
    especialidades_principais: [],
    email: "",
    whatsapp: "",
    telefone: "",
    site: "",
    nome_responsavel_rh: "",
    cargo_responsavel: "",
    email_rh: "",
    cep: "",
    cidade: "",
    uf: "",
    endereco: "",
    numero: "",
    bairro: "",
    logo_url: "",
    documento_url: "",
    aceito_termos: false
  });

  // Máscaras
  const aplicarMascaraCNPJ = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCEP = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  // Buscar CEP
  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData({
          ...formData,
          cep: cep,
          endereco: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || ""
        });
        toast.success("CEP encontrado!");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
  };

  // Toggle área de atuação
  const toggleAreaAtuacao = (area) => {
    const current = formData.areas_atuacao;
    if (current.includes(area)) {
      setFormData({ ...formData, areas_atuacao: current.filter(a => a !== area) });
    } else {
      setFormData({ ...formData, areas_atuacao: [...current, area] });
    }
  };

  // Upload logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      toast.success("✅ Logo enviado!");
    } catch (error) {
      toast.error("Erro ao enviar logo: " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload documento
  const handleDocumentoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setUploadingDoc(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, documento_url: file_url });
      toast.success("✅ Documento enviado!");
    } catch (error) {
      toast.error("Erro ao enviar documento: " + error.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Validações por etapa
  const validarEtapa1 = () => {
    if (!formData.razao_social) {
      toast.error("Preencha a razão social");
      return false;
    }
    if (!formData.nome_fantasia) {
      toast.error("Preencha o nome fantasia");
      return false;
    }
    if (formData.cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("CNPJ inválido");
      return false;
    }
    if (!formData.tipo_instituicao) {
      toast.error("Selecione o tipo de instituição");
      return false;
    }
    if (!formData.porte) {
      toast.error("Selecione o porte");
      return false;
    }
    if (formData.areas_atuacao.length === 0) {
      toast.error("Selecione pelo menos uma área de atuação");
      return false;
    }
    return true;
  };

  const validarEtapa2 = () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Email institucional inválido");
      return false;
    }
    if (formData.whatsapp.replace(/\D/g, "").length !== 11) {
      toast.error("WhatsApp inválido");
      return false;
    }
    if (formData.telefone.replace(/\D/g, "").length !== 10) {
      toast.error("Telefone inválido");
      return false;
    }
    if (!formData.nome_responsavel_rh) {
      toast.error("Preencha o nome do responsável");
      return false;
    }
    if (!formData.cargo_responsavel) {
      toast.error("Preencha o cargo do responsável");
      return false;
    }
    if (!formData.email_rh || !formData.email_rh.includes("@")) {
      toast.error("Email do RH inválido");
      return false;
    }
    return true;
  };

  const validarEtapa3 = () => {
    if (formData.cep.replace(/\D/g, "").length !== 8) {
      toast.error("CEP inválido");
      return false;
    }
    if (!formData.cidade || !formData.uf || !formData.endereco || !formData.numero || !formData.bairro) {
      toast.error("Preencha o endereço completo");
      return false;
    }
    if (!formData.documento_url) {
      toast.error("Envie o documento da instituição");
      return false;
    }
    if (!formData.aceito_termos) {
      toast.error("Você precisa aceitar os termos de uso");
      return false;
    }
    return true;
  };

  const proximaEtapa = () => {
    if (etapa === 1 && !validarEtapa1()) return;
    if (etapa === 2 && !validarEtapa2()) return;
    setEtapa(etapa + 1);
  };

  const etapaAnterior = () => {
    setEtapa(etapa - 1);
  };

  // Mutation criar hospital
  const cadastrarMutation = useMutation({
    mutationFn: async () => {
      if (!validarEtapa3()) throw new Error("Validação falhou");

      const user = await base44.auth.me();

      const dados = {
        user_id: user.id,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        tipo_instituicao: formData.tipo_instituicao,
        porte: formData.porte,
        numero_leitos: formData.numero_leitos ? parseInt(formData.numero_leitos) : undefined,
        areas_atuacao: formData.areas_atuacao,
        especialidades_principais: formData.especialidades_principais.length > 0 ? formData.especialidades_principais : undefined,
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        telefone: formData.telefone.replace(/\D/g, ""),
        site: formData.site || undefined,
        nome_responsavel_rh: formData.nome_responsavel_rh,
        cargo_responsavel: formData.cargo_responsavel,
        email_rh: formData.email_rh,
        cep: formData.cep.replace(/\D/g, ""),
        cidade: formData.cidade,
        uf: formData.uf,
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        logo_url: formData.logo_url || undefined,
        documento_url: formData.documento_url,
        status_cadastro: "PENDENTE"
      };

      return await base44.entities.Hospital.create(dados);
    },
    onSuccess: () => {
      navigate(createPageUrl("CadastroSucesso") + "?tipo=hospital");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar: " + error.message);
    }
  });

  const finalizarCadastro = () => {
    cadastrarMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white py-8 px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-coral/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Cadastro de Hospital/Rede
          </h1>
          <p className="text-gray-400">
            Etapa {etapa} de 3 - {etapa === 1 ? "Dados da Instituição" : etapa === 2 ? "Contato e RH" : "Endereço e Documentos"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((num) => (
              <React.Fragment key={num}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all border-2 ${num <= etapa
                    ? "bg-gradient-to-r from-brand-coral to-brand-orange border-brand-coral text-white shadow-lg"
                    : "bg-[#13132B] border-white/10 text-white/30"
                  }`}>
                  {num < etapa ? <CheckCircle className="w-6 h-6" /> : num}
                </div>
                {num < 3 && (
                  <div className={`h-1 w-16 md:w-24 rounded-full transition-all ${num < etapa ? "bg-gradient-to-r from-brand-coral to-brand-orange" : "bg-white/10"
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6 md:p-8">
          {/* ETAPA 1 */}
          {etapa === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Razão Social *</label>
                  <input
                    type="text"
                    value={formData.razao_social}
                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nome Fantasia *</label>
                  <input
                    type="text"
                    value={formData.nome_fantasia}
                    onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">CNPJ *</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: aplicarMascaraCNPJ(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Tipo de Instituição *</label>
                  <div className="relative">
                    <select
                      value={formData.tipo_instituicao}
                      onChange={(e) => setFormData({ ...formData, tipo_instituicao: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white appearance-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                    >
                      <option value="" className="bg-[#0a0a1a]">Selecione</option>
                      {tiposInstituicao.map((tipo) => (
                        <option key={tipo.value} value={tipo.value} className="bg-[#0a0a1a]">{tipo.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronLeft className="w-5 h-5 rotate-270" style={{ transform: 'rotate(-90deg)' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Porte *</label>
                  <div className="relative">
                    <select
                      value={formData.porte}
                      onChange={(e) => setFormData({ ...formData, porte: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white appearance-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                    >
                      <option value="" className="bg-[#0a0a1a]">Selecione</option>
                      {portes.map((porte) => (
                        <option key={porte.value} value={porte.value} className="bg-[#0a0a1a]">{porte.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronLeft className="w-5 h-5 rotate-270" style={{ transform: 'rotate(-90deg)' }} />
                    </div>
                  </div>
                </div>

                {formData.tipo_instituicao === "HOSPITAL" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Número de Leitos</label>
                    <input
                      type="number"
                      value={formData.numero_leitos}
                      onChange={(e) => setFormData({ ...formData, numero_leitos: e.target.value })}
                      placeholder="Opcional"
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Áreas de Atuação *</label>
                <div className="grid grid-cols-2 gap-3">
                  {areasAtuacao.map((area) => (
                    <button
                      key={area.value}
                      type="button"
                      onClick={() => toggleAreaAtuacao(area.value)}
                      className={`p-3 rounded-xl border font-medium transition-all ${formData.areas_atuacao.includes(area.value)
                          ? "border-brand-coral bg-brand-coral/10 text-brand-coral"
                          : "border-white/10 bg-[#0a0a1a] text-gray-400 hover:border-white/20 hover:text-white"
                        }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Especialidades Principais</label>
                <input
                  type="text"
                  value={formData.especialidades_principais.join(", ")}
                  onChange={(e) => setFormData({ ...formData, especialidades_principais: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Ex: Cardiologia, Ortopedia, Pediatria (separadas por vírgula)"
                  className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* ETAPA 2 */}
          {etapa === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Email Institucional *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">WhatsApp *</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: aplicarMascaraTelefone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Telefone Fixo *</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: aplicarMascaraTelefone(e.target.value) })}
                    placeholder="(00) 0000-0000"
                    maxLength={14}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Site</label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="www.exemplo.com.br"
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2 pt-4 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-coral" />
                    Dados do Responsável (RH)
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome_responsavel_rh}
                    onChange={(e) => setFormData({ ...formData, nome_responsavel_rh: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Cargo *</label>
                  <input
                    type="text"
                    value={formData.cargo_responsavel}
                    onChange={(e) => setFormData({ ...formData, cargo_responsavel: e.target.value })}
                    placeholder="Ex: Gerente de RH"
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Email do RH *</label>
                  <input
                    type="email"
                    value={formData.email_rh}
                    onChange={(e) => setFormData({ ...formData, email_rh: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3 */}
          {etapa === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">CEP *</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => {
                      const valor = aplicarMascaraCEP(e.target.value);
                      setFormData({ ...formData, cep: valor });
                      if (valor.replace(/\D/g, "").length === 8) {
                        buscarCEP(valor);
                      }
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Cidade *</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">UF *</label>
                  <input
                    type="text"
                    value={formData.uf}
                    onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Endereço *</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Número *</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Bairro *</label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Upload de Documentos</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Logo da Instituição</label>
                    {formData.logo_url ? (
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 font-medium">Logo enviado</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className={`flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-white/20 bg-[#0a0a1a] rounded-xl cursor-pointer hover:border-brand-coral/50 hover:bg-white/5 transition-all ${uploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
                              <span className="text-gray-400 font-medium">Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-400 font-medium">Clique para enviar logo</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Documento (CNPJ ou Contrato Social) *</label>
                    {formData.documento_url ? (
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 font-medium">Documento enviado</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleDocumentoUpload}
                          disabled={uploadingDoc}
                          className="hidden"
                          id="doc-upload"
                        />
                        <label
                          htmlFor="doc-upload"
                          className={`flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-white/20 bg-[#0a0a1a] rounded-xl cursor-pointer hover:border-brand-coral/50 hover:bg-white/5 transition-all ${uploadingDoc ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          {uploadingDoc ? (
                            <>
                              <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
                              <span className="text-gray-400 font-medium">Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-400 font-medium">Clique para enviar documento</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aceito_termos}
                    onChange={(e) => setFormData({ ...formData, aceito_termos: e.target.checked })}
                    className="mt-1 w-5 h-5 text-brand-coral rounded border-white/20 bg-[#0a0a1a] focus:ring-brand-coral"
                  />
                  <span className="text-sm text-gray-400">
                    Declaro que as informações são verdadeiras e aceito os{" "}
                    <strong className="text-white">Termos de Uso</strong> e <strong className="text-white">Política de Privacidade</strong>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
            {etapa > 1 && (
              <button
                onClick={etapaAnterior}
                className="flex-1 py-4 bg-[#0a0a1a] border border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-all"
              >
                Voltar
              </button>
            )}
            {etapa < 3 ? (
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-coral/20 hover:scale-[1.02] transition-all"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={finalizarCadastro}
                disabled={cadastrarMutation.isPending}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cadastrarMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Finalizar Cadastro
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}