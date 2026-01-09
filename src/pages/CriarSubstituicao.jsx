import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  User,
  MapPin,
  Phone,
  DollarSign,
  FileText,
  Check,
  ArrowLeft,
  ArrowRight,
  Clock,
  Building2,
  AlertCircle,
  Plus,
  Trash2,
  Stethoscope,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import {
  criarSubstituicao,
  publicarSubstituicao
} from "@/components/api/substituicao";
import {
  ESPECIALIDADES,
  PROCEDIMENTOS_ODONTO,
  FORMAS_PAGAMENTO
} from "@/components/constants/substituicao";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";

export default function CriarSubstituicao() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [clinicaUnits, setClinicaUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [formData, setFormData] = useState({
    criado_por_tipo: location.state?.criado_por_tipo || "PROFISSIONAL",
    // Etapa 1 - Tipo de Data
    tipo_data: "",
    data_hora_imediata: "",
    data_especifica: "",
    horario_inicio: "",
    horario_fim: "",
    periodo_inicio: "",
    periodo_fim: "",
    horarios_periodo: [],

    // Etapa 2 - Profissional
    tipo_profissional: "DENTISTA",
    especialidade_necessaria: "",
    tempo_minimo_formado_anos: 0,

    // Etapa 3 - Local
    clinica_id: "",
    unidade_id: "",
    nome_clinica: "",
    endereco_completo: "",
    cidade: "",
    uf: "",
    referencia: "",
    link_maps: "",

    // Etapa 4 - Responsável
    responsavel_nome: "",
    responsavel_cargo: "",
    responsavel_whatsapp: "",
    responsavel_esta_ciente: false,

    // Etapa 5 - Remuneração
    tipo_remuneracao: "",
    valor_diaria: "",
    procedimentos_porcentagem: [],
    quem_paga: "",
    forma_pagamento: "",
    dados_pagamento: {},

    // Etapa 6 - Detalhes
    tipo_atendimento: "",
    pacientes_agendados: [],
    estimativa_pacientes: "",
    tempo_medio_atendimento_minutos: "",
    procedimentos_esperados: [],
    observacoes_atendimento: "",
    materiais_disponiveis: "",
    acesso_sistema: "",
    observacoes: ""
  });

  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Se profissional criando, buscar dados
        if (formData.criado_por_tipo === "PROFISSIONAL") {
          const professionals = await base44.entities.Professional.filter({
            user_id: currentUser.id
          });
          if (professionals.length > 0) {
            setProfessional(professionals[0]);

            // Buscar vínculos com clínicas
            const vinculos = await base44.entities.VinculoProfissionalClinica.filter({
              professional_id: professionals[0].id,
              ativo: true
            });

            if (vinculos.length > 0) {
              const clinicaIds = [...new Set(vinculos.map(v => v.clinica_id))];
              const units = await Promise.all(
                clinicaIds.map(id => base44.entities.CompanyUnit.filter({ id }))
              );
              setClinicaUnits(units.flat());
            }
          }
        }

        // Se clínica criando
        if (formData.criado_por_tipo === "CLINICA") {
          const owners = await base44.entities.CompanyOwner.filter({
            user_id: currentUser.id
          });
          if (owners.length > 0) {
            const units = await base44.entities.CompanyUnit.filter({
              owner_id: owners[0].id,
              ativo: true
            });
            setClinicaUnits(units);
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
      }
    };
    loadData();
  }, [formData.criado_por_tipo]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const substituicao = await criarSubstituicao(data);
      await publicarSubstituicao(substituicao.id);

      // 🚀 WEBHOOK NOVA_SUBSTITUICAO
      try {
        await fetch('http://164.152.59.49:5678/webhook/nova-substituicao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            substituicao_id: substituicao.id,
            clinica_nome: substituicao.nome_clinica,
            especialidade: substituicao.especialidade_necessaria,
            data_inicio: substituicao.data_especifica || substituicao.periodo_inicio || substituicao.data_hora_imediata,
            urgente: substituicao.tipo_data === 'IMEDIATO',
            valor: substituicao.valor_diaria || null,
            tipo_remuneracao: substituicao.tipo_remuneracao,
            cidade: substituicao.cidade,
            uf: substituicao.uf,
            criado_por_tipo: substituicao.criado_por_tipo
          })
        });
      } catch (e) {
        console.error('Erro webhook NOVA_SUBSTITUICAO:', e);
      }

      return substituicao;
    },
    onSuccess: () => {
      toast.success("✅ Vaga publicada com sucesso!");
      navigate(createPageUrl("VagasDisponiveis"));
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar vaga");
    }
  });

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.tipo_data) return false;
        if (formData.tipo_data === "IMEDIATO" && !formData.data_hora_imediata) return false;
        if (formData.tipo_data === "DATA_ESPECIFICA" && (!formData.data_especifica || !formData.horario_inicio || !formData.horario_fim)) return false;
        if (formData.tipo_data === "PERIODO" && (!formData.periodo_inicio || !formData.periodo_fim)) return false;
        return true;
      case 2:
        return formData.especialidade_necessaria !== "";
      case 3:
        return formData.unidade_id && formData.cidade && formData.uf;
      case 4:
        return formData.responsavel_nome && formData.responsavel_whatsapp && formData.responsavel_esta_ciente;
      case 5:
        if (!formData.tipo_remuneracao || !formData.quem_paga || !formData.forma_pagamento) return false;
        if (formData.tipo_remuneracao === "DIARIA" && !formData.valor_diaria) return false;
        if (formData.tipo_remuneracao === "PORCENTAGEM" && formData.procedimentos_porcentagem.length === 0) return false;
        return true;
      case 6:
        // if (!formData.tipo_atendimento) return false; // Detalhes podem ser opcionais
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(6, prev + 1));
      window.scrollTo(0, 0);
    } else {
      toast.error("Preencha todos os campos obrigatórios");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const dataToSend = {
      ...formData,
      criado_por_user_id: user.id,
      profissional_que_sera_substituido_id: formData.criado_por_tipo === "PROFISSIONAL" ? professional?.id : null,
      clinica_id: selectedUnit?.owner_id,
      nome_clinica: selectedUnit?.nome_fantasia,
      endereco_completo: `${selectedUnit?.endereco}, ${selectedUnit?.numero}${selectedUnit?.complemento ? `, ${selectedUnit?.complemento}` : ''} - ${selectedUnit?.bairro}`,
      cidade: selectedUnit?.cidade,
      uf: selectedUnit?.uf,
      link_maps: selectedUnit?.google_maps_link,
      referencia: selectedUnit?.ponto_referencia
    };

    createMutation.mutate(dataToSend);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { number: 1, title: "Data", icon: Calendar },
    { number: 2, title: "Profissional", icon: User },
    { number: 3, title: "Local", icon: MapPin },
    { number: 4, title: "Responsável", icon: Phone },
    { number: 5, title: "Remuneração", icon: DollarSign },
    { number: 6, title: "Detalhes", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-purple-600 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-lg shadow-brand-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {formData.criado_por_tipo === "PROFISSIONAL" ? <Stethoscope className="text-white w-6 h-6" /> : <Building2 className="text-white w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                Nova Substituição
              </h1>
              <p className="text-white/80 font-medium">
                {formData.criado_por_tipo === "PROFISSIONAL"
                  ? "Configure sua substituição"
                  : "Busque um profissional"}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-2 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1 min-w-[60px]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/40 scale-110"
                          : "bg-white/5 text-gray-500 border border-white/10"
                      }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-[10px] md:text-xs font-bold text-center ${isActive ? "text-brand-primary" : "text-gray-500"
                      }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block flex-1 h-0.5 mx-2 rounded ${currentStep > step.number ? "bg-green-500" : "bg-white/10"
                      }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl"
            >
              {/* ETAPA 1 - TIPO DE DATA */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-brand-primary" />
                    Quando precisa da substituição?
                  </h2>

                  <div className="space-y-4">
                    {/* IMEDIATO */}
                    <button
                      onClick={() => updateFormData("tipo_data", "IMEDIATO")}
                      className={`w-full p-6 rounded-2xl border transition-all text-left group ${formData.tipo_data === "IMEDIATO"
                          ? "border-red-500 bg-red-500/10"
                          : "border-white/10 bg-white/5 hover:border-red-500/50 hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.tipo_data === "IMEDIATO" ? "bg-red-500 text-white" : "bg-white/10 text-gray-400 group-hover:text-red-400"
                          }`}>
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg mb-1 ${formData.tipo_data === "IMEDIATO" ? "text-red-400" : "text-white"}`}>URGENTE / HOJE</h3>
                          <p className="text-sm text-gray-400">Preciso de alguém agora ou ainda hoje</p>
                        </div>
                        {formData.tipo_data === "IMEDIATO" && (
                          <Check className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                    </button>

                    {formData.tipo_data === "IMEDIATO" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pl-4"
                      >
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                          Data e Hora de Início
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.data_hora_imediata}
                          onChange={(e) => updateFormData("data_hora_imediata", e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-red-500 outline-none [color-scheme:dark]"
                        />
                      </motion.div>
                    )}

                    {/* DATA ESPECÍFICA */}
                    <button
                      onClick={() => updateFormData("tipo_data", "DATA_ESPECIFICA")}
                      className={`w-full p-6 rounded-2xl border transition-all text-left group ${formData.tipo_data === "DATA_ESPECIFICA"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-white/10 bg-white/5 hover:border-yellow-500/50 hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.tipo_data === "DATA_ESPECIFICA" ? "bg-yellow-500 text-white" : "bg-white/10 text-gray-400 group-hover:text-yellow-400"
                          }`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg mb-1 ${formData.tipo_data === "DATA_ESPECIFICA" ? "text-yellow-400" : "text-white"}`}>DATA ESPECÍFICA</h3>
                          <p className="text-sm text-gray-400">Em um dia e horário marcado</p>
                        </div>
                        {formData.tipo_data === "DATA_ESPECIFICA" && (
                          <Check className="w-6 h-6 text-yellow-500" />
                        )}
                      </div>
                    </button>

                    {formData.tipo_data === "DATA_ESPECIFICA" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pl-4 space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Data</label>
                          <input
                            type="date"
                            value={formData.data_especifica}
                            onChange={(e) => updateFormData("data_especifica", e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [color-scheme:dark]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Horário Início</label>
                            <input
                              type="time"
                              value={formData.horario_inicio}
                              onChange={(e) => updateFormData("horario_inicio", e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [color-scheme:dark]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Horário Fim</label>
                            <input
                              type="time"
                              value={formData.horario_fim}
                              onChange={(e) => updateFormData("horario_fim", e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* PERÍODO */}
                    <button
                      onClick={() => updateFormData("tipo_data", "PERIODO")}
                      className={`w-full p-6 rounded-2xl border transition-all text-left group ${formData.tipo_data === "PERIODO"
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.tipo_data === "PERIODO" ? "bg-blue-500 text-white" : "bg-white/10 text-gray-400 group-hover:text-blue-400"
                          }`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg mb-1 ${formData.tipo_data === "PERIODO" ? "text-blue-400" : "text-white"}`}>PERÍODO</h3>
                          <p className="text-sm text-gray-400">Vários dias (férias, licença)</p>
                        </div>
                        {formData.tipo_data === "PERIODO" && (
                          <Check className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                    </button>

                    {formData.tipo_data === "PERIODO" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pl-4 space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Data Início</label>
                            <input
                              type="date"
                              value={formData.periodo_inicio}
                              onChange={(e) => updateFormData("periodo_inicio", e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [color-scheme:dark]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Data Fim</label>
                            <input
                              type="date"
                              value={formData.periodo_fim}
                              onChange={(e) => updateFormData("periodo_fim", e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA 2 - PROFISSIONAL NECESSÁRIO */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <User className="w-6 h-6 text-brand-primary" />
                    Qual profissional você precisa?
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Especialidade Necessária *
                      </label>
                      <select
                        value={formData.especialidade_necessaria}
                        onChange={(e) => updateFormData("especialidade_necessaria", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [&>option]:bg-[#13132B]"
                      >
                        <option value="">Selecione...</option>
                        {ESPECIALIDADES.map(esp => (
                          <option key={esp} value={esp}>{esp}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Tempo Mínimo de Formado (anos)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.tempo_minimo_formado_anos}
                        onChange={(e) => updateFormData("tempo_minimo_formado_anos", parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                        placeholder="0 = sem requisito"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Deixe 0 para aceitar recém-formados
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 3 - LOCAL */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-brand-primary" />
                    Onde será a substituição?
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Selecione a Clínica/Unidade *
                      </label>
                      {clinicaUnits.length === 0 ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          <p className="text-sm text-gray-300">
                            Nenhuma clínica vinculada encontrada.
                            {formData.criado_por_tipo === "PROFISSIONAL"
                              ? " Você precisa estar vinculado a uma clínica para criar vagas."
                              : " Cadastre uma unidade primeiro."}
                          </p>
                        </div>
                      ) : (
                        <select
                          value={formData.unidade_id}
                          onChange={(e) => {
                            const unit = clinicaUnits.find(u => u.id === e.target.value);
                            setSelectedUnit(unit);
                            updateFormData("unidade_id", e.target.value);
                          }}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [&>option]:bg-[#13132B]"
                        >
                          <option value="">Selecione...</option>
                          {clinicaUnits.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.nome_fantasia} - {unit.cidade}/{unit.uf}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {selectedUnit && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-brand-primary/10 rounded-2xl p-6 border border-brand-primary/20"
                      >
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-brand-primary" />
                          Informações da Clínica
                        </h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <p><strong className="text-white">Nome:</strong> {selectedUnit.nome_fantasia}</p>
                          <p><strong className="text-white">Endereço:</strong> {selectedUnit.endereco}, {selectedUnit.numero}</p>
                          <p><strong className="text-white">Bairro:</strong> {selectedUnit.bairro}</p>
                          <p><strong className="text-white">Cidade:</strong> {selectedUnit.cidade}/{selectedUnit.uf}</p>
                          {selectedUnit.ponto_referencia && (
                            <p><strong className="text-white">Referência:</strong> {selectedUnit.ponto_referencia}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA 4 - RESPONSÁVEL */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <Phone className="w-6 h-6 text-brand-primary" />
                    Responsável pela confirmação
                  </h2>

                  <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-brand-primary flex-shrink-0" />
                      <p className="text-sm text-gray-300">
                        Após escolher um candidato, enviaremos um WhatsApp para esta pessoa confirmar a substituição.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Nome do Responsável *
                      </label>
                      <input
                        type="text"
                        value={formData.responsavel_nome}
                        onChange={(e) => updateFormData("responsavel_nome", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                        placeholder="Ex: Dr. João Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Cargo/Função *
                      </label>
                      <select
                        value={formData.responsavel_cargo}
                        onChange={(e) => updateFormData("responsavel_cargo", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [&>option]:bg-[#13132B]"
                      >
                        <option value="">Selecione...</option>
                        <option value="PROPRIETARIO">Proprietário</option>
                        <option value="GERENTE">Gerente</option>
                        <option value="COORDENADOR">Coordenador</option>
                        <option value="DENTISTA_RESPONSAVEL">Dentista Responsável</option>
                        <option value="SECRETARIA">Secretária</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={formData.responsavel_whatsapp}
                        onChange={(e) => updateFormData("responsavel_whatsapp", e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                        placeholder="11999999999"
                        maxLength="11"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Apenas números (11 dígitos)
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.responsavel_esta_ciente}
                          onChange={(e) => updateFormData("responsavel_esta_ciente", e.target.checked)}
                          className="w-5 h-5 mt-1 rounded border-white/30 bg-white/10 checked:bg-brand-primary accent-brand-primary"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">
                            ✅ Confirmo que esta pessoa está CIENTE *
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            O responsável receberá um WhatsApp para confirmar ou rejeitar a substituição
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 5 - REMUNERAÇÃO */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-brand-primary" />
                    Como será a remuneração?
                  </h2>

                  <div className="space-y-6">
                    {/* Tipo Remuneração */}
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Tipo de Remuneração *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => updateFormData("tipo_remuneracao", "DIARIA")}
                          className={`p-4 rounded-xl border transition-all text-left ${formData.tipo_remuneracao === "DIARIA"
                              ? "border-green-500 bg-green-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                          <DollarSign className={`w-8 h-8 mx-auto mb-2 ${formData.tipo_remuneracao === "DIARIA" ? "text-green-500" : "text-gray-400"}`} />
                          <p className={`font-bold text-center ${formData.tipo_remuneracao === "DIARIA" ? "text-green-500" : "text-white"}`}>Diária Fixa</p>
                          <p className="text-xs text-gray-500 text-center mt-1">Valor por dia</p>
                        </button>
                        <button
                          onClick={() => updateFormData("tipo_remuneracao", "PORCENTAGEM")}
                          className={`p-4 rounded-xl border transition-all text-left ${formData.tipo_remuneracao === "PORCENTAGEM"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                          <DollarSign className={`w-8 h-8 mx-auto mb-2 ${formData.tipo_remuneracao === "PORCENTAGEM" ? "text-blue-500" : "text-gray-400"}`} />
                          <p className={`font-bold text-center ${formData.tipo_remuneracao === "PORCENTAGEM" ? "text-blue-500" : "text-white"}`}>Porcentagem</p>
                          <p className="text-xs text-gray-500 text-center mt-1">% por procedimento</p>
                        </button>
                      </div>
                    </div>

                    {/* Se Diária */}
                    {formData.tipo_remuneracao === "DIARIA" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                          Valor da Diária *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                            R$
                          </span>
                          <input
                            type="number"
                            value={formData.valor_diaria}
                            onChange={(e) => updateFormData("valor_diaria", e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-green-500 outline-none"
                            placeholder="500.00"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Se Porcentagem */}
                    {formData.tipo_remuneracao === "PORCENTAGEM" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-300">
                            Procedimentos e Porcentagens *
                          </label>
                          <button
                            onClick={() => {
                              updateFormData("procedimentos_porcentagem", [
                                ...formData.procedimentos_porcentagem,
                                { procedimento: "", porcentagem: "" }
                              ]);
                            }}
                            className="px-3 py-1 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/30 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        </div>

                        {formData.procedimentos_porcentagem.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <select
                              value={item.procedimento}
                              onChange={(e) => {
                                const updated = [...formData.procedimentos_porcentagem];
                                updated[index].procedimento = e.target.value;
                                updateFormData("procedimentos_porcentagem", updated);
                              }}
                              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [&>option]:bg-[#13132B]"
                            >
                              <option value="">Selecione...</option>
                              {PROCEDIMENTOS_ODONTO.map(proc => (
                                <option key={proc.id} value={proc.label}>{proc.label}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={item.porcentagem}
                              onChange={(e) => {
                                const updated = [...formData.procedimentos_porcentagem];
                                updated[index].porcentagem = e.target.value;
                                updateFormData("procedimentos_porcentagem", updated);
                              }}
                              className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                              placeholder="50"
                            />
                            <span className="flex items-center font-bold text-gray-500">%</span>
                            <button
                              onClick={() => {
                                const updated = formData.procedimentos_porcentagem.filter((_, i) => i !== index);
                                updateFormData("procedimentos_porcentagem", updated);
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Quem Paga */}
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Quem paga a substituição? *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => updateFormData("quem_paga", "DENTISTA")}
                          disabled={formData.criado_por_tipo === "CLINICA"}
                          className={`p-4 rounded-xl border transition-all ${formData.quem_paga === "DENTISTA"
                              ? "border-brand-primary bg-brand-primary/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                            } ${formData.criado_por_tipo === "CLINICA" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <p className="font-bold text-white">👨‍⚕️ Dentista</p>
                          <p className="text-xs text-gray-400 mt-1">Eu pago</p>
                        </button>
                        <button
                          onClick={() => updateFormData("quem_paga", "CLINICA")}
                          className={`p-4 rounded-xl border transition-all ${formData.quem_paga === "CLINICA"
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                          <p className="font-bold text-white">🏥 Clínica</p>
                          <p className="text-xs text-gray-400 mt-1">Clínica paga</p>
                        </button>
                      </div>
                    </div>

                    {/* Forma Pagamento */}
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Forma de Pagamento *
                      </label>
                      <select
                        value={formData.forma_pagamento}
                        onChange={(e) => updateFormData("forma_pagamento", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [&>option]:bg-[#13132B]"
                      >
                        <option value="">Selecione...</option>
                        {FORMAS_PAGAMENTO.map(forma => (
                          <option key={forma.value} value={forma.value}>{forma.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 6 - DETALHES E RESUMO */}
              {currentStep === 6 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-brand-primary" />
                    Resumo e Detalhes
                  </h2>

                  <div className="space-y-6">
                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Observações Gerais (Opcional)
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => updateFormData("observacoes", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none h-32 resize-none"
                        placeholder="Informações adicionais importantes..."
                      ></textarea>
                    </div>

                    {/* Resumo */}
                    <div className="bg-gradient-to-br from-brand-primary/20 to-purple-600/20 rounded-2xl p-6 border border-brand-primary/20 text-white">
                      <h3 className="font-black text-lg mb-4 text-white">📋 RESUMO DA VAGA</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tipo:</span>
                          <span className="font-bold text-white">
                            {formData.criado_por_tipo === "PROFISSIONAL" ? "👨‍⚕️ Profissional" : "🏥 Clínica"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quando:</span>
                          <span className="font-bold text-white">
                            {formData.tipo_data === "IMEDIATO" && "🚨 IMEDIATO"}
                            {formData.tipo_data === "DATA_ESPECIFICA" && `📅 ${formData.data_especifica}`}
                            {formData.tipo_data === "PERIODO" && `📊 ${formData.periodo_inicio} a ${formData.periodo_fim}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Especialidade:</span>
                          <span className="font-bold text-white">{formData.especialidade_necessaria}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Local:</span>
                          <span className="font-bold text-white">{selectedUnit?.nome_fantasia}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Remuneração:</span>
                          <span className="font-bold text-white">
                            {formData.tipo_remuneracao === "DIARIA" && `R$ ${formData.valor_diaria}`}
                            {formData.tipo_remuneracao === "PORCENTAGEM" && "% por procedimento"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quem paga:</span>
                          <span className="font-bold text-white">
                            {formData.quem_paga === "DENTISTA" ? "👨‍⚕️ Dentista" : "🏥 Clínica"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          )}

          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${validateStep(currentStep)
                  ? "bg-gradient-to-r from-brand-primary to-purple-600 text-white hover:shadow-xl hover:shadow-brand-primary/20"
                  : "bg-white/5 text-gray-400 cursor-not-allowed border border-white/10"
                }`}
            >
              Próximo
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !validateStep(6)}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${validateStep(6) && !createMutation.isPending
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:shadow-green-500/20"
                  : "bg-white/5 text-gray-400 cursor-not-allowed border border-white/10"
                }`}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  PUBLICAR VAGA
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}