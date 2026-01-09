import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUserArea } from "@/components/hooks/useUserArea";
import { notificarSuperJobMatch } from "@/components/api/whatsappNotifications";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Star,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";

export default function NewJobs() {
  const { userArea } = useUserArea();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [newJobsActive, setNewJobsActive] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Buscar profissional logado
        const profResult = await base44.entities.Professional.filter({ user_id: currentUser.id });
        setProfessional(profResult[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar vagas abertas
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const results = await base44.entities.Job.filter({
        status: "ABERTO"
      });
      return results.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Buscar unidades das vagas
  const { data: units = [] } = useQuery({
    queryKey: ["units", jobs],
    queryFn: async () => {
      if (jobs.length === 0) return [];
      const unitIds = [...new Set(jobs.map(j => j.unit_id))];
      const unitPromises = unitIds.map(id =>
        base44.entities.CompanyUnit.filter({ id }).then(res => res[0])
      );
      return (await Promise.all(unitPromises)).filter(Boolean);
    },
    enabled: jobs.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Função de cálculo de match
  const calcularMatch = (job, prof) => {
    if (!prof) return 0;
    let score = 0;

    // 1. Cidade
    if (prof.cidades_atendimento?.some(c =>
      c.toLowerCase().includes(job.cidade?.toLowerCase()) ||
      job.cidade?.toLowerCase().includes(c.split(' - ')[0].toLowerCase())
    )) {
      score++;
    }

    // 2. Especialidade
    if (job.especialidades_aceitas?.includes(prof.especialidade_principal)) {
      score++;
    }

    // 3. Dias
    const diasComuns = prof.dias_semana_disponiveis?.filter(d =>
      job.dias_semana?.includes(d)
    );
    if (diasComuns?.length > 0 || job.selecao_dias === "SEMANA_TODA") {
      score++;
    }

    // 4. Experiência
    if (!job.exige_experiencia ||
      (prof.tempo_formado_anos >= (job.tempo_experiencia_minimo || 0))) {
      score++;
    }

    return score;
  };

  // Filtrar vagas por busca e área
  const filteredJobs = jobs.filter(job => {
    // Filtro de área (ODONTOLOGIA só vê DENTISTA, MEDICINA só vê MEDICO)
    const tipoProfissionalEsperado = userArea === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";
    if (job.tipo_profissional !== tipoProfissionalEsperado) {
      return false;
    }

    const matchesSpecialty = !searchSpecialty ||
      job.titulo?.toLowerCase().includes(searchSpecialty.toLowerCase()) ||
      job.especialidades_aceitas?.some(esp => esp.toLowerCase().includes(searchSpecialty.toLowerCase()));

    const matchesCity = !searchCity ||
      job.cidade?.toLowerCase().includes(searchCity.toLowerCase());

    return matchesSpecialty && matchesCity;
  });

  // Calcular match para cada vaga
  const jobsComMatch = filteredJobs.map(job => ({
    ...job,
    matchScore: calcularMatch(job, professional)
  }));

  // Ordenar por score (maior primeiro)
  jobsComMatch.sort((a, b) => b.matchScore - a.matchScore);

  // Categorizar vagas por score
  const superJobs = jobsComMatch.filter(j => j.matchScore === 4);
  const jobsSemelhante = jobsComMatch.filter(j => j.matchScore === 3);
  const outrasVagas = jobsComMatch.filter(j => j.matchScore >= 0 && j.matchScore <= 2);

  // Notificar Super Jobs via WhatsApp
  useEffect(() => {
    const notificarSuperJobs = async () => {
      if (!professional || superJobs.length === 0) return;

      for (const vaga of superJobs) {
        try {
          await notificarSuperJobMatch(vaga.id, professional.id, vaga.matchScore);
        } catch (e) {
          // Erro silencioso
        }
      }
    };
    notificarSuperJobs();
  }, [superJobs, professional]);

  const handleToggleNewJobs = async () => {
    setNewJobsActive(!newJobsActive);
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = "5562999999999";
    const message = encodeURIComponent("Olá! Tenho interesse nas vagas Jobs Semelhante ⭐");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 relative overflow-hidden">
      {/* Background Decors */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-8 pb-12 bg-[#13132B]/50 backdrop-blur-xl border-b border-white/10">
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary mt-0 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md mx-1 py-3 text-3xl rounded-2xl w-16 h-16 flex items-center justify-center mb-4 border border-white/20">
              💼
            </div>
            <h1 className="text-white mb-2 text-3xl font-black md:text-5xl drop-shadow-lg">OPORTUNIDADES</h1>
            <p className="text-white/90 font-medium">Encontre a vaga perfeita para você</p>
            <div className="bg-brand-orange text-white mt-4 px-4 py-2 font-bold rounded-full inline-flex items-center gap-2 backdrop-blur shadow-lg">
              🔥 {jobs.length} vagas disponíveis
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="container mx-auto px-4 -mt-8 relative z-20 mb-8">
        <div className="bg-[#13132B] border border-white/10 rounded-3xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Campo de busca */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Buscar vagas, especialidades..."
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
              />
            </div>

            {/* Select Cidade */}
            <div>
              <input
                type="text"
                placeholder="Cidade"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full px-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
              />
            </div>

            {/* Botão Buscar */}
            <button className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl hover:shadow-brand-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-2">
              🔍 Buscar
            </button>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2">
            {["Todas", "Tempo Integral", "Meio Período", "Plantão", "Freelancer"].map((label, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${idx === 0
                    ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                    : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header da Lista */}
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">Vagas Encontradas</h2>
          <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-bold border border-white/10 cursor-default">
            ({superJobs.length + jobsSemelhante.length + outrasVagas.length})
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 space-y-6">
        {/* SUPER JOBS */}
        {superJobs.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-black text-white">SUPER JOBS - Matches Perfeitos! 🌟</h2>
              <span className="ml-auto px-3 py-1 bg-yellow-500 text-black rounded-full text-sm font-bold">
                {superJobs.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {superJobs.map((job) => {
                const unit = units.find(u => u.id === job.unit_id);
                return <JobCard key={job.id} job={job} unit={unit} isSuperJob matchScore={job.matchScore} />;
              })}
            </div>
          </div>
        )}

        {/* Jobs Semelhante */}
        {jobsSemelhante.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 backdrop-blur border border-brand-primary/30 rounded-2xl p-4 flex items-center gap-3">
              <Star className="w-6 h-6 text-brand-primary" />
              <h2 className="text-xl font-black text-white">Jobs Semelhante ⭐</h2>
              <span className="ml-auto px-3 py-1 bg-brand-primary text-white rounded-full text-sm font-bold">
                {jobsSemelhante.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobsSemelhante.map((job) => {
                const unit = units.find(u => u.id === job.unit_id);
                return <JobCard key={job.id} job={job} unit={unit} matchScore={job.matchScore} />;
              })}
            </div>
          </div>
        )}

        {/* Outras Vagas */}
        {outrasVagas.length > 0 && (
          <div className="space-y-4">
            <div className="bg-[#13132B] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-black text-white">Outras Oportunidades</h2>
              <span className="ml-auto px-3 py-1 bg-white/10 text-white rounded-full text-sm font-bold">
                {outrasVagas.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {outrasVagas.map((job) => {
                const unit = units.find(u => u.id === job.unit_id);
                return <JobCard key={job.id} job={job} unit={unit} matchScore={job.matchScore} />;
              })}
            </div>
          </div>
        )}

        {/* Estado Vazio */}
        {superJobs.length === 0 && jobsSemelhante.length === 0 && outrasVagas.length === 0 && (
          <div className="bg-[#13132B] border border-white/10 rounded-3xl shadow-xl p-12 text-center">
            <div className="text-8xl mb-6 opacity-50 grayscale">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-gray-400 mb-6">Tente ajustar os filtros de busca</p>
            <button
              onClick={() => {
                setSearchCity("");
                setSearchSpecialty("");
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl hover:scale-105 transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Botão Flutuante - Criar Alerta */}
      <div className="fixed bottom-24 right-6 z-50 group">
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-black/90 backdrop-blur text-white text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all border border-white/10">
          Criar alerta de vagas
        </div>
        <button className="w-14 h-14 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-pink-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-all">
          🔔
        </button>
      </div>
    </div>
  );
}

function JobCard({ job, unit, isSuperJob, matchScore }) {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    if (unit?.whatsapp) {
      const message = encodeURIComponent(`Olá! Tenho interesse na vaga: ${job.titulo}`);
      window.open(`https://wa.me/55${unit.whatsapp}?text=${message}`, "_blank");
    }
  };

  const handleVerDetalhes = () => {
    navigate(createPageUrl("DetalheVaga") + `?id=${job.id}`);
  };

  const matchConfig = {
    4: { badge: "⚡ MATCH PERFEITO", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", borderColor: "border-yellow-500/50" },
    3: { badge: "⭐ BOA COMPATIBILIDADE", color: "bg-brand-primary/20 text-brand-primary border-brand-primary/30", borderColor: "border-brand-primary/50" },
    2: { badge: null, color: "", borderColor: "border-white/5" },
    1: { badge: null, color: "", borderColor: "border-white/5" },
    0: { badge: null, color: "", borderColor: "border-white/5" }
  };

  const config = matchConfig[matchScore] || matchConfig[0];

  const tipoVagaLabels = {
    PLANTAO: "Plantão",
    FIXO: "Fixo",
    SUBSTITUICAO: "Substituição",
    TEMPORARIO: "Temporário"
  };

  const tipoRemuneracaoLabels = {
    FIXO: "/mês",
    DIARIA: "/dia",
    PORCENTAGEM: "%",
    A_COMBINAR: ""
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  return (
    <div className={`bg-[#13132B] rounded-3xl shadow-lg p-6 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer border ${config.borderColor} hover:border-white/20 relative overflow-hidden`}>
      {isSuperJob && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
      )}

      <div className="flex flex-col md:flex-row md:items-start gap-4 relative z-10">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#0a0a1a] border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
          {unit?.nome_fantasia?.[0]?.toUpperCase() || "🏥"}
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Header do card */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold border border-white/5">
                {tipoVagaLabels[job.tipo_vaga] || job.tipo_vaga}
              </span>
              {job.especialidades_aceitas?.[0] && (
                <span className="px-3 py-1 bg-white/10 text-brand-primary rounded-full text-xs font-bold border border-white/5">
                  {job.especialidades_aceitas[0]}
                </span>
              )}
              {config.badge && (
                <span className={`px-3 py-1 ${config.color} rounded-full text-xs font-bold border ${matchScore === 4 ? 'animate-pulse' : ''}`}>
                  {config.badge}
                </span>
              )}
            </div>
            {job.tipo_remuneracao === "A_COMBINAR" ? (
              <p className="text-lg font-black text-blue-400">A Combinar</p>
            ) : job.valor_proposto && (
              <p className="text-xl font-black text-green-400">
                R$ {job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                {tipoRemuneracaoLabels[job.tipo_remuneracao]}
              </p>
            )}
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-white mb-1 hover:text-brand-primary transition-all">
            {job.titulo}
          </h3>
          <p className="text-gray-400 mb-4 text-sm">{unit?.nome_fantasia || "Clínica"}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-300 font-medium">{job.cidade} - {job.uf}</span>
            </div>
            {job.dias_semana?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📅</span>
                <span className="text-gray-300 font-medium">
                  {job.dias_semana[0]}
                  {job.dias_semana.length > 1 && `+${job.dias_semana.length - 1}`}
                </span>
              </div>
            )}
            {job.horario_inicio && job.horario_fim && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300 font-medium">{job.horario_inicio}-{job.horario_fim}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📆</span>
              <span className="text-gray-300 font-medium">{getTimeAgo(job.published_at || job.created_date)}</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            {unit?.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-6 py-3 bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600 hover:text-white font-bold rounded-xl transition-all"
              >
                💬 WhatsApp
              </button>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleVerDetalhes}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Ver Detalhes →
              </button>
              <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all">
                ❤️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}