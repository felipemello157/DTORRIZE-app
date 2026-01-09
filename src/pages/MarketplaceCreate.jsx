import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Camera,
  Phone,
  AlertCircle,
  Upload,
  X,
  Info
} from "lucide-react";
import { getCatalogo, getCamposDinamicos } from "@/components/marketplace/catalogoMarketplace";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userWhatsApp, setUserWhatsApp] = useState("");

  const [formData, setFormData] = useState({
    tipo_mundo: "",
    categoria: "",
    subcategoria: "",
    titulo_item: "",
    descricao: "",
    descricao_odontologia: "",
    descricao_medicina: "",
    marca: "",
    condicao: "",
    ano_fabricacao: "",
    especificacoes: {},
    preco: "",
    preco_com_desconto: "",
    preco_mercado: "",
    campo_promocional: "",
    informacoes_frete: {
      frete_gratis: false,
      valor_frete: "",
      prazo_entrega: "",
      observacoes: ""
    },
    formas_pagamento: [],
    cobertura_entrega: "LOCAL",
    link_site: "",
    localizacao: "",
    cidade: "",
    uf: "",
    telefone_contato: "",
    whatsapp_visivel: false,
    whatsapp_verificado: false,
    foto_frontal: "",
    foto_lateral: "",
    foto_placa: "",
    fotos: [],
    video_url: "",
    flag_sem_foto_placa: false
  });

  const totalEtapas = 6;

  // Detectar usuário e tipo
  useEffect(() => {
    const detectUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Redirecionar se não completou onboarding
        if (!currentUser.vertical || !currentUser.tipo_conta) {
          navigate(createPageUrl("OnboardingVertical"));
          return;
        }

        let tipoDetectado = currentUser.tipo_conta;
        let telefone = "";
        let areaForcada = currentUser.vertical; // SEMPRE partir do vertical do user

        // Buscar dados específicos
        if (currentUser.tipo_conta === "PROFISSIONAL") {
          const profs = await base44.entities.Professional.filter({ user_id: currentUser.id });
          if (profs.length > 0) {
            telefone = profs[0].whatsapp;
          }
          // Profissional NUNCA escolhe tipo_mundo, vem do vertical
        } else if (currentUser.tipo_conta === "CLINICA") {
          const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
          if (owners.length > 0) {
            const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
            if (units.length > 0) {
              telefone = units[0].whatsapp;
              areaForcada = units[0].tipo_mundo; // Clínica pode ter tipo_mundo específico
            }
          }
          // Se não encontrou unidade, usa vertical do user
        } else if (currentUser.tipo_conta === "FORNECEDOR") {
          const suppliers = await base44.entities.Supplier.filter({ user_id: currentUser.id });
          if (suppliers.length > 0) {
            telefone = suppliers[0].whatsapp;
            // Fornecedor: se area_atuacao = "AMBOS", pode escolher; senão, travado
            areaForcada = suppliers[0].area_atuacao === "AMBOS" ? currentUser.vertical : suppliers[0].area_atuacao;
          }
        }

        setUserType(tipoDetectado);
        setUserWhatsApp(telefone);
        setFormData(prev => ({
          ...prev,
          tipo_mundo: areaForcada,
          telefone_contato: telefone,
          whatsapp_verificado: !!telefone
        }));
      } catch (error) {
        // MOCK DATA (LOCALHOST)
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          const mockUser = {
            id: "mock-user-123",
            full_name: "Dev Localhost",
            tipo_conta: "PROFISSIONAL",
            vertical: "ODONTOLOGIA",
            whatsapp_verified: true,
            whatsapp_e164: "+5511999999999"
          };
          setUser(mockUser);
          setUserType("PROFISSIONAL");
          setUserWhatsApp("11999999999");
          setFormData(prev => ({
            ...prev,
            tipo_mundo: "ODONTOLOGIA",
            telefone_contato: "11999999999",
            whatsapp_verificado: true
          }));
        }
      }
    };
    detectUser();
  }, []);

  // Mutation para criar
  const createItemMutation = useMutation({
    mutationFn: async (itemData) => {
      const { calcularScoresCompletos } = await import("@/components/marketplace/scoreEngine");

      // Calcular scores completos
      const scores = calcularScoresCompletos(itemData, {
        identidade_verificada: false,
        media_avaliacoes: 0,
        taxa_resposta_rapida: false,
        total_vendas: 0,
        dias_cadastrado: 0
      });

      const dadosCompletos = {
        ...itemData,
        score_anuncio: scores.score_anuncio,
        score_produto: scores.score_produto,
        score_vendedor: scores.score_vendedor,
        score_ranking: scores.score_ranking,
        pode_destacar: scores.pode_destacar,
        bloqueado_auto: !scores.pode_exibir,
        motivo_bloqueio: scores.motivos_restricao.join("; ") || null,
        status: !scores.pode_exibir ? "SUSPENSO" : "ATIVO"
      };

      return await base44.entities.MarketplaceItem.create(dadosCompletos);
    },
    onSuccess: async (novoItem) => {
      queryClient.invalidateQueries({ queryKey: ["marketplaceItems"] });

      // Processar radares
      try {
        const { processarNotificacoesRadar } = await import("@/components/marketplace/radarMatcher");
        const totalMatches = await processarNotificacoesRadar(novoItem, base44, user.id);

        if (totalMatches > 0) {
          toast.success(`✅ Anúncio publicado! ${totalMatches} radar(es) notificado(s)!`);
        } else {
          toast.success("✅ Anúncio publicado com sucesso!");
        }
      } catch (error) {
        toast.success("✅ Anúncio publicado com sucesso!");
      }

      navigate(createPageUrl("Marketplace"));
    },
    onError: (error) => {
      toast.error("Erro ao criar anúncio: " + error.message);
    }
  });

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleEspecificacaoChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      especificacoes: { ...prev.especificacoes, [campo]: valor }
    }));
  };

  const handleFileUpload = async (campo, file) => {
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Apenas imagens JPG/PNG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange(campo, file_url);

      // Adicionar também ao array fotos
      if (campo.startsWith("foto_")) {
        setFormData(prev => ({
          ...prev,
          fotos: [...new Set([...prev.fotos, file_url])] // Evitar duplicatas
        }));
      }

      toast.success("Foto enviada!");
    } catch (error) {
      toast.error("Erro ao enviar: " + error.message);
    }
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.categoria || !formData.subcategoria) {
          toast.error("Selecione categoria e subcategoria");
          return false;
        }
        return true;
      case 2:
        if (!formData.titulo_item.trim() || formData.titulo_item.length < 10) {
          toast.error("Título deve ter no mínimo 10 caracteres");
          return false;
        }
        if (!formData.descricao.trim() || formData.descricao.length < 30) {
          toast.error("Descrição deve ter no mínimo 30 caracteres");
          return false;
        }
        if (!formData.marca.trim()) {
          toast.error("Preencha a marca");
          return false;
        }
        if (!formData.condicao) {
          toast.error("Selecione a condição");
          return false;
        }

        // Validar campos dinâmicos obrigatórios
        const camposDinamicos = getCamposDinamicos(formData.tipo_mundo, formData.subcategoria);
        for (const campo of camposDinamicos) {
          if (campo.obrigatorio && !formData.especificacoes[campo.campo]) {
            toast.error(`Campo obrigatório: ${campo.label}`);
            return false;
          }
        }
        return true;
      case 3:
        if (!formData.foto_frontal || !formData.foto_lateral) {
          toast.error("Envie pelo menos as fotos frontal e lateral");
          return false;
        }
        return true;
      case 4:
        if (!formData.preco || parseFloat(formData.preco) <= 0) {
          toast.error("Preencha um preço válido");
          return false;
        }
        return true;
      case 5:
        if (!formData.cidade || !formData.uf) {
          toast.error("Preencha a localização");
          return false;
        }
        return true;
      case 6:
        if (!formData.telefone_contato) {
          toast.error("Número de contato é obrigatório");
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

  const finalizarAnuncio = async () => {
    if (!validarEtapa(5)) return;

    const localizacao = `${formData.cidade} - ${formData.uf}`;

    // Montar array de fotos
    const todasFotos = [
      formData.foto_frontal,
      formData.foto_lateral,
      formData.foto_placa
    ].filter(Boolean);

    // Usar WhatsApp verificado se visível
    const telefoneContato = formData.whatsapp_visivel && user?.whatsapp_e164
      ? user.whatsapp_e164.replace("+55", "")
      : formData.telefone_contato;

    const dadosAnuncio = {
      tipo_mundo: formData.tipo_mundo,
      categoria: formData.categoria,
      subcategoria: formData.subcategoria,
      titulo_item: formData.titulo_item.trim(),
      descricao: formData.descricao.trim(),
      marca: formData.marca.trim(),
      condicao: formData.condicao,
      ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao) : null,
      especificacoes: formData.especificacoes,
      preco: parseFloat(formData.preco),
      preco_com_desconto: formData.preco_com_desconto ? parseFloat(formData.preco_com_desconto) : null,
      preco_mercado: formData.preco_mercado ? parseFloat(formData.preco_mercado) : null,
      campo_promocional: formData.campo_promocional || null,
      descricao_odontologia: formData.descricao_odontologia || null,
      descricao_medicina: formData.descricao_medicina || null,
      informacoes_frete: formData.informacoes_frete,
      formas_pagamento: formData.formas_pagamento,
      cobertura_entrega: formData.cobertura_entrega,
      link_site: formData.link_site || null,
      localizacao,
      telefone_contato: telefoneContato,
      whatsapp_visivel: formData.whatsapp_visivel,
      whatsapp_verificado: user?.whatsapp_verified || false,
      foto_frontal: formData.foto_frontal,
      foto_lateral: formData.foto_lateral,
      foto_placa: formData.foto_placa || null,
      fotos: todasFotos,
      video_url: formData.video_url || null,
      flag_sem_foto_placa: !formData.foto_placa,
      anunciante_id: user.id,
      anunciante_tipo: userType,
      anunciante_nome: user.full_name
    };

    createItemMutation.mutate(dadosAnuncio);
  };

  const catalogo = getCatalogo(formData.tipo_mundo);
  const camposDinamicos = getCamposDinamicos(formData.tipo_mundo, formData.subcategoria);

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-4">Categoria do Produto</h2>

            {/* Área - Travada ou Selecionável */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Área {userType === "PROFISSIONAL" || userType === "CLINICA" ? "(travada pelo seu cadastro)" : ""}
              </label>
              <div className={`p-4 rounded-xl font-bold border border-white/10 ${formData.tipo_mundo === "ODONTOLOGIA"
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                }`}>
                {formData.tipo_mundo === "ODONTOLOGIA" ? "🦷 Odontologia" : "🩺 Medicina"}
              </div>
              {userType === "PROFISSIONAL" || userType === "CLINICA" ? (
                <p className="text-xs text-gray-500 mt-1">
                  Seu anúncio será visível apenas na sua área profissional
                </p>
              ) : null}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Categoria *</label>
              <div className="grid grid-cols-1 gap-3">
                {catalogo.categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      handleInputChange("categoria", cat.id);
                      handleInputChange("subcategoria", "");
                    }}
                    className={`p-4 border rounded-xl text-left transition-all ${formData.categoria === cat.id
                      ? "border-brand-orange bg-brand-orange/10 text-white"
                      : "border-white/10 bg-[#0a0a1a] text-gray-400 hover:border-brand-orange/50 hover:text-white"
                      }`}
                  >
                    <span className="font-bold text-lg">{cat.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategoria */}
            {formData.categoria && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="block text-sm font-semibold text-gray-400 mb-3">Subcategoria *</label>
                <div className="grid grid-cols-2 gap-3">
                  {catalogo.categorias
                    .find(c => c.id === formData.categoria)
                    ?.subcategorias.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleInputChange("subcategoria", sub.id)}
                        className={`p-4 border rounded-xl transition-all ${formData.subcategoria === sub.id
                          ? "border-brand-orange bg-brand-orange/10 text-white"
                          : "border-white/10 bg-[#0a0a1a] text-gray-400 hover:border-brand-orange/50 hover:text-white"
                          }`}
                      >
                        <span className="font-semibold">{sub.nome}</span>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-4">Detalhes do Produto</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Título do Anúncio *</label>
              <input
                type="text"
                value={formData.titulo_item}
                onChange={(e) => handleInputChange("titulo_item", e.target.value)}
                placeholder="Ex: Autoclave Cristófoli 12 Litros - Revisada"
                maxLength={100}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.titulo_item.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Descrição Completa *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva detalhadamente o produto, estado de conservação, motivo da venda, etc."
                className="w-full min-h-[150px] px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.descricao.length}/1000</p>
            </div>

            {/* Se AMBOS, pedir descrições específicas */}
            {formData.tipo_mundo === "AMBOS" && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Produto para AMBAS áreas - Descrições específicas (opcional)
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Descrição para Odontologia</label>
                  <textarea
                    value={formData.descricao_odontologia}
                    onChange={(e) => handleInputChange("descricao_odontologia", e.target.value)}
                    placeholder="Detalhes específicos para uso odontológico..."
                    className="w-full min-h-[80px] px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 transition-all outline-none resize-none"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Descrição para Medicina</label>
                  <textarea
                    value={formData.descricao_medicina}
                    onChange={(e) => handleInputChange("descricao_medicina", e.target.value)}
                    placeholder="Detalhes específicos para uso médico..."
                    className="w-full min-h-[80px] px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500 transition-all outline-none resize-none"
                    maxLength={500}
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Marca *</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  placeholder="Ex: Cristófoli, Dabi Atlante"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Ano de Fabricação</label>
                <input
                  type="number"
                  value={formData.ano_fabricacao}
                  onChange={(e) => handleInputChange("ano_fabricacao", e.target.value)}
                  placeholder="2020"
                  min="1980"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Condição *</label>
              <div className="grid grid-cols-3 gap-3">
                {["NOVO", "SEMINOVO", "USADO"].map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleInputChange("condicao", cond)}
                    className={`py-3 px-4 border rounded-xl font-bold transition-all ${formData.condicao === cond
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-white/10 bg-[#0a0a1a] text-gray-400 hover:border-brand-orange/50 hover:text-white"
                      }`}
                  >
                    {cond === "NOVO" ? "Novo" : cond === "SEMINOVO" ? "Seminovo" : "Usado"}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos Dinâmicos */}
            {camposDinamicos.length > 0 && (
              <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Especificações Técnicas
                </h3>
                <div className="space-y-4">
                  {camposDinamicos.map((campo) => (
                    <div key={campo.campo}>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">
                        {campo.label} {campo.obrigatorio && <span className="text-red-400">*</span>}
                      </label>

                      {campo.tipo === "text" && (
                        <input
                          type="text"
                          value={formData.especificacoes[campo.campo] || ""}
                          onChange={(e) => handleEspecificacaoChange(campo.campo, e.target.value)}
                          className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange transition-all outline-none"
                        />
                      )}

                      {campo.tipo === "number" && (
                        <input
                          type="number"
                          value={formData.especificacoes[campo.campo] || ""}
                          onChange={(e) => handleEspecificacaoChange(campo.campo, e.target.value)}
                          min="0"
                          className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange transition-all outline-none"
                        />
                      )}

                      {campo.tipo === "select" && (
                        <div className="relative">
                          <select
                            value={formData.especificacoes[campo.campo] || ""}
                            onChange={(e) => handleEspecificacaoChange(campo.campo, e.target.value)}
                            className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange appearance-none cursor-pointer transition-all outline-none"
                          >
                            <option value="">Selecione</option>
                            {campo.opcoes.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            ▼
                          </div>
                        </div>
                      )}

                      {campo.tipo === "boolean" && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleEspecificacaoChange(campo.campo, true)}
                            className={`flex-1 py-3 border rounded-xl font-bold transition-all ${formData.especificacoes[campo.campo] === true
                              ? "border-green-500 bg-green-500/20 text-green-400"
                              : "border-white/10 bg-[#0a0a1a] text-gray-400 hover:border-white/30"
                              }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEspecificacaoChange(campo.campo, false)}
                            className={`flex-1 py-3 border rounded-xl font-bold transition-all ${formData.especificacoes[campo.campo] === false
                              ? "border-red-500 bg-red-500/20 text-red-400"
                              : "border-white/10 bg-[#0a0a1a] text-gray-400 hover:border-white/30"
                              }`}
                          >
                            Não
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Fotos do Produto</h2>
              <span className="text-sm px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full border border-brand-orange/20">
                Máximo 5MB por foto
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Frontal */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-300">Foto Frontal *</label>
                <div className="relative aspect-square">
                  {formData.foto_frontal ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-green-500/50 relative group">
                      <img src={formData.foto_frontal} alt="Frontal" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleInputChange("foto_frontal", "")}
                        className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-lg text-xs font-bold text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Principal
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-white/5 transition-all text-gray-500 hover:text-white group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-brand-orange/20 transition-all">
                        <Camera className="w-6 h-6 group-hover:text-brand-orange" />
                      </div>
                      <span className="text-sm font-bold">Adicionar Foto</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload("foto_frontal", e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>

              {/* Lateral */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-300">Foto Lateral *</label>
                <div className="relative aspect-square">
                  {formData.foto_lateral ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 relative group">
                      <img src={formData.foto_lateral} alt="Lateral" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleInputChange("foto_lateral", "")}
                        className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-white/5 transition-all text-gray-500 hover:text-white group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-brand-orange/20 transition-all">
                        <Camera className="w-6 h-6 group-hover:text-brand-orange" />
                      </div>
                      <span className="text-sm font-bold">Adicionar Foto</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload("foto_lateral", e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>

              {/* Placa/Serial (Opcional, mas recomendado) */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-300 flex items-center justify-between">
                  <span>Foto Placa/Serial</span>
                  <span className="text-xs text-brand-orange font-normal">Recomendado</span>
                </label>
                <div className="relative aspect-square">
                  {formData.foto_placa ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 relative group">
                      <img src={formData.foto_placa} alt="Placa" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleInputChange("foto_placa", "")}
                        className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-white/5 transition-all text-gray-500 hover:text-white group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-brand-orange/20 transition-all">
                        <Camera className="w-6 h-6 group-hover:text-brand-orange" />
                      </div>
                      <span className="text-sm font-bold">Adicionar Foto</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload("foto_placa", e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a1a] rounded-xl p-4 border border-white/10 flex gap-3 text-sm text-gray-400">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p>Fotos nítidas aumentam suas chances de venda em até 3x. Procure um ambiente bem iluminado.</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-4">Definição de Preço</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Preço de Venda (R$) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">R$</span>
                <input
                  type="number"
                  value={formData.preco}
                  onChange={(e) => handleInputChange("preco", e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-2xl font-black text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Preço de Mercado (Comparativo)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">R$</span>
                  <input
                    type="number"
                    value={formData.preco_mercado}
                    onChange={(e) => handleInputChange("preco_mercado", e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-white/30 transition-all outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Aparecerá riscado (ex: <span className="line-through">R$ 5.000</span>)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Link do Fabricante/Referência</label>
                <input
                  type="url"
                  value={formData.link_site}
                  onChange={(e) => handleInputChange("link_site", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-white/30 transition-all outline-none"
                />
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
              <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Dica de Precificação
              </h3>
              <ul className="space-y-2 text-sm text-green-300/80">
                <li>• Produtos seminovos geralmente vendem entre 60-70% do valor de nota.</li>
                <li>• Ofereça um preço competitivo para vender mais rápido.</li>
                <li>• Considere incluir o frete no valor final se possível.</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-4">Localização e Entrega</h2>

            <div className="grid grid-cols-[1fr,100px] gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">UF *</label>
                <div className="relative">
                  <select
                    value={formData.uf}
                    onChange={(e) => handleInputChange("uf", e.target.value)}
                    className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange appearance-none cursor-pointer transition-all outline-none"
                  >
                    <option value="">UF</option>
                    {UFS.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Cobertura de Entrega</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: "LOCAL", label: "Apenas Retirada" },
                  { id: "REGIONAL", label: "Minha Região" },
                  { id: "NACIONAL", label: "Todo Brasil" }
                ].map(opcao => (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => handleInputChange("cobertura_entrega", opcao.id)}
                    className={`py-3 px-4 border rounded-xl font-bold transition-all ${formData.cobertura_entrega === opcao.id
                        ? "border-brand-orange bg-brand-orange/10 text-white"
                        : "border-white/10 bg-[#0a0a1a] text-gray-400 hover:text-white hover:border-white/30"
                      }`}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a1a] rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white">Frete Grátis?</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    informacoes_frete: { ...prev.informacoes_frete, frete_gratis: !prev.informacoes_frete.frete_gratis }
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.informacoes_frete.frete_gratis ? "bg-green-500" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.informacoes_frete.frete_gratis ? "left-7" : "left-1"}`} />
                </button>
              </div>

              {!formData.informacoes_frete.frete_gratis && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Valor Estimado do Frete (Opcional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">R$</span>
                    <input
                      type="number"
                      value={formData.informacoes_frete.valor_frete}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        informacoes_frete: { ...prev.informacoes_frete, valor_frete: e.target.value }
                      }))}
                      className="w-full pl-12 pr-4 py-3 bg-[#13132B] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-white/30 transition-all outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-4">Contato e Finalização</h2>

            <div className="bg-[#13132B] border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-orange" />
                Dados de Contato
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">WhatsApp/Telefone *</label>
                  <input
                    type="text"
                    value={formData.telefone_contato}
                    onChange={(e) => handleInputChange("telefone_contato", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange transition-all outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 bg-[#0a0a1a] p-4 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="whatsapp_visivel"
                    checked={formData.whatsapp_visivel}
                    onChange={(e) => handleInputChange("whatsapp_visivel", e.target.checked)}
                    className="w-5 h-5 rounded border-white/10 bg-[#13132B] text-brand-orange focus:ring-brand-orange"
                  />
                  <label htmlFor="whatsapp_visivel" className="text-sm text-gray-300 font-medium cursor-pointer">
                    Exibir botão de WhatsApp no anúncio
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-coral to-brand-orange rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-orange/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-1">Tudo Pronto!</h3>
                <p className="text-gray-400 text-sm">
                  Ao publicar, seu anúncio passará por uma verificação automática e estará visível em instantes.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-brand-orange"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans selection:bg-brand-orange/30 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-orange/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Novo Anúncio</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="h-2 bg-[#13132B] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-coral to-brand-orange"
              initial={{ width: 0 }}
              animate={{ width: `${(etapaAtual / totalEtapas) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Etapa {etapaAtual} de {totalEtapas}</span>
            <span>{Math.round((etapaAtual / totalEtapas) * 100)}% Concluído</span>
          </div>
        </div>

        {/* Main Form Card */}
        <motion.div
          key={etapaAtual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
        >
          {renderEtapa()}

          {/* Footer Actions */}
          <div className="mt-10 flex items-center gap-4 pt-6 border-t border-white/5">
            {etapaAtual > 1 && (
              <button
                onClick={etapaAnterior}
                className="flex-1 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
              >
                Voltar
              </button>
            )}

            {etapaAtual < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="flex-[2] py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-orange/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Próxima Etapa <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={finalizarAnuncio}
                disabled={createItemMutation.isPending}
                className="flex-[2] py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createItemMutation.isPending ? "Publicando..." : "Publicar Anúncio"}
                {!createItemMutation.isPending && <CheckCircle2 className="w-5 h-5" />}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}