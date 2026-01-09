import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Filter,
  Zap,
  Plus
} from "lucide-react";
import { Star } from "lucide-react";

export default function VagasDisponiveis() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("all");
  const [filtroCidade, setFiltroCidade] = useState("all");
  const [filtroTipoData, setFiltroTipoData] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const professionals = await base44.entities.Professional.filter({
          user_id: currentUser.id
        });
        if (professionals.length > 0) {
          setProfessional(professionals[0]);
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: vagas = [], isLoading } = useQuery({
    queryKey: ["vagasDisponiveis", user?.vertical],
    queryFn: async () => {
      // MOCK DATA PARA LOCALHOST
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return [
          {
            id: "mock-vaga-1",
            titulo: "Plantão Noturno UTI",
            especialidades_aceitas: ["Cardiologia", "Clínica Geral"],
            cidade: "São Paulo",
            uf: "SP",
            tipo_vaga: "PLANTAO",
            valor_proposto: 1200.00,
            horario_inicio: "19:00",
            horario_fim: "07:00",
            total_candidatos: 3,
            published_at: new Date().toISOString()
          },
          {
            id: "mock-vaga-2",
            titulo: "Substituição Clínica",
            especialidades_aceitas: ["Dermatologia"],
            cidade: "Campinas",
            uf: "SP",
            tipo_vaga: "SUBSTITUICAO",
            valor_proposto: 800.00,
            horario_inicio: "08:00",
            horario_fim: "18:00",
            total_candidatos: 12,
            published_at: new Date().toISOString()
          }
        ];
      }

      if (!user?.vertical) return [];

      // Determinar tipo profissional baseado no vertical do usuário
      const tipoProfissional = user.vertical === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";

      // Buscar vagas abertas da área do usuário
      const result = await base44.entities.Job.filter({
        status: "ABERTO",
        tipo_profissional: tipoProfissional
      });

      return result.sort((a, b) => new Date(b.published_at || b.created_date) - new Date(a.published_at || a.created_date)) || [];
    },
    enabled: true // Always enabled for mock check
  });

  // Filtrar vagas
  const vagasFiltradas = vagas.filter(vaga => {
    const matchSearch =
      vaga.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.especialidades_aceitas?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())) ||
      vaga.cidade?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEspecialidade =
      filtroEspecialidade === "all" ||
      vaga.especialidades_aceitas?.includes(filtroEspecialidade);

    const matchCidade =
      filtroCidade === "all" ||
      vaga.cidade === filtroCidade;

    const matchTipoData =
      filtroTipoData === "all" ||
      vaga.tipo_vaga === filtroTipoData;

    return matchSearch && matchEspecialidade && matchCidade && matchTipoData;
  });

  // Separar vagas por tipo
  const vagasUrgentes = vagasFiltradas.filter(v => v.tipo_vaga === "PLANTAO");
  const vagasNormais = vagasFiltradas.filter(v => v.tipo_vaga !== "PLANTAO");

  // Extrair opções únicas para filtros
  const especialidades = [...new Set(vagas.flatMap(v => v.especialidades_aceitas || []))].filter(Boolean);
  const cidades = [...new Set(vagas.map(v => v.cidade))].filter(Boolean);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* HEADER COM ÍCONE GRANDE */}
      <div className="bg-[#13132B]/80 backdrop-blur-md border-b border-white/10 pt-8 pb-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Ícone Grande */}
            <div className="w-32 h-32 rounded-full bg-[#0a0a1a] p-2 shadow-2xl mb-4 border border-white/10">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-inner">
                <Briefcase className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Título e Info */}
            <h1 className="text-3xl font-black text-white mb-2">Vagas de Emprego</h1>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="px-4 py-2 bg-white/10 backdrop-blur border border-white/10 text-white font-bold rounded-full text-sm">
                {vagasFiltradas.length} {vagasFiltradas.length === 1 ? "Oportunidade" : "Oportunidades"}
              </span>
              <span className="px-4 py-2 bg-brand-orange/20 backdrop-blur border border-brand-orange/50 text-brand-orange font-bold rounded-full text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Atualizadas Hoje
              </span>
            </div>

            <p className="text-gray-400 text-lg font-semibold mb-4">Encontre sua próxima oportunidade profissional</p>

            {professional && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-brand-orange font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Criar Meu Anúncio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-24 space-y-6 relative z-10">

        {/* Search e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B]/90 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-white shadow-lg">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Buscar Vagas</h2>
              <p className="text-sm text-gray-400">Encontre a oportunidade ideal</p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar especialidade, clínica ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all placeholder-gray-600"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all border ${showFilters
                ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20"
                : "bg-[#0a0a1a] text-gray-300 border-white/10 hover:border-brand-coral hover:text-brand-coral"
                }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Especialidade</label>
                <select
                  value={filtroEspecialidade}
                  onChange={(e) => setFiltroEspecialidade(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange outline-none"
                >
                  <option value="all">Todas</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Cidade</label>
                <select
                  value={filtroCidade}
                  onChange={(e) => setFiltroCidade(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange outline-none"
                >
                  <option value="all">Todas</option>
                  {cidades.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Tipo</label>
                <select
                  value={filtroTipoData}
                  onChange={(e) => setFiltroTipoData(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-orange outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="PLANTAO">🚨 Plantão</option>
                  <option value="FIXO">📅 Fixo</option>
                  <option value="SUBSTITUICAO">🔄 Substituição</option>
                  <option value="TEMPORARIO">📊 Temporário</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* Vagas Urgentes */}
        {vagasUrgentes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#13132B]/80 backdrop-blur-sm border border-red-500/30 rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">🚨 Vagas Plantão</h2>
                <p className="text-sm text-gray-400">Oportunidades de urgência</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {vagasUrgentes.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} isUrgente navigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Vagas Normais */}
        {vagasNormais.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#13132B]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-white shadow-lg shadow-brand-coral/20">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Todas as Oportunidades</h2>
                <p className="text-sm text-gray-400">Encontre sua próxima vaga</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {vagasNormais.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} navigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {vagasFiltradas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#13132B]/80 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-white mb-2">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Tente ajustar os filtros ou volte mais tarde
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFiltroEspecialidade("all");
                setFiltroCidade("all");
                setFiltroTipoData("all");
              }}
              className="px-6 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-coral transition-all hover:scale-105"
            >
              Limpar Filtros
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Componente VagaCard
function VagaCard({ vaga, isUrgente, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(createPageUrl(`DetalheVaga?id=${vaga.id}`))}
      className={`p-4 rounded-2xl border transition-all cursor-pointer group ${isUrgente
        ? "bg-red-500/10 border-red-500/30 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10"
        : "bg-[#0a0a1a] border-white/10 hover:border-brand-coral hover:shadow-lg hover:shadow-brand-coral/10"
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isUrgente && (
            <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-2">
              🚨 PLANTÃO
            </span>
          )}
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-brand-orange transition-colors">
            {vaga.titulo}
          </h3>
          {vaga.especialidades_aceitas && vaga.especialidades_aceitas.length > 0 && (
            <p className="text-sm text-gray-400">{vaga.especialidades_aceitas[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4 text-brand-orange" />
          <span>{vaga.tipo_vaga}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <MapPin className="w-4 h-4 text-brand-orange" />
          <span>{vaga.cidade}/{vaga.uf}</span>
        </div>

        {vaga.valor_proposto && (
          <div className="flex items-center gap-2 text-green-400">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">
              R$ {vaga.valor_proposto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {vaga.horario_inicio && vaga.horario_fim && (
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{vaga.horario_inicio} - {vaga.horario_fim}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span>{vaga.total_candidatos || 0} candidato{vaga.total_candidatos !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <button className="w-full mt-4 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-white transition-all text-sm">
        Ver Detalhes
      </button>
    </motion.div>
  );
}