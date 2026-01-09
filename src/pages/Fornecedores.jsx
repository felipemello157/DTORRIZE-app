import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Package,
  ChevronLeft,
  MapPin,
  Star,
  CheckCircle,
  Search,
  Filter,
  Phone,
  Globe,
  Instagram
} from "lucide-react";

const tiposLabels = {
  EQUIPAMENTOS: "Equipamentos",
  MATERIAIS: "Materiais",
  SOFTWARE: "Software",
  MOVEIS: "Móveis",
  OUTROS: "Outros"
};

export default function Fornecedores() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [areaFiltro, setAreaFiltro] = useState("TODOS");

  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const results = await base44.entities.Supplier.filter({
        status_cadastro: "APROVADO",
        ativo: true
      });
      return results.sort((a, b) => (b.media_avaliacoes || 0) - (a.media_avaliacoes || 0));
    }
  });

  const fornecedoresFiltrados = fornecedores.filter(forn => {
    const matchBusca = !busca ||
      forn.nome_fantasia?.toLowerCase().includes(busca.toLowerCase()) ||
      forn.cidade?.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = tipoFiltro === "TODOS" || forn.tipo_produtos?.includes(tipoFiltro);
    const matchArea = areaFiltro === "TODOS" || forn.area_atuacao === areaFiltro;

    return matchBusca && matchTipo && matchArea;
  });

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Voltar
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Fornecedores</h1>
                <p className="text-gray-400">Parceiros verificados e qualificados</p>
              </div>
            </div>

            {/* Busca */}
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar fornecedor..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#13132B] border border-white/5 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-brand-primary" />
            <span className="font-bold text-white text-sm">Filtros</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all [&>option]:bg-[#13132B]"
            >
              <option value="TODOS">Todos os produtos</option>
              {Object.entries(tiposLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={areaFiltro}
              onChange={(e) => setAreaFiltro(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all [&>option]:bg-[#13132B]"
            >
              <option value="TODOS">Todas as áreas</option>
              <option value="ODONTOLOGIA">🦷 Odontologia</option>
              <option value="MEDICINA">⚕️ Medicina</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Lista */}
        {!isLoading && fornecedoresFiltrados.length === 0 && (
          <div className="bg-[#13132B] border border-white/10 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-gray-400">Tente buscar por outro termo ou limpar os filtros</p>
          </div>
        )}

        <div className="space-y-4">
          {fornecedoresFiltrados.map((forn) => (
            <motion.div
              key={forn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(createPageUrl("DetalheFornecedor") + "?id=" + forn.id)}
              className="bg-[#13132B] border border-white/5 rounded-3xl p-5 hover:border-brand-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex gap-4">
                {/* Logo */}
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {forn.logo_url ? (
                    <img src={forn.logo_url} alt={forn.nome_fantasia} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-white text-lg truncate group-hover:text-brand-primary transition-colors">{forn.nome_fantasia}</h3>
                    {forn.status_cadastro === "APROVADO" && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{forn.cidade} - {forn.uf}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {forn.tipo_produtos?.slice(0, 3).map((tipo, i) => (
                      <span key={i} className="px-2 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-lg text-xs font-bold">
                        {tiposLabels[tipo]}
                      </span>
                    ))}
                    {forn.tipo_produtos?.length > 3 && (
                      <span className="px-2 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-xs font-bold">
                        +{forn.tipo_produtos.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Avaliação */}
                  {forn.media_avaliacoes > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= forn.media_avaliacoes ? "fill-yellow-500 text-yellow-500" : "text-gray-700"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-white">{forn.media_avaliacoes.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({forn.total_avaliacoes})</span>
                    </div>
                  )}

                  {/* Contatos */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 pt-3 border-t border-white/5">
                    {forn.site && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Site</span>
                      </div>
                    )}
                    {forn.instagram && (
                      <div className="flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5" />
                        <span>@{forn.instagram}</span>
                      </div>
                    )}
                    {forn.whatsapp && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}