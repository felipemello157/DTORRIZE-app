import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Briefcase,
  Save,
  Check
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";

export default function EditarVaga() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo_vaga: "",
    tipo_profissional: "",
    especialidades_aceitas: [],
    exige_experiencia: false,
    tempo_experiencia_minimo: "",
    falar_com: "",
    selecao_dias: "",
    dias_semana: [],
    horario_inicio: "",
    horario_fim: "",
    cidade: "",
    uf: "",
    instagram_clinica: "",
    valor_proposto: "",
    tipo_remuneracao: ""
  });

  // Buscar vaga
  const { data: vaga, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await base44.entities.Job.filter({ id });
      return result[0] || null;
    },
    enabled: !!id,
    retry: 1
  });

  // Preencher formulário quando vaga for carregada
  useEffect(() => {
    if (vaga) {
      setFormData({
        titulo: vaga.titulo || "",
        descricao: vaga.descricao || "",
        tipo_vaga: vaga.tipo_vaga || "",
        tipo_profissional: vaga.tipo_profissional || "",
        especialidades_aceitas: vaga.especialidades_aceitas || [],
        exige_experiencia: vaga.exige_experiencia || false,
        tempo_experiencia_minimo: vaga.tempo_experiencia_minimo?.toString() || "",
        falar_com: vaga.falar_com || "",
        selecao_dias: vaga.selecao_dias || "",
        dias_semana: vaga.dias_semana || [],
        horario_inicio: vaga.horario_inicio || "",
        horario_fim: vaga.horario_fim || "",
        cidade: vaga.cidade || "",
        uf: vaga.uf || "",
        instagram_clinica: vaga.instagram_clinica || "",
        valor_proposto: vaga.valor_proposto ? formatarValor(vaga.valor_proposto) : "",
        tipo_remuneracao: vaga.tipo_remuneracao || ""
      });
    }
  }, [vaga]);

  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  // Mutation para atualizar vaga
  const updateMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.Job.update(id, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job"] });
      queryClient.invalidateQueries({ queryKey: ["clinicJobs"] });
      toast.success("✅ Vaga atualizada com sucesso!");
      navigate(createPageUrl("MinhasVagas"));
    },
    onError: (error) => {
      toast.error("❌ Erro ao atualizar vaga: " + error.message);
    }
  });

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

  const formatarValor = (valor) => {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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

  const handleSalvar = async () => {
    // Validação básica
    if (!formData.titulo.trim()) {
      toast.error("Preencha o título da vaga");
      return;
    }
    if (!formData.descricao.trim()) {
      toast.error("Preencha a descrição da vaga");
      return;
    }
    if (formData.especialidades_aceitas.length === 0) {
      toast.error("Selecione pelo menos uma especialidade");
      return;
    }

    setLoading(true);

    try {
      const valorPropostoNumero = formData.valor_proposto
        ? parseFloat(formData.valor_proposto.replace(/\./g, "").replace(",", "."))
        : null;

      const dadosAtualizados = {
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
        valor_proposto: valorPropostoNumero,
        tipo_remuneracao: formData.tipo_remuneracao,
        falar_com: formData.falar_com,
        instagram_clinica: formData.instagram_clinica || ""
      };

      updateMutation.mutate(dadosAtualizados);
    } catch (error) {
      toast.error("Erro ao processar dados: " + error.message);
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando vaga...</p>
        </div>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white font-bold text-xl mb-4">Vaga não encontrada</p>
          <button
            onClick={() => navigate(createPageUrl("MinhasVagas"))}
            className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Voltar para Minhas Vagas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-3 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(createPageUrl("MinhasVagas"))}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium py-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
            <Briefcase className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Editar Vaga</h1>
          <p className="text-gray-400 mt-2">Atualize as informações da oportunidade</p>
        </div>

        {/* Card do Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          <div className="p-6 md:p-8 space-y-6">
            {/* INFORMAÇÕES BÁSICAS */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Título da Vaga *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Ex: Dentista para Ortodontia"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Descrição Detalhada *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva a vaga, responsabilidades, perfil desejado..."
                className="w-full min-h-[150px] px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-primary outline-none resize-none transition-all"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.descricao.length}/1000</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Vaga *</label>
                <select
                  value={formData.tipo_vaga}
                  onChange={(e) => handleInputChange("tipo_vaga", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary appearance-none cursor-pointer outline-none transition-all"
                >
                  <option value="" className="bg-[#0a0a1a]">Selecione</option>
                  <option value="PLANTAO" className="bg-[#0a0a1a]">Plantão</option>
                  <option value="SUBSTITUICAO" className="bg-[#0a0a1a]">Substituição</option>
                  <option value="FIXO" className="bg-[#0a0a1a]">Fixo</option>
                  <option value="TEMPORARIO" className="bg-[#0a0a1a]">Temporário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Profissional *</label>
                <select
                  value={formData.tipo_profissional}
                  onChange={(e) => {
                    handleInputChange("tipo_profissional", e.target.value);
                    handleInputChange("especialidades_aceitas", []);
                  }}
                  disabled
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed appearance-none outline-none transition-all"
                >
                  <option value="" className="bg-[#0a0a1a]">Selecione</option>
                  <option value="DENTISTA" className="bg-[#0a0a1a]">Dentista</option>
                  <option value="MEDICO" className="bg-[#0a0a1a]">Médico</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Tipo não pode ser alterado</p>
              </div>
            </div>

            {/* ESPECIALIDADES */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">Especialidades Aceitas *</label>

              {formData.especialidades_aceitas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  {formData.especialidades_aceitas.map((esp) => (
                    <span
                      key={esp}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-full text-sm font-medium"
                    >
                      {esp}
                      <button
                        type="button"
                        onClick={() => toggleEspecialidade(esp)}
                        className="text-brand-primary hover:text-white font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {formData.tipo_profissional && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto border border-white/10 rounded-xl p-4 bg-[#0a0a1a]">
                  {especialidades.map((esp) => {
                    const isSelected = formData.especialidades_aceitas.includes(esp);
                    return (
                      <div
                        key={esp}
                        onClick={() => toggleEspecialidade(esp)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-brand-primary/20' : 'hover:bg-white/5'}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-500'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <label className="text-sm cursor-pointer text-gray-300 pointer-events-none">
                          {esp}
                        </label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* EXPERIÊNCIA */}
            <div className="border border-white/10 rounded-xl p-5 bg-[#0a0a1a]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-300">Exige Experiência?</label>
                <button
                  type="button"
                  onClick={() => handleInputChange("exige_experiencia", !formData.exige_experiencia)}
                  className={`w-14 h-8 rounded-full transition-all relative ${formData.exige_experiencia ? "bg-brand-primary" : "bg-white/10"
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all absolute top-1 ${formData.exige_experiencia ? "right-1" : "left-1"
                    }`}></div>
                </button>
              </div>

              {formData.exige_experiencia && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tempo Mínimo (anos) *</label>
                  <input
                    type="number"
                    value={formData.tempo_experiencia_minimo}
                    onChange={(e) => handleInputChange("tempo_experiencia_minimo", e.target.value)}
                    placeholder="Ex: 2"
                    min="0"
                    className="w-full px-4 py-3 bg-[#13132B] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Falar com *</label>
              <input
                type="text"
                value={formData.falar_com}
                onChange={(e) => handleInputChange("falar_com", e.target.value)}
                placeholder="Ex: Dr. João Silva"
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-primary outline-none transition-all"
              />
            </div>

            {/* HORÁRIOS E DIAS */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">Período *</label>
              <div className="space-y-3">
                {[
                  { value: "ESPECIFICOS", label: "📅 Dias Específicos" },
                  { value: "SEMANA_TODA", label: "🗓️ Semana Toda (Seg-Sex)" },
                  { value: "MES_TODO", label: "📆 Mês Todo (disponibilidade integral)" }
                ].map((opcao) => (
                  <div
                    key={opcao.value}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all ${formData.selecao_dias === opcao.value
                        ? "border-brand-primary bg-brand-primary/10"
                        : "border-white/10 hover:bg-white/5"
                      }`}
                    onClick={() => handleInputChange("selecao_dias", opcao.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.selecao_dias === opcao.value ? "border-brand-primary" : "border-gray-500"
                        }`}>
                        {formData.selecao_dias === opcao.value && (
                          <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
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
                <label className="block text-sm font-semibold text-gray-300 mb-3">Selecione os Dias *</label>
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
                          ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                          : "bg-[#0a0a1a] border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
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
                <label className="block text-sm font-semibold text-gray-300 mb-2">Horário Início *</label>
                <input
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => handleInputChange("horario_inicio", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Horário Fim *</label>
                <input
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => handleInputChange("horario_fim", e.target.value)}
                  className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* LOCALIZAÇÃO - BLOQUEADA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">UF</label>
                <input
                  type="text"
                  value={formData.uf}
                  disabled
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Localização não pode ser alterada</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  disabled
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Instagram da Clínica (opcional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">@</span>
                <input
                  type="text"
                  value={formData.instagram_clinica}
                  onChange={(e) => handleInputChange("instagram_clinica", e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                  placeholder="suaclinica"
                  className="w-full pl-10 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* REMUNERAÇÃO */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Remuneração *</label>
              <select
                value={formData.tipo_remuneracao}
                onChange={(e) => handleInputChange("tipo_remuneracao", e.target.value)}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-primary appearance-none cursor-pointer outline-none transition-all"
              >
                <option value="" className="bg-[#0a0a1a]">Selecione</option>
                <option value="FIXO" className="bg-[#0a0a1a]">Fixo (mensal)</option>
                <option value="DIARIA" className="bg-[#0a0a1a]">Diária</option>
                <option value="PORCENTAGEM" className="bg-[#0a0a1a]">Porcentagem</option>
                <option value="A_COMBINAR" className="bg-[#0a0a1a]">A Combinar</option>
              </select>
            </div>

            {formData.tipo_remuneracao !== "A_COMBINAR" && formData.tipo_remuneracao && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Proposto *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-semibold">R$</span>
                  <input
                    type="text"
                    value={formData.valor_proposto}
                    onChange={(e) => handleInputChange("valor_proposto", aplicarMascaraDinheiro(e.target.value))}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-primary outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse md:flex-row gap-4 p-6 bg-[#0a0a1a] border-t border-white/10">
            <button
              onClick={() => navigate(createPageUrl("MinhasVagas"))}
              className="flex-1 py-4 border border-white/10 text-gray-400 font-semibold rounded-2xl hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleSalvar}
              disabled={loading || updateMutation.isPending}
              className="flex-1 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading || updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
        </motion.div>
      </div>
    </div>
  );
}