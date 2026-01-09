import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  MapPin,
  ChevronLeft,
  List,
  Map as MapIcon,
  Zap,
  Filter
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Coordenadas aproximadas de capitais brasileiras
const coordenadasCidades = {
  "SAO PAULO": [-23.5505, -46.6333],
  "RIO DE JANEIRO": [-22.9068, -43.1729],
  "BELO HORIZONTE": [-19.9167, -43.9345],
  "BRASILIA": [-15.7942, -47.8822],
  "SALVADOR": [-12.9714, -38.5014],
  "FORTALEZA": [-3.7172, -38.5433],
  "CURITIBA": [-25.4284, -49.2733],
  "RECIFE": [-8.0476, -34.877],
  "PORTO ALEGRE": [-30.0346, -51.2177],
  "GOIANIA": [-16.6869, -49.2648],
  "MANAUS": [-3.119, -60.0217],
  "BELEM": [-1.4558, -48.4902],
  "CAMPINAS": [-22.9099, -47.0626],
  "GUARULHOS": [-23.4538, -46.5333],
  "SANTOS": [-23.9618, -46.3322]
};

const getCoordenadas = (cidade) => {
  const cidadeUpper = cidade?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return coordenadasCidades[cidadeUpper] || [-15.7942, -47.8822]; // Default: Brasília
};

export default function MapaOportunidades() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("map"); // map | list
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos | vagas | substituicoes

  const { data: vagas = [] } = useQuery({
    queryKey: ["vagas-mapa"],
    queryFn: () => base44.entities.Job.filter({ status: "ABERTO" })
  });

  const { data: substituicoes = [] } = useQuery({
    queryKey: ["substituicoes-mapa"],
    queryFn: () => base44.entities.SubstituicaoUrgente.filter({ status: "ABERTA" })
  });

  // Combinar e formatar oportunidades
  const oportunidades = [
    ...(filtroTipo === "substituicoes" ? [] : vagas.map(v => ({
      id: v.id,
      tipo: "vaga",
      titulo: v.titulo,
      cidade: v.cidade,
      uf: v.uf,
      valor: v.valor_proposto,
      tipoVaga: v.tipo_vaga,
      especialidade: v.especialidades_aceitas?.[0],
      coords: getCoordenadas(v.cidade)
    }))),
    ...(filtroTipo === "vagas" ? [] : substituicoes.map(s => ({
      id: s.id,
      tipo: "substituicao",
      titulo: s.titulo || `Substituição - ${s.especialidade_necessaria}`,
      cidade: s.cidade,
      uf: s.uf,
      valor: s.valor_diaria,
      tipoVaga: "SUBSTITUICAO",
      especialidade: s.especialidade_necessaria,
      coords: getCoordenadas(s.cidade),
      urgente: s.tipo_data === "IMEDIATO"
    })))
  ];

  // Centro do mapa (média das coordenadas ou Brasil)
  const centerLat = oportunidades.length > 0
    ? oportunidades.reduce((acc, o) => acc + o.coords[0], 0) / oportunidades.length
    : -15.7942;
  const centerLng = oportunidades.length > 0
    ? oportunidades.reduce((acc, o) => acc + o.coords[1], 0) / oportunidades.length
    : -47.8822;

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper,
        .custom-popup .leaflet-popup-tip {
          background: #13132B !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-popup .leaflet-popup-close-button {
          color: white !important;
        }
      `}</style>

      {/* Header */}
      <div className="bg-[#13132B] shadow-xl border-b border-white/10 px-4 py-4 sticky top-0 z-[1000]">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5">
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Voltar</span>
            </button>
            <h1 className="text-lg md:text-xl font-black text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-primary/20">
                <MapIcon className="w-5 h-5 text-brand-primary" />
              </div>
              Mapa de Oportunidades
            </h1>
            <div className="w-10 md:w-20" />
          </div>

          {/* Filtros e toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setFiltroTipo("todos")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${filtroTipo === "todos"
                  ? "bg-brand-primary/20 text-brand-primary border-brand-primary/30"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Todos ({oportunidades.length})
              </button>
              <button
                onClick={() => setFiltroTipo("vagas")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${filtroTipo === "vagas"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Vagas ({vagas.length})
              </button>
              <button
                onClick={() => setFiltroTipo("substituicoes")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${filtroTipo === "substituicoes"
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Substituições ({substituicoes.length})
              </button>
            </div>

            <div className="flex bg-[#0a0a1a] rounded-xl p-1 border border-white/10 self-end sm:self-auto">
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-all ${viewMode === "map" ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 relative">
        {viewMode === "map" ? (
          <div className="absolute inset-0 z-0">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={5}
              style={{ height: "100%", width: "100%", background: "#0a0a1a" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {oportunidades.map((op) => (
                <Marker key={`${op.tipo}-${op.id}`} position={op.coords}>
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        {op.tipo === "substituicao" && op.urgente && (
                          <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${op.tipo === "substituicao"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }`}>
                          {op.tipo === "substituicao" ? "Substituição" : "Vaga"}
                        </span>
                      </div>
                      <h3 className="font-bold text-white mb-1 leading-tight">{op.titulo}</h3>
                      <p className="text-sm text-gray-300 mb-2">{op.cidade} - {op.uf}</p>
                      {op.especialidade && (
                        <p className="text-xs text-purple-400 font-medium mb-2">{op.especialidade}</p>
                      )}
                      {op.valor && (
                        <p className="text-green-400 font-bold">
                          R$ {op.valor.toLocaleString("pt-BR")}
                        </p>
                      )}
                      <button
                        onClick={() => navigate(createPageUrl(op.tipo === "substituicao" ? "DetalheSubstituicao" : "DetalheVaga") + `?id=${op.id}`)}
                        className="w-full mt-3 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg hover:bg-brand-primary/80 transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 space-y-3 pb-24">
            {oportunidades.length === 0 ? (
              <div className="bg-[#13132B] rounded-2xl p-12 text-center border border-dashed border-white/10 mt-8">
                <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">Nenhuma oportunidade encontrada</h3>
              </div>
            ) : (
              oportunidades.map((op) => (
                <div
                  key={`${op.tipo}-${op.id}`}
                  onClick={() => navigate(createPageUrl(op.tipo === "substituicao" ? "DetalheSubstituicao" : "DetalheVaga") + `?id=${op.id}`)}
                  className="bg-[#13132B] border border-white/5 rounded-2xl p-5 shadow-lg cursor-pointer hover:border-brand-primary/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-brand-primary/10 transition-colors"></div>

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {op.tipo === "substituicao" && op.urgente && (
                          <Zap className="w-4 h-4 text-brand-orange fill-brand-orange animate-pulse" />
                        )}
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${op.tipo === "substituicao"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}>
                          {op.tipo === "substituicao" ? "Substituição" : "Vaga"}
                        </span>
                        {op.especialidade && (
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-medium">
                            {op.especialidade}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-lg group-hover:text-brand-primary transition-colors">{op.titulo}</h3>
                      <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                        <MapPin className="w-4 h-4 text-brand-secondary" />
                        <span>{op.cidade} - {op.uf}</span>
                      </div>
                    </div>
                    {op.valor && (
                      <div className="text-right pl-4">
                        <p className="text-green-400 font-bold text-lg">
                          R$ {op.valor.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}