import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  CheckCircle2,
  Hospital,
  Stethoscope,
  Calendar,
  AlertCircle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function CriarVagaHospital() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hospital, setHospital] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo_vaga: "",
    tipo_profissional: "MEDICO",
    especialidades_aceitas: [],
    exige_experiencia: false,
    tempo_experiencia_minimo: "",
    falar_com: "",
    selecao_dias: "",
    dias_semana: [],
    horario_inicio: "",
    horario_fim: "",
    valor_proposto: "",
    tipo_remuneracao: "",
    aceita_termos: false,
    cidade: "",
    uf: ""
  });

  const totalEtapas = 4;
  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  useEffect(() => {
    const loadHospital = async () => {
      try {
        const user = await base44.auth.me();
        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id });
        if (hospitals[0]) {
          setHospital(hospitals[0]);
          setFormData(prev => ({
            ...prev,
            cidade: hospitals[0].cidade || "",
            uf: hospitals[0].uf || ""
          }));
        }
      } catch (error) {
        toast.error("Erro ao carregar dados do hospital");
      }
    };
    loadHospital();
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

  const aplicarMascaraDinheiro = (value) => {
    const numero = value.replace(/\D/g, "");
    if (!numero) return "";
    const valorEmReais = (parseInt(numero) / 100).toFixed(2);
    return valorEmReais.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const especialidadesMedicina = [
    "Clínico Geral", "Cardiologia", "Dermatologia", "Ginecologia e Obstetrícia",
    "Ortopedia e Traumatologia", "Pediatria", "Psiquiatria", "Oftalmologia", "Neurologia", "Anestesiologia"
  ];

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.titulo.trim() || !formData.descricao.trim() || !formData.tipo_vaga) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 2:
        if (formData.especialidades_aceitas.length === 0 || !formData.falar_com.trim()) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 3:
        if (!formData.selecao_dias || !formData.horario_inicio || !formData.horario_fim) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 4:
        if (!formData.tipo_remuneracao || !formData.aceita_termos) {
          toast.error("Preencha todos os campos obrigatórios");
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
      window.scrollTo(0, 0);
    }
  };

  const etapaAnterior = () => {
    setEtapaAtual(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const publicarVaga = async () => {
    if (!validarEtapa(4) || !hospital) return;

    setLoading(true);
    try {
      const valorPropostoNumero = formData.valor_proposto
        ? parseFloat(formData.valor_proposto.replace(/\./g, "").replace(",", "."))
        : null;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await base44.entities.Job.create({
        unit_id: hospital.id,
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
        status: "ABERTO",
        published_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

      toast.success("✅ Vaga publicada com sucesso!");
      navigate(createPageUrl("MinhasVagasHospital"));
    } catch (error) {
      toast.error("❌ Erro ao publicar vaga: " + error.message);
    }
    setLoading(false);
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Título da Vaga *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Ex: Médico Cardiologista"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Descrição Detalhada *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva a vaga..."
                className="w-full min-h-[150px] px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none resize-none"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Tipo de Vaga *</label>
              <select
                value={formData.tipo_vaga}
                onChange={(e) => handleInputChange("tipo_vaga", e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [&>option]:bg-[#13132B]"
              >
                <option value="">Selecione</option>
                <option value="PLANTAO">Plantão</option>
                <option value="FIXO">Fixo</option>
                <option value="TEMPORARIO">Temporário</option>
              </select>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">Especialidades Aceitas *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {especialidadesMedicina.map((esp) => {
                  const isSelected = formData.especialidades_aceitas.includes(esp);
                  return (
                    <div
                      key={esp}
                      onClick={() => toggleEspecialidade(esp)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                          ? "bg-brand-primary/20 border-brand-primary"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-brand-primary border-brand-primary" : "border-gray-500"
                        }`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                        {esp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Falar com *</label>
              <input
                type="text"
                value={formData.falar_com}
                onChange={(e) => handleInputChange("falar_com", e.target.value)}
                placeholder="Nome do responsável"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">Período *</label>
              <div className="space-y-3">
                {[
                  { value: "ESPECIFICOS", label: "📅 Dias Específicos" },
                  { value: "SEMANA_TODA", label: "🗓️ Semana Toda" },
                  { value: "MES_TODO", label: "📆 Mês Todo" }
                ].map((opcao) => (
                  <div
                    key={opcao.value}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all ${formData.selecao_dias === opcao.value
                        ? "bg-brand-primary/20 border-brand-primary text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    onClick={() => handleInputChange("selecao_dias", opcao.value)}
                  >
                    <span className="font-bold">{opcao.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {formData.selecao_dias === "ESPECIFICOS" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-4 md:grid-cols-7 gap-2"
              >
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, index) => {
                  const isSelected = formData.dias_semana.includes(index);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDiaSemana(index)}
                      className={`p-2 rounded-lg text-sm font-bold transition-all ${isSelected
                          ? "bg-brand-primary text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                    >
                      {dia}
                    </button>
                  );
                })}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Horário Início *</label>
                <input
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => handleInputChange("horario_inicio", e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Horário Fim *</label>
                <input
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => handleInputChange("horario_fim", e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Tipo de Remuneração *</label>
              <select
                value={formData.tipo_remuneracao}
                onChange={(e) => handleInputChange("tipo_remuneracao", e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none [&>option]:bg-[#13132B]"
              >
                <option value="">Selecione</option>
                <option value="FIXO">Fixo (mensal)</option>
                <option value="DIARIA">Diária</option>
                <option value="PORCENTAGEM">Porcentagem</option>
                <option value="A_COMBINAR">A Combinar</option>
              </select>
            </div>

            {formData.tipo_remuneracao !== "A_COMBINAR" && formData.tipo_remuneracao && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">Valor Proposto *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                  <input
                    type="text"
                    value={formData.valor_proposto}
                    onChange={(e) => handleInputChange("valor_proposto", aplicarMascaraDinheiro(e.target.value))}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none"
                  />
                </div>
              </motion.div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="aceita_termos"
                  checked={formData.aceita_termos}
                  onChange={(e) => handleInputChange("aceita_termos", e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-white/30 bg-white/10 checked:bg-brand-primary accent-brand-primary"
                />
                <span className="text-sm text-gray-300">
                  Li e aceito os <span className="text-brand-primary font-bold">Termos de Publicação</span>
                </span>
              </label>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium py-2 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <Hospital className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Criar Nova Vaga - Hospital</h1>
        </div>

        <div className="mb-8 bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressoPercentual}%` }}
              className="h-full bg-gradient-to-r from-brand-primary to-purple-500"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Etapa {etapaAtual} de {totalEtapas}</span>
            <span className="font-bold text-brand-primary">{Math.round(progressoPercentual)}%</span>
          </div>
        </div>

        <motion.div className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="mb-8">
            {renderEtapa()}
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              onClick={etapaAnterior}
              disabled={etapaAtual === 1}
              className="flex-1 py-4 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Voltar
            </button>

            {etapaAtual < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-brand-primary to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-primary/20 transition-all"
              >
                Continuar
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            ) : (
              <button
                onClick={publicarVaga}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 hover:shadow-green-500/20 transition-all"
              >
                {loading ? "Publicando..." : "Publicar Vaga"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}