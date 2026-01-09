import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useUserArea } from "@/components/hooks/useUserArea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, X, Star, Users, MapPin, Briefcase, Clock, DollarSign, Calendar, Zap, CheckCircle, MessageCircle, Award, Filter, ChevronDown, Loader2, Target } from "lucide-react";
import { useUserRole } from "@/components/hooks/useUserRole";
import { getEspecialidades, getProfissionalLabel } from "@/components/constants/especialidades";
import { motion, AnimatePresence } from "framer-motion";

// Lista de estados brasileiros
const estados = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

export default function BuscarProfissionais() {
  const { userArea } = useUserArea();
  const [especialidade, setEspecialidade] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [profissionais, setProfissionais] = useState([]);
  const [showFiltrosAvancados, setShowFiltrosAvancados] = useState(false);
  const [ordenacao, setOrdenacao] = useState("RELEVANTE");
  const { isClinic, isAdmin, userWorld, loading: loadingRole, currentCompanyUnit } = useUserRole();

  // Filtros avançados
  const [filtros, setFiltros] = useState({
    disponivelAgora: false,
    diasSemana: [],
    inicioDisponibilidade: "",
    tempoMinimoFormado: 0,
    tempoMinimoEspecialidade: 0,
    aceitaFreelance: false,
    formaRemuneracao: [],
    minimoEstrelas: 0,
    apenasComAvaliacoes: false
  });

  const especialidades = getEspecialidades(userWorld);
  const profissionalLabel = getProfissionalLabel(userWorld);

  if (loadingRole) {
    return <div className="text-center py-12 text-white">Verificando permissões...</div>;
  }

  if (!isClinic && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-pink-900/20">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Acesso Exclusivo</h1>
          <p className="text-lg text-gray-400 font-semibold">Apenas clínicas podem buscar profissionais.</p>
        </motion.div>
      </div>
    );
  }

  const podesBuscar = especialidade && uf && cidade.trim();

  const calcularMatchScore = (prof) => {
    if (!currentCompanyUnit) return 0;

    let score = 0;

    // Match de cidade (1 ponto)
    if (prof.cidades_atendimento?.some(c =>
      c.toLowerCase().includes(cidade.toLowerCase())
    )) {
      score++;
    }

    // Match de especialidade (1 ponto)
    if (prof.especialidade_principal === especialidade) {
      score++;
    }

    // Experiência mínima (1 ponto)
    if (prof.tempo_formado_anos >= filtros.tempoMinimoFormado) {
      score++;
    }

    // Disponibilidade imediata (1 ponto)
    if (filtros.disponivelAgora && prof.disponibilidade_inicio === "IMEDIATO") {
      score++;
    }

    return score;
  };

  const buscarProfissionais = async () => {
    setBuscando(true);
    try {
      const tipoProfissional = userArea === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";

      // Buscar profissionais aprovados e disponíveis
      const resultados = await base44.entities.Professional.filter({
        status_cadastro: "APROVADO",
        status_disponibilidade: "DISPONIVEL",
        especialidade_principal: especialidade,
        tipo_profissional: tipoProfissional
      });

      // Filtrar por cidade
      let filtrados = resultados.filter(p =>
        p.cidades_atendimento &&
        p.cidades_atendimento.some(c =>
          c.toLowerCase().includes(cidade.toLowerCase()) &&
          c.toLowerCase().includes(uf.toLowerCase())
        )
      );

      // Aplicar filtros avançados
      if (filtros.disponivelAgora) {
        filtrados = filtrados.filter(p => p.status_disponibilidade === "DISPONIVEL");
      }

      if (filtros.diasSemana.length > 0) {
        filtrados = filtrados.filter(p =>
          filtros.diasSemana.some(dia => p.dias_semana_disponiveis?.includes(dia))
        );
      }

      if (filtros.inicioDisponibilidade) {
        filtrados = filtrados.filter(p => p.disponibilidade_inicio === filtros.inicioDisponibilidade);
      }

      if (filtros.tempoMinimoFormado > 0) {
        filtrados = filtrados.filter(p => p.tempo_formado_anos >= filtros.tempoMinimoFormado);
      }

      if (filtros.tempoMinimoEspecialidade > 0) {
        filtrados = filtrados.filter(p => (p.tempo_especialidade_anos || 0) >= filtros.tempoMinimoEspecialidade);
      }

      if (filtros.aceitaFreelance) {
        filtrados = filtrados.filter(p => p.aceita_freelance);
      }

      if (filtros.formaRemuneracao.length > 0) {
        filtrados = filtrados.filter(p =>
          filtros.formaRemuneracao.some(forma => p.forma_remuneracao?.includes(forma))
        );
      }

      if (filtros.minimoEstrelas > 0) {
        filtrados = filtrados.filter(p => (p.media_avaliacoes || 0) >= filtros.minimoEstrelas);
      }

      if (filtros.apenasComAvaliacoes) {
        filtrados = filtrados.filter(p => p.total_avaliacoes > 0);
      }

      // Calcular match score para cada profissional
      filtrados = filtrados.map(p => ({
        ...p,
        matchScore: calcularMatchScore(p)
      }));

      // Ordenar
      switch (ordenacao) {
        case "RELEVANTE":
          filtrados.sort((a, b) => b.matchScore - a.matchScore);
          break;
        case "AVALIACAO":
          filtrados.sort((a, b) => b.media_avaliacoes - a.media_avaliacoes);
          break;
        case "EXPERIENCIA":
          filtrados.sort((a, b) => b.tempo_formado_anos - a.tempo_formado_anos);
          break;
        case "RECENTE":
          filtrados.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          break;
      }

      setProfissionais(filtrados);
      setBuscaRealizada(true);

      if (filtrados.length === 0) {
        toast.info("Nenhum profissional encontrado para estes critérios");
      } else {
        toast.success(`${filtrados.length} ${filtrados.length === 1 ? "profissional encontrado" : "profissionais encontrados"}!`);
      }
    } catch (error) {
      toast.error("Erro ao buscar profissionais");
    }
    setBuscando(false);
  };

  const limparBusca = () => {
    setEspecialidade("");
    setUf("");
    setCidade("");
    setProfissionais([]);
    setBuscaRealizada(false);
    setFiltros({
      disponivelAgora: false,
      diasSemana: [],
      inicioDisponibilidade: "",
      tempoMinimoFormado: 0,
      tempoMinimoEspecialidade: 0,
      aceitaFreelance: false,
      formaRemuneracao: [],
      minimoEstrelas: 0,
      apenasComAvaliacoes: false
    });
  };

  const handleDiaToggle = (dia) => {
    setFiltros(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }));
  };

  const handleFormaRemuneracaoToggle = (forma) => {
    setFiltros(prev => ({
      ...prev,
      formaRemuneracao: prev.formaRemuneracao.includes(forma)
        ? prev.formaRemuneracao.filter(f => f !== forma)
        : [...prev.formaRemuneracao, forma]
    }));
  };

  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

  return (
    <div className="min-h-screen bg-[#0a0a1a] overflow-x-hidden">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-8 md:py-12 lg:py-16 bg-[#13132B]">
        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: [0, 10, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-10 left-10 opacity-10">
          <Users className="w-32 h-32 text-brand-primary" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -10, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          className="absolute bottom-10 right-10 opacity-10">
          <Briefcase className="w-40 h-40 text-brand-secondary" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-white/10 rounded-2xl shadow-xl backdrop-blur-sm border border-white/10">
                <Search className="w-10 h-10 text-brand-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white text-shadow-lg mb-4">
              BUSCAR PROFISSIONAIS
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-bold mb-2">
              Encontre {profissionalLabel.toLowerCase()}s qualificados na sua região! ⚡
            </p>
            <Badge className="bg-brand-primary text-white font-black text-base px-6 py-2 rounded-full shadow-lg">
              Profissionais Verificados ✓
            </Badge>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-7xl">
        {/* SEÇÃO 1 - FILTROS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card className="bg-[#13132B] border border-white/10 shadow-2xl rounded-3xl overflow-hidden mb-8">
            <CardHeader className="bg-white/5 border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-black text-white">
                    Filtros de Busca
                  </CardTitle>
                  <p className="text-sm text-gray-400 font-semibold mt-1">
                    Preencha os campos para encontrar profissionais
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Campo 1: Especialidade */}
                <div>
                  <label className="text-base font-bold text-gray-300 mb-2 block flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand-primary" />
                    Especialidade <span className="text-red-500">*</span>
                  </label>
                  <Select value={especialidade} onValueChange={setEspecialidade}>
                    <SelectTrigger className="h-14 bg-[#0a0a1a] border-white/10 text-white rounded-xl text-lg hover:border-brand-primary transition-colors">
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#13132B] border-white/10 text-white">
                      {especialidades.map((esp) => (
                        <SelectItem key={esp} value={esp} className="text-base focus:bg-white/10 focus:text-white">
                          {esp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo 2: Estado */}
                <div>
                  <label className="text-base font-bold text-gray-300 mb-2 block flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <Select value={uf} onValueChange={setUf}>
                    <SelectTrigger className="h-14 bg-[#0a0a1a] border-white/10 text-white rounded-xl text-lg hover:border-brand-primary transition-colors">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#13132B] border-white/10 text-white">
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado} className="text-base focus:bg-white/10 focus:text-white">
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo 3: Cidade */}
                <div>
                  <label className="text-base font-bold text-gray-300 mb-2 block flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Digite o nome da cidade"
                    className="h-14 bg-[#0a0a1a] border-white/10 text-white rounded-xl text-lg hover:border-brand-primary transition-colors placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Botão Filtros Avançados */}
              <Button
                onClick={() => setShowFiltrosAvancados(!showFiltrosAvancados)}
                variant="outline"
                className="w-full h-14 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-primary text-gray-300 font-bold rounded-2xl mb-4">
                <Filter className="w-5 h-5 mr-2" />
                Filtros Avançados
                <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${showFiltrosAvancados ? "rotate-180" : ""}`} />
              </Button>

              {/* Filtros Avançados */}
              <AnimatePresence>
                {showFiltrosAvancados && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-white/10 bg-[#0a0a1a] rounded-2xl p-6 mb-6 space-y-6">

                    {/* Disponibilidade */}
                    <div>
                      <h3 className="font-black text-white mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        Disponibilidade
                      </h3>

                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={filtros.disponivelAgora}
                          onChange={(e) => setFiltros({ ...filtros, disponivelAgora: e.target.checked })}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500"
                        />
                        <label className="font-semibold text-gray-300">Disponível Agora</label>
                      </div>

                      <div className="mb-4">
                        <label className="block font-semibold text-gray-300 mb-2">Dias da Semana:</label>
                        <div className="flex flex-wrap gap-2">
                          {diasSemana.map(dia => (
                            <button
                              key={dia}
                              onClick={() => handleDiaToggle(dia)}
                              className={`px-4 py-2 font-bold rounded-xl transition-all ${filtros.diasSemana.includes(dia)
                                  ? "bg-yellow-500 text-black"
                                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}>
                              {dia}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-300 mb-2">Início:</label>
                        <Select value={filtros.inicioDisponibilidade} onValueChange={(v) => setFiltros({ ...filtros, inicioDisponibilidade: v })}>
                          <SelectTrigger className="h-12 bg-[#13132B] border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#13132B] border-white/10 text-white">
                            <SelectItem value={null} className="focus:bg-white/10 focus:text-white">Qualquer</SelectItem>
                            <SelectItem value="IMEDIATO" className="focus:bg-white/10 focus:text-white">Imediato</SelectItem>
                            <SelectItem value="15_DIAS" className="focus:bg-white/10 focus:text-white">15 dias</SelectItem>
                            <SelectItem value="30_DIAS" className="focus:bg-white/10 focus:text-white">30 dias</SelectItem>
                            <SelectItem value="60_DIAS" className="focus:bg-white/10 focus:text-white">60 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Experiência */}
                    <div>
                      <h3 className="font-black text-white mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-brand-primary" />
                        Experiência
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block font-semibold text-gray-300 mb-2">
                            Tempo Mínimo Formado: {filtros.tempoMinimoFormado} anos
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={filtros.tempoMinimoFormado}
                            onChange={(e) => setFiltros({ ...filtros, tempoMinimoFormado: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-300 mb-2">
                            Tempo na Especialidade: {filtros.tempoMinimoEspecialidade} anos
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={filtros.tempoMinimoEspecialidade}
                            onChange={(e) => setFiltros({ ...filtros, tempoMinimoEspecialidade: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferências */}
                    <div>
                      <h3 className="font-black text-white mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Preferências
                      </h3>

                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={filtros.aceitaFreelance}
                          onChange={(e) => setFiltros({ ...filtros, aceitaFreelance: e.target.checked })}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500"
                        />
                        <label className="font-semibold text-gray-300">Aceita Freelance</label>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-300 mb-2">Forma de Remuneração:</label>
                        <div className="flex flex-wrap gap-2">
                          {["DIARIA", "PORCENTAGEM", "FIXO", "A_COMBINAR"].map(forma => (
                            <button
                              key={forma}
                              onClick={() => handleFormaRemuneracaoToggle(forma)}
                              className={`px-4 py-2 font-bold rounded-xl transition-all ${filtros.formaRemuneracao.includes(forma)
                                  ? "bg-green-500 text-white"
                                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}>
                              {forma === "DIARIA" ? "Diária" : forma === "PORCENTAGEM" ? "%" : forma === "FIXO" ? "Fixo" : "A Combinar"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Avaliação */}
                    <div>
                      <h3 className="font-black text-white mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Avaliação
                      </h3>

                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={filtros.apenasComAvaliacoes}
                          onChange={(e) => setFiltros({ ...filtros, apenasComAvaliacoes: e.target.checked })}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500"
                        />
                        <label className="font-semibold text-gray-300">Apenas com Avaliações</label>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-300 mb-2">
                          Mínimo de Estrelas: {filtros.minimoEstrelas > 0 ? filtros.minimoEstrelas : "Qualquer"}
                        </label>
                        <div className="flex gap-2">
                          {[0, 1, 2, 3, 4, 5].map(stars => (
                            <button
                              key={stars}
                              onClick={() => setFiltros({ ...filtros, minimoEstrelas: stars })}
                              className={`flex-1 px-3 py-2 font-bold rounded-xl transition-all ${filtros.minimoEstrelas === stars
                                  ? "bg-yellow-500 text-black"
                                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}>
                              {stars === 0 ? "Todos" : `${stars}★`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={buscarProfissionais}
                disabled={!podesBuscar || buscando}
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-0">
                {buscando ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6 mr-2" />
                    BUSCAR PROFISSIONAIS
                    <Zap className="w-6 h-6 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* SEÇÃO 2 - RESULTADOS */}
        {!buscaRealizada ? (
          // ESTADO INICIAL
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}>
            <Card className="bg-[#13132B] border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="py-20">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}>
                    <Search className="w-24 h-24 mx-auto text-gray-700 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl text-white font-black mb-3">
                    Pronto para buscar?
                  </h3>
                  <p className="text-lg text-gray-400 font-semibold mb-2">
                    Preencha os filtros acima para ver os profissionais disponíveis
                  </p>
                  <p className="text-base text-gray-500">
                    Busque por especialidade, estado e cidade
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : profissionais.length === 0 ? (
          // SEM RESULTADOS
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-[#13132B] border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="py-20">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                    <X className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl text-white font-black mb-3">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-lg text-gray-400 font-semibold mb-6">
                    Tente buscar em cidades vizinhas ou outras especialidades
                  </p>
                  <Button
                    onClick={limparBusca}
                    size="lg"
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-6 rounded-2xl shadow-xl transition-all hover:scale-105 border-0">
                    <X className="w-5 h-5 mr-2" />
                    Limpar Filtros e Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // COM RESULTADOS
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-[#13132B] border border-green-500/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-green-500/5 border-b border-green-500/20 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-[#25D366] to-green-600 rounded-2xl shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-black text-white">
                        {profissionais.length} {profissionais.length === 1 ? "Profissional Encontrado" : "Profissionais Encontrados"}! 🎉
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-brand-orange text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                        <Award className="w-4 h-4 mr-1" />
                        {especialidade}
                      </Badge>
                      <Badge className="bg-brand-primary text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                        <MapPin className="w-4 h-4 mr-1" />
                        {cidade} - {uf}
                      </Badge>
                      <Button
                        onClick={limparBusca}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 font-bold rounded-full px-4">
                        <X className="w-4 h-4 mr-1" />
                        Limpar
                      </Button>
                    </div>
                  </div>

                  {/* Ordenação */}
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-gray-400">Ordenar:</label>
                    <Select value={ordenacao} onValueChange={setOrdenacao}>
                      <SelectTrigger className="w-48 h-10 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13132B] border-white/10 text-white">
                        <SelectItem value="RELEVANTE" className="focus:bg-white/10 focus:text-white">Mais Relevantes</SelectItem>
                        <SelectItem value="AVALIACAO" className="focus:bg-white/10 focus:text-white">Mais Bem Avaliados</SelectItem>
                        <SelectItem value="EXPERIENCIA" className="focus:bg-white/10 focus:text-white">Mais Experientes</SelectItem>
                        <SelectItem value="RECENTE" className="focus:bg-white/10 focus:text-white">Mais Recentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {profissionais.map((prof, index) => (
                    <motion.div
                      key={prof.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="bg-[#0a0a1a] rounded-3xl p-6 shadow-xl hover:shadow-2xl border border-white/10 hover:border-brand-primary transition-all">

                      {/* HEADER */}
                      <div className="mb-4">
                        {/* Match Score e Super Match Badge */}
                        {prof.matchScore > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            {prof.matchScore === 4 ? (
                              <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
                                <Zap className="w-3 h-3 mr-1" />
                                SUPER MATCH
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full">
                                <Target className="w-3 h-3 mr-1" />
                                {prof.matchScore}/4 Match
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Nome */}
                        <h3 className="text-xl font-black text-white mb-2 line-clamp-1">
                          {prof.nome_completo}
                        </h3>

                        {/* Especialidade */}
                        <Badge className="bg-brand-primary text-white font-bold text-xs px-3 py-1 rounded-full mb-3">
                          <Award className="w-3 h-3 mr-1" />
                          {prof.especialidade_principal}
                        </Badge>

                        {/* Cidade principal */}
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <MapPin className="w-4 h-4 text-brand-coral" />
                          <span className="text-sm font-semibold">
                            {prof.cidades_atendimento?.[0] || "N/A"}
                          </span>
                        </div>

                        {/* Avaliações */}
                        {prof.total_avaliacoes > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-lg font-black text-white">
                              {(prof.media_avaliacoes || 0).toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500 font-semibold">
                              ({prof.total_avaliacoes} {prof.total_avaliacoes === 1 ? "avaliação" : "avaliações"})
                            </span>
                          </div>
                        )}

                        {/* Badge Disponível */}
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          DISPONÍVEL
                        </Badge>
                      </div>

                      <div className="border-t border-white/10 my-4" />

                      {/* CORPO */}
                      <div className="space-y-3 mb-4">
                        {/* Tempo formado */}
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-brand-orange mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-bold text-gray-400">Formado:</span>{" "}
                            <span className="text-white font-semibold">{prof.tempo_formado_anos} anos</span>
                          </div>
                        </div>

                        {/* Tempo especialista */}
                        {prof.tempo_especialidade_anos > 0 && (
                          <div className="flex items-start gap-2">
                            <Award className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-400">Especialista:</span>{" "}
                              <span className="text-white font-semibold">{prof.tempo_especialidade_anos} anos</span>
                            </div>
                          </div>
                        )}

                        {/* Dias disponíveis */}
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-brand-coral mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-bold text-gray-400">Dias:</span>{" "}
                            <span className="text-white font-semibold">
                              {prof.dias_semana_disponiveis?.includes("INTEGRAL")
                                ? "Todos os dias"
                                : prof.dias_semana_disponiveis?.join(", ") || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Remuneração */}
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-bold text-gray-400">Aceita:</span>{" "}
                            <span className="text-white font-semibold">
                              {prof.forma_remuneracao?.map(f =>
                                f === "DIARIA" ? "Diária" :
                                  f === "PORCENTAGEM" ? "%" :
                                    f === "FIXO" ? "Fixo" : "A Combinar"
                              ).join(", ") || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}