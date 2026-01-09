import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useUserArea } from "@/components/hooks/useUserArea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from
  "@/components/ui/select";
import RadarActivationModal from "../components/marketplace/RadarActivationModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Search,
  MapPin,
  Radar,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Tag,
  ArrowRight,
  Filter
} from "lucide-react";

export default function Marketplace() {
  const navigate = useNavigate();
  const { userArea, isAdmin, loading: loadingUserArea } = useUserArea();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [radarModalOpen, setRadarModalOpen] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["marketplaceItems", userArea, isAdmin, searchTerm, selectedCity, priceRange, condition],
    queryFn: async () => {
      try {
        // Admin vê tudo, outros usuários veem apenas sua área
        const where = isAdmin
          ? { status: "ATIVO" }
          : { status: "ATIVO", tipo_mundo: userArea };
        const result = await base44.entities.MarketplaceItem.filter(where);
        return result || [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!userArea,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });


  // Filtrar items
  const filteredItems = items.filter((item) => {
    const matchSearch = item.titulo_item?.
      toLowerCase().
      includes(searchTerm.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marca?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCity =
      selectedCity === "all" || item.localizacao?.includes(selectedCity);
    const matchCondition =
      condition === "all" || item.condicao === condition;

    let matchPrice = true;
    if (priceRange !== "all") {
      const price = item.preco || 0;
      switch (priceRange) {
        case "0-5000":
          matchPrice = price <= 5000;
          break;
        case "5000-15000":
          matchPrice = price > 5000 && price <= 15000;
          break;
        case "15000-30000":
          matchPrice = price > 15000 && price <= 30000;
          break;
        case "30000+":
          matchPrice = price > 30000;
          break;
      }
    }

    return matchSearch && matchCity && matchPrice && matchCondition;
  });

  // Ordenar items com ranking
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.created_date) - new Date(a.created_date);
      case "oldest":
        return new Date(a.created_date) - new Date(b.created_date);
      case "price-asc":
        return (a.preco || 0) - (b.preco || 0);
      case "price-desc":
        return (b.preco || 0) - (a.preco || 0);
      case "relevant":
        // Usar score de ranking do motor de score
        const rankingA = a.score_ranking || 0;
        const rankingB = b.score_ranking || 0;
        return rankingB - rankingA;
      default:
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  // Reset página ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, priceRange, condition, sortBy]);

  const cities = [...new Set(items.map((item) => item.localizacao))].filter(
    Boolean
  );

  if (isLoading || loadingUserArea) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <ShoppingBag className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Erro ao carregar</h2>
          <p className="text-gray-400 mb-6">Não foi possível carregar o marketplace. Tente novamente.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-4 rounded-xl">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Hero */}
        <div className="bg-[#13132B] border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-coral/5 to-brand-orange/5" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-brand-coral to-brand-orange rounded-lg shadow-lg shadow-brand-orange/20">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-brand-orange font-bold tracking-wider text-sm uppercase">Doutorizze Marketplace</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Equipamentos Premium para<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-coral to-brand-orange">
                  {userArea === "ODONTOLOGIA" ? "Sua Clínica Odontológica" : "Sua Clínica Médica"}
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Encontre os melhores equipamentos novos e seminovos, ou anuncie o que você não usa mais para milhares de profissionais.
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <button
                onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
                className="py-4 px-6 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-orange/20 hover:scale-[1.02] transition-all">
                <Plus className="w-5 h-5" />
                Anunciar Grátis
              </button>
              <div className={`px-4 py-2 rounded-lg border border-white/10 text-center font-bold text-sm ${userArea === "ODONTOLOGIA" ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"
                }`}>
                {isAdmin ? "👑 Modo Admin" : userArea === "ODONTOLOGIA" ? "🦷 Área Odontológica" : "⚕️ Área Médica"}
              </div>
            </div>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-[#13132B]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="O que você está procurando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-xl border font-bold flex items-center gap-2 transition-all ${showFilters
                  ? "bg-brand-orange/10 border-brand-orange text-brand-orange"
                  : "bg-[#0a0a1a] border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {/* Badge de contador de filtros ativos */}
              {([selectedCity !== "all", priceRange !== "all", condition !== "all"].filter(Boolean).length > 0) && (
                <span className="ml-1 w-5 h-5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center">
                  {[selectedCity !== "all", priceRange !== "all", condition !== "all"].filter(Boolean).length}
                </span>
              )}
            </button>
            <div className="w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-full bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent className="bg-[#13132B] border-white/10 text-white">
                  <SelectItem value="relevant">Mais Relevantes</SelectItem>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-4 pt-6 mt-4 border-t border-white/10">
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Localização</label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Todas as cidades" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13132B] border-white/10 text-white">
                        <SelectItem value="all">Todas as cidades</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Faixa de Preço</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="Todos os preços" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13132B] border-white/10 text-white">
                        <SelectItem value="all">Todos os preços</SelectItem>
                        <SelectItem value="0-5000">Até R$ 5.000</SelectItem>
                        <SelectItem value="5000-15000">R$ 5.000 - R$ 15.000</SelectItem>
                        <SelectItem value="15000-30000">R$ 15.000 - R$ 30.000</SelectItem>
                        <SelectItem value="30000+">Acima de R$ 30.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Condição</label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="h-12 bg-[#0a0a1a] border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="Todas as condições" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13132B] border-white/10 text-white">
                        <SelectItem value="all">Todas as condições</SelectItem>
                        <SelectItem value="NOVO">Novo</SelectItem>
                        <SelectItem value="SEMINOVO">Seminovo</SelectItem>
                        <SelectItem value="USADO">Usado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(selectedCity !== "all" || priceRange !== "all" || condition !== "all" || searchTerm) && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCity("all");
                  setPriceRange("all");
                  setCondition("all");
                }}
                className="text-gray-400 hover:text-brand-orange font-semibold text-sm transition-colors">
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Radar Banner */}
        <div className="mb-8 p-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group" onClick={() => setRadarModalOpen(true)}>
          <div className="bg-[#13132B] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group-hover:bg-[#13132B]/80 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Radar de Oportunidades</h3>
                <p className="text-gray-400 text-sm">Seja avisado quando o equipamento que você procura for anunciado.</p>
              </div>
            </div>
            <button className="whitespace-nowrap px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all group-hover:scale-105">
              Ativar Radar 📡
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Destaques
            <span className="ml-3 px-2 py-0.5 bg-white/10 text-white text-xs rounded-full">{sortedItems.length}</span>
          </h2>
        </div>

        {/* Grid de Items */}
        {sortedItems.length === 0 ? (
          <div className="bg-[#13132B]/60 backdrop-blur-md border border-white/10 rounded-3xl p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Item não encontrado</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Não encontramos nenhum equipamento com esses filtros. Tente buscar por outros termos ou ative o radar.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCity("all");
                  setPriceRange("all");
                  setCondition("all");
                }}
                className="px-6 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 font-bold transition-all">
                Limpar Filtros
              </button>
              <button
                onClick={() => setRadarModalOpen(true)}
                className="px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20">
                Criar Alerta no Radar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {paginatedItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={item.id}
                onClick={() => navigate(createPageUrl(`MarketplaceDetail?id=${item.id}`))}
                className="bg-[#13132B] border border-white/5 rounded-3xl overflow-hidden hover:border-brand-orange/50 hover:shadow-2xl hover:shadow-brand-orange/10 transition-all duration-300 group cursor-pointer flex flex-col h-full"
              >
                {/* Imagem */}
                <div className="relative h-48 bg-[#0a0a1a] overflow-hidden">
                  {item.fotos && item.fotos.length > 0 ? (
                    <img
                      src={item.fotos[0]}
                      alt={item.titulo_item}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-white/5">
                      📷
                    </div>
                  )}

                  {/* Overlay gradiente em baixo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13132B] to-transparent opacity-80" />

                  {/* Badge Condição */}
                  <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full border shadow-lg backdrop-blur-md ${item.condicao === "NOVO"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : item.condicao === "SEMINOVO"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }`}>
                    {item.condicao === "NOVO" ? "Novo" : item.condicao === "SEMINOVO" ? "Seminovo" : "Usado"}
                  </div>

                  {/* Badge Destaque */}
                  {item.pode_destacar && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-brand-orange text-white text-[10px] font-bold rounded shadow-lg flex items-center gap-1">
                      ✨ Destaque
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{item.marca || "Genérico"}</span>
                    {item.score_ranking >= 70 && (
                      <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold" title="Score de qualidade">
                        <Tag className="w-3 h-3" />
                        {item.score_ranking}
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors">
                    {item.titulo_item}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Valor</p>
                        <p className="text-xl font-black text-white">
                          R$ {item.preco?.toLocaleString('pt-BR') || '0'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{item.localizacao}</span>
                    </div>

                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group-hover:border-brand-orange/30 group-hover:text-brand-orange">
                      Ver Detalhes
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-12">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="bg-[#13132B] border-white/10 text-white hover:bg-white/5 hover:text-white disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant="ghost"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-bold ${currentPage === pageNum
                        ? "bg-brand-orange text-white"
                        : "bg-[#13132B] text-gray-400 hover:text-white hover:bg-white/10"
                      }`}>
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="bg-[#13132B] border-white/10 text-white hover:bg-white/5 hover:text-white disabled:opacity-30">
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Radar Modal */}
      <RadarActivationModal
        open={radarModalOpen}
        onOpenChange={setRadarModalOpen}
        initialCategory={userArea}
        initialSearch={searchTerm}
      />
    </div>
  );
}