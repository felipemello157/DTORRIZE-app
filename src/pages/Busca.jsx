import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Building2,
  MapPin,
  Star,
  ChevronRight
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedSearch from "@/components/search/AdvancedSearch";
import EmptyState from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/SkeletonCard";

export default function Busca() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profissionais');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Buscar profissionais
  const { data: profissionais = [], isLoading: loadingProfs } = useQuery({
    queryKey: ['search-profissionais', searchQuery, filters],
    queryFn: async () => {
      const filter = { status_cadastro: 'APROVADO' };
      if (filters.uf) filter.uf_conselho = filters.uf;
      if (filters.especialidade) filter.especialidade_principal = filters.especialidade;
      if (filters.disponibilidade) filter.disponibilidade_inicio = filters.disponibilidade;

      const results = await base44.entities.Professional.filter(filter);

      // Filtrar por query
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return results.filter(p =>
          p.nome_completo?.toLowerCase().includes(lowerQuery) ||
          p.especialidade_principal?.toLowerCase().includes(lowerQuery) ||
          p.cidades_atendimento?.some(c => c.toLowerCase().includes(lowerQuery))
        );
      }

      return results;
    },
    enabled: activeTab === 'profissionais'
  });

  // Buscar vagas
  const { data: vagas = [], isLoading: loadingVagas } = useQuery({
    queryKey: ['search-vagas', searchQuery, filters],
    queryFn: async () => {
      const filter = { status: 'ABERTO' };
      if (filters.uf) filter.uf = filters.uf;
      if (filters.tipo_vaga) filter.tipo_vaga = filters.tipo_vaga;

      const results = await base44.entities.Job.filter(filter);

      // Filtrar por query e especialidade
      let filtered = results;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = results.filter(v =>
          v.titulo?.toLowerCase().includes(lowerQuery) ||
          v.cidade?.toLowerCase().includes(lowerQuery) ||
          v.especialidades_aceitas?.some(e => e.toLowerCase().includes(lowerQuery))
        );
      }
      if (filters.especialidade) {
        filtered = filtered.filter(v =>
          v.especialidades_aceitas?.includes(filters.especialidade)
        );
      }

      return filtered;
    },
    enabled: activeTab === 'vagas'
  });

  // Buscar clínicas
  const { data: clinicas = [], isLoading: loadingClinicas } = useQuery({
    queryKey: ['search-clinicas', searchQuery, filters],
    queryFn: async () => {
      const filter = { status_cadastro: 'APROVADO', ativo: true };
      if (filters.uf) filter.uf = filters.uf;
      if (filters.cidade) filter.cidade = filters.cidade;

      const results = await base44.entities.CompanyUnit.filter(filter);

      // Filtrar por query
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return results.filter(c =>
          c.nome_fantasia?.toLowerCase().includes(lowerQuery) ||
          c.cidade?.toLowerCase().includes(lowerQuery)
        );
      }

      return results;
    },
    enabled: activeTab === 'clinicas'
  });

  const handleSearch = (query, newFilters) => {
    setSearchQuery(query);
    setFilters(newFilters);
  };

  const getResultsCount = () => {
    switch (activeTab) {
      case 'profissionais': return profissionais.length;
      case 'vagas': return vagas.length;
      case 'clinicas': return clinicas.length;
      default: return 0;
    }
  };

  const isLoading = loadingProfs || loadingVagas || loadingClinicas;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-24">
      {/* Header */}
      <div className="bg-[#13132B] border-b border-white/5 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white mb-4">Buscar</h1>

          <AdvancedSearch
            tipo={activeTab}
            onSearch={handleSearch}
            onFilterChange={setFilters}
            placeholder={`Buscar ${activeTab}...`}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 bg-[#13132B] border border-white/5 rounded-xl p-1">
            <TabsTrigger
              value="profissionais"
              className="rounded-lg data-[state=active]:bg-brand-primary data-[state=active]:text-white text-gray-400 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Profissionais
            </TabsTrigger>
            <TabsTrigger
              value="vagas"
              className="rounded-lg data-[state=active]:bg-brand-primary data-[state=active]:text-white text-gray-400 hover:text-white transition-colors"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Vagas
            </TabsTrigger>
            <TabsTrigger
              value="clinicas"
              className="rounded-lg data-[state=active]:bg-brand-primary data-[state=active]:text-white text-gray-400 hover:text-white transition-colors"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Clínicas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Contador de resultados */}
        <div className="mb-4 text-sm text-gray-400">
          {getResultsCount()} resultado(s) encontrado(s)
        </div>

        {/* Resultados */}
        {isLoading ? (
          <ListSkeleton count={3} type={activeTab === 'vagas' ? 'vaga' : 'profissional'} />
        ) : (
          <>
            {/* Profissionais */}
            {activeTab === 'profissionais' && (
              profissionais.length === 0 ? (
                <EmptyState type="profissionais" />
              ) : (
                <div className="space-y-4">
                  {profissionais.map((prof) => (
                    <motion.div
                      key={prof.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#13132B] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-brand-primary/50 transition-all group"
                      onClick={() => navigate(createPageUrl(`VerProfissional?id=${prof.id}`))}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-white text-xl font-bold">
                          {prof.nome_completo?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white group-hover:text-brand-primary transition-colors">{prof.nome_completo}</h3>
                          <p className="text-sm text-gray-400">{prof.especialidade_principal}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{prof.cidades_atendimento?.[0]}</span>
                            {prof.media_avaliacoes > 0 && (
                              <>
                                <Star className="w-3 h-3 text-yellow-400 ml-2" />
                                <span className="text-xs text-gray-500">{prof.media_avaliacoes?.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-primary transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {/* Vagas */}
            {activeTab === 'vagas' && (
              vagas.length === 0 ? (
                <EmptyState type="vagas" />
              ) : (
                <div className="space-y-4">
                  {vagas.map((vaga) => (
                    <motion.div
                      key={vaga.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#13132B] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-brand-primary/50 transition-all group"
                      onClick={() => navigate(createPageUrl(`DetalheVaga?id=${vaga.id}`))}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded border border-blue-500/20">
                              {vaga.tipo_vaga}
                            </span>
                          </div>
                          <h3 className="font-bold text-white group-hover:text-brand-primary transition-colors">{vaga.titulo}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{vaga.cidade} - {vaga.uf}</span>
                          </div>
                          {vaga.valor_proposto && (
                            <p className="text-sm font-bold text-green-400 mt-2">
                              R$ {vaga.valor_proposto.toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-primary transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {/* Clínicas */}
            {activeTab === 'clinicas' && (
              clinicas.length === 0 ? (
                <EmptyState type="busca" title="Nenhuma clínica encontrada" />
              ) : (
                <div className="space-y-4">
                  {clinicas.map((clinica) => (
                    <motion.div
                      key={clinica.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#13132B] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-brand-primary/50 transition-all group"
                      onClick={() => navigate(createPageUrl(`PerfilClinicaPublico?id=${clinica.id}`))}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white group-hover:text-brand-secondary transition-colors">{clinica.nome_fantasia}</h3>
                          <p className="text-sm text-gray-400">{clinica.tipo_empresa}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{clinica.cidade} - {clinica.uf}</span>
                            {clinica.media_avaliacoes > 0 && (
                              <>
                                <Star className="w-3 h-3 text-yellow-400 ml-2" />
                                <span className="text-xs text-gray-500">{clinica.media_avaliacoes?.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-secondary transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}