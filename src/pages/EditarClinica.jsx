import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Save,
  Building2,
  MapPin,
  Phone,
  Camera,
  Upload,
  CheckCircle2,
  User,
  Image as ImageIcon,
  Mail
} from "lucide-react";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import CityAutocomplete from "@/components/forms/CityAutocomplete";

export default function EditarClinica() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    tipo_empresa: "",
    tipo_mundo: "",
    nome_responsavel: "",
    cro_responsavel: "",
    crm_responsavel: "",
    documento_responsavel_url: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    ponto_referencia: "",
    google_maps_link: "",
    whatsapp: "",
    telefone_fixo: "",
    email: "",
    foto_fachada_url: "",
    foto_recepcao_url: "",
    foto_consultorio_url: ""
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  // Buscar owner e unit
  const { data: owner } = useQuery({
    queryKey: ["myCompanyOwner"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const result = await base44.entities.CompanyOwner.filter({ user_id: user.id });
      return result[0] || null;
    }
  });

  const { data: unit, isLoading } = useQuery({
    queryKey: ["myCompanyUnit", owner?.id],
    queryFn: async () => {
      if (!owner) return null;
      const result = await base44.entities.CompanyUnit.filter({ owner_id: owner.id });
      return result[0] || null;
    },
    enabled: !!owner
  });

  // Preencher formulário
  useEffect(() => {
    if (unit) {
      setFormData({
        nome_fantasia: unit.nome_fantasia || "",
        razao_social: unit.razao_social || "",
        cnpj: unit.cnpj || "",
        tipo_empresa: unit.tipo_empresa || "",
        tipo_mundo: unit.tipo_mundo || "",
        nome_responsavel: unit.nome_responsavel || "",
        cro_responsavel: unit.cro_responsavel || "",
        crm_responsavel: unit.crm_responsavel || "",
        documento_responsavel_url: unit.documento_responsavel_url || "",
        cep: unit.cep || "",
        endereco: unit.endereco || "",
        numero: unit.numero || "",
        complemento: unit.complemento || "",
        bairro: unit.bairro || "",
        cidade: unit.cidade || "",
        uf: unit.uf || "",
        ponto_referencia: unit.ponto_referencia || "",
        google_maps_link: unit.google_maps_link || "",
        whatsapp: unit.whatsapp || "",
        telefone_fixo: unit.telefone_fixo || "",
        email: unit.email || "",
        foto_fachada_url: unit.foto_fachada_url || "",
        foto_recepcao_url: unit.foto_recepcao_url || "",
        foto_consultorio_url: unit.foto_consultorio_url || ""
      });
    }
  }, [unit]);

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.CompanyUnit.update(unit.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCompanyUnit"] });
      queryClient.invalidateQueries({ queryKey: ["companyUnit"] });
      toast.success("✅ Perfil atualizado com sucesso!");
      navigate(createPageUrl("PerfilClinica"));
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  // Máscaras
  const aplicarMascaraCEP = (value) => {
    return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");
  };

  const aplicarMascaraWhatsApp = (value) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (value) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCNPJ = (value) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d)/, "$1-$2").replace(/(-\d{2})\d+?$/, "$1");
  };

  // Buscar CEP
  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
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
        uf: data.uf || ""
      }));

      toast.success("CEP encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
    setLoadingCep(false);
  };

  // Upload de arquivo
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

  const handleSalvar = async () => {
    // Validações
    if (!formData.nome_fantasia.trim()) {
      toast.error("Preencha o nome fantasia");
      return;
    }
    if (!formData.razao_social.trim()) {
      toast.error("Preencha a razão social");
      return;
    }
    if (!formData.tipo_empresa) {
      toast.error("Selecione o tipo de empresa");
      return;
    }
    if (!formData.tipo_mundo) {
      toast.error("Selecione a área de atuação");
      return;
    }
    if (!formData.nome_responsavel.trim()) {
      toast.error("Preencha o nome do responsável");
      return;
    }
    if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, "").length !== 11) {
      toast.error("Preencha um WhatsApp válido");
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Preencha um email válido");
      return;
    }
    if (!formData.cidade || !formData.uf) {
      toast.error("Preencha cidade e UF");
      return;
    }

    const dadosAtualizados = {
      nome_fantasia: formData.nome_fantasia.trim(),
      razao_social: formData.razao_social.trim(),
      tipo_empresa: formData.tipo_empresa,
      tipo_mundo: formData.tipo_mundo,
      nome_responsavel: formData.nome_responsavel.trim(),
      cro_responsavel: formData.cro_responsavel || "",
      crm_responsavel: formData.crm_responsavel || "",
      documento_responsavel_url: formData.documento_responsavel_url,
      cep: formData.cep.replace(/\D/g, ""),
      endereco: formData.endereco,
      numero: formData.numero,
      complemento: formData.complemento || "",
      bairro: formData.bairro,
      cidade: formData.cidade,
      uf: formData.uf,
      ponto_referencia: formData.ponto_referencia || "",
      google_maps_link: formData.google_maps_link || "",
      whatsapp: formData.whatsapp.replace(/\D/g, ""),
      telefone_fixo: formData.telefone_fixo ? formData.telefone_fixo.replace(/\D/g, "") : "",
      email: formData.email,
      foto_fachada_url: formData.foto_fachada_url || "",
      foto_recepcao_url: formData.foto_recepcao_url || "",
      foto_consultorio_url: formData.foto_consultorio_url || ""
    };

    updateMutation.mutate(dadosAtualizados);
  };

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
            onClick={() => navigate(createPageUrl("PerfilClinica"))}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-orange/20">
              {formData.nome_fantasia?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Editar Clínica</h1>
              <p className="text-gray-400">Mantenha seus dados atualizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
        {/* SEÇÃO 1 - DADOS DA EMPRESA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Dados da Empresa</h2>
              <p className="text-gray-400">Informações principais</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Logo/Foto */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Logo/Foto Principal</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E1E3F] to-black border-2 border-white/10 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden relative group">
                  {formData.nome_fantasia?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <input
                    type="file"
                    id="logo_clinica"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                  />
                  <label
                    htmlFor="logo_clinica"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 hover:border-brand-orange/50 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Apenas leitura (Demo)
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Upload desativado no modo demonstração</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Nome Fantasia *</label>
              <input
                type="text"
                value={formData.nome_fantasia}
                onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                placeholder="Nome da clínica"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Razão Social *</label>
              <input
                type="text"
                value={formData.razao_social}
                onChange={(e) => handleInputChange("razao_social", e.target.value)}
                placeholder="Razão social da empresa"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">CNPJ</label>
              <input
                type="text"
                value={aplicarMascaraCNPJ(formData.cnpj)}
                disabled
                className="w-full px-4 py-4 bg-[#0a0a1a]/50 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">CNPJ não pode ser alterado</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Tipo de Empresa *</label>
                <select
                  value={formData.tipo_empresa}
                  onChange={(e) => handleInputChange("tipo_empresa", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                >
                  <option value="" className="bg-[#13132B]">Selecione</option>
                  <option value="CLINICA" className="bg-[#13132B]">Clínica</option>
                  <option value="CONSULTORIO" className="bg-[#13132B]">Consultório</option>
                  <option value="HOSPITAL" className="bg-[#13132B]">Hospital</option>
                  <option value="LABORATORIO" className="bg-[#13132B]">Laboratório</option>
                  <option value="FORNECEDOR" className="bg-[#13132B]">Fornecedor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Área de Atuação *</label>
                <select
                  value={formData.tipo_mundo}
                  onChange={(e) => handleInputChange("tipo_mundo", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                >
                  <option value="" className="bg-[#13132B]">Selecione</option>
                  <option value="ODONTOLOGIA" className="bg-[#13132B]">🦷 Odontologia</option>
                  <option value="MEDICINA" className="bg-[#13132B]">🩺 Medicina</option>
                  <option value="AMBOS" className="bg-[#13132B]">🦷🩺 Ambos</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SEÇÃO 2 - RESPONSÁVEL TÉCNICO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Responsável Técnico</h2>
              <p className="text-gray-400">Profissional responsável</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Nome do Responsável *</label>
              <input
                type="text"
                value={formData.nome_responsavel}
                onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                placeholder="Dr. João Silva"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">CRO (se Odontologia)</label>
                <input
                  type="text"
                  value={formData.cro_responsavel}
                  onChange={(e) => handleInputChange("cro_responsavel", e.target.value)}
                  placeholder="12345"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">CRM (se Medicina)</label>
                <input
                  type="text"
                  value={formData.crm_responsavel}
                  onChange={(e) => handleInputChange("crm_responsavel", e.target.value)}
                  placeholder="12345"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>
            </div>

            {/* Upload Documento */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Documento do Responsável</label>
              <div className="border border-dashed border-white/20 bg-[#0a0a1a] rounded-2xl p-6 text-center hover:border-brand-orange/50 transition-all cursor-pointer">
                <input
                  type="file"
                  id="doc_responsavel"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => handleFileUpload("documento_responsavel_url", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="doc_responsavel" className="cursor-pointer">
                  {formData.documento_responsavel_url ? (
                    <div>
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold">Documento enviado</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('doc_responsavel').click();
                        }}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-bold rounded-2xl hover:shadow-lg transition-all"
                      >
                        Trocar Documento
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300 font-semibold">Clique para enviar</p>
                      <p className="text-gray-500 text-sm mt-1">PDF, JPG ou PNG</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SEÇÃO 3 - ENDEREÇO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Endereço</h2>
              <p className="text-gray-400">Localização da clínica</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">CEP *</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={aplicarMascaraCEP(formData.cep)}
                  onChange={(e) => handleInputChange("cep", e.target.value.replace(/\D/g, ""))}
                  onBlur={() => buscarCEP(formData.cep)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1 px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
                {loadingCep && (
                  <div className="flex items-center justify-center px-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-orange"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Endereço *</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua, Avenida..."
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Número *</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Complemento</label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="Sala, Andar..."
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Bairro *</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Nome do bairro"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">UF *</label>
                <select
                  value={formData.uf}
                  onChange={(e) => {
                    handleInputChange("uf", e.target.value);
                    handleInputChange("cidade", "");
                  }}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                >
                  <option value="" className="bg-[#13132B]">Selecione</option>
                  {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                    <option key={uf} value={uf} className="bg-[#13132B]">{uf}</option>
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
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Ponto de Referência</label>
              <input
                type="text"
                value={formData.ponto_referencia}
                onChange={(e) => handleInputChange("ponto_referencia", e.target.value)}
                placeholder="Próximo ao shopping..."
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Link Google Maps</label>
              <input
                type="url"
                value={formData.google_maps_link}
                onChange={(e) => handleInputChange("google_maps_link", e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* SEÇÃO 4 - CONTATO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Contato</h2>
              <p className="text-gray-400">Formas de contato</p>
            </div>
          </div>

          <div className="space-y-6">
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
              <label className="block text-sm font-semibold text-gray-400 mb-2">Telefone Fixo</label>
              <input
                type="text"
                value={aplicarMascaraTelefone(formData.telefone_fixo)}
                onChange={(e) => handleInputChange("telefone_fixo", e.target.value.replace(/\D/g, ""))}
                placeholder="(00) 0000-0000"
                maxLength={14}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contato@clinica.com"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* SEÇÃO 5 - FOTOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-brand-orange">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Fotos da Clínica</h2>
              <p className="text-gray-400">Mostre suas instalações</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Foto Fachada */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Fachada</label>
              <div className="border border-dashed border-white/20 bg-[#0a0a1a] rounded-2xl p-4 text-center hover:border-brand-orange/50 transition-all cursor-pointer">
                <input
                  type="file"
                  id="foto_fachada"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_fachada_url", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_fachada" className="cursor-pointer">
                  {formData.foto_fachada_url ? (
                    <div>
                      <img src={formData.foto_fachada_url} alt="Fachada" className="w-full h-32 object-cover rounded-xl mb-2" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('foto_fachada').click();
                        }}
                        className="text-sm px-3 py-1 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                      >
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Enviar foto</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Foto Recepção */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Recepção</label>
              <div className="border border-dashed border-white/20 bg-[#0a0a1a] rounded-2xl p-4 text-center hover:border-brand-orange/50 transition-all cursor-pointer">
                <input
                  type="file"
                  id="foto_recepcao"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_recepcao_url", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_recepcao" className="cursor-pointer">
                  {formData.foto_recepcao_url ? (
                    <div>
                      <img src={formData.foto_recepcao_url} alt="Recepção" className="w-full h-32 object-cover rounded-xl mb-2" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('foto_recepcao').click();
                        }}
                        className="text-sm px-3 py-1 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                      >
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Enviar foto</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Foto Consultório */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Consultório</label>
              <div className="border border-dashed border-white/20 bg-[#0a0a1a] rounded-2xl p-4 text-center hover:border-brand-orange/50 transition-all cursor-pointer">
                <input
                  type="file"
                  id="foto_consultorio"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_consultorio_url", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_consultorio" className="cursor-pointer">
                  {formData.foto_consultorio_url ? (
                    <div>
                      <img src={formData.foto_consultorio_url} alt="Consultório" className="w-full h-32 object-cover rounded-xl mb-2" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('foto_consultorio').click();
                        }}
                        className="text-sm px-3 py-1 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                      >
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Enviar foto</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={() => navigate(createPageUrl("PerfilClinica"))}
            className="px-6 py-4 bg-[#13132B] border border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleSalvar}
            disabled={updateMutation.isPending}
            className="px-8 py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-brand-orange/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}