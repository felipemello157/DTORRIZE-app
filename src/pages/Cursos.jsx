import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useUserArea } from "@/components/hooks/useUserArea";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Filter,
  MapPin,
  Calendar,
  Users,
  Clock,
  Laptop,
  ChevronRight,
  Search,
  X
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoLabels = {
  POS_GRADUACAO: "Pós-Graduação",
  ESPECIALIZACAO: "Especialização",
  EXTENSAO: "Extensão",
  ATUALIZACAO: "Atualização",
  WORKSHOP: "Workshop",
  CONGRESSO: "Congresso"
};

const tiposCurso = [
  { value: "TODOS", label: "Todos os Tipos" },
  { value: "POS_GRADUACAO", label: "Pós-Graduação" },
  { value: "ESPECIALIZACAO", label: "Especialização" },
  { value: "EXTENSAO", label: "Extensão" },
  { value: "ATUALIZACAO", label: "Atualização" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "CONGRESSO", label: "Congresso" }
];

const modalidadeOpcoes = [
  { value: "TODOS", label: "Todas" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "EAD", label: "EAD" },
  { value: "HIBRIDO", label: "Híbrido" }
];

const ordenacaoOpcoes = [
  { value: "RELEVANTE", label: "Mais Relevantes" },
  { value: "MENOR_PRECO", label: "Menor Preço" },
  { value: "MAIOR_DESCONTO", label: "Maior Desconto" },
  { value: "INICIO_PROXIMO", label: "Início Próximo" }
];

export default function Cursos() {
  const navigate = useNavigate();
  const { userArea } = useUserArea();
  const [user, setUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filtros, setFiltros] = useState({
    tipo: "TODOS",
    modalidade: "TODOS",
    cidade: "",
    uf: "",
    precoMin: "",
    precoMax: ""
  });

  const [ordenacao, setOrdenacao] = useState("RELEVANTE");

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

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["courses-public"],
    queryFn: async () => {
      return await base44.entities.Course.filter({ status: "ATIVO" });
    }
  });

  const { data: instituicoes = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      return await base44.entities.EducationInstitution.filter({ status_cadastro: "APROVADO" });
    }
  });

  // Criar mapa de instituições
  const instituicoesMap = instituicoes.reduce((acc, inst) => {
    acc[inst.id] = inst;
    return acc;
  }, {});

  // Aplicar filtros
  const cursosFiltrados = cursos.filter((curso) => {
    // IMPORTANTE: Filtro por área do usuário
    if (userArea && curso.area !== userArea) return false;

    const tipoMatch = filtros.tipo === "TODOS" || curso.tipo === filtros.tipo;
    const modalidadeMatch = filtros.modalidade === "TODOS" || curso.modalidade === filtros.modalidade;

    const cidadeMatch = !filtros.cidade || curso.cidade?.toLowerCase().includes(filtros.cidade.toLowerCase());
    const ufMatch = !filtros.uf || curso.uf?.toUpperCase() === filtros.uf.toUpperCase();

    const valorFinal = curso.tem_desconto && curso.valor_com_desconto
      ? parseFloat(curso.valor_com_desconto)
      : parseFloat(curso.valor_total);

    const precoMinMatch = !filtros.precoMin || valorFinal >= parseFloat(filtros.precoMin);
    const precoMaxMatch = !filtros.precoMax || valorFinal <= parseFloat(filtros.precoMax);

    return tipoMatch && modalidadeMatch && cidadeMatch && ufMatch && precoMinMatch && precoMaxMatch;
  });

  // Ordenar cursos
  const cursosOrdenados = [...cursosFiltrados].sort((a, b) => {
    if (ordenacao === "MENOR_PRECO") {
      const precoA = a.tem_desconto && a.valor_com_desconto ? parseFloat(a.valor_com_desconto) : parseFloat(a.valor_total);
      const precoB = b.tem_desconto && b.valor_com_desconto ? parseFloat(b.valor_com_desconto) : parseFloat(b.valor_total);
      return precoA - precoB;
    }

    if (ordenacao === "MAIOR_DESCONTO") {
      const descontoA = a.tem_desconto ? parseFloat(a.percentual_desconto || 0) : 0;
      const descontoB = b.tem_desconto ? parseFloat(b.percentual_desconto || 0) : 0;
      return descontoB - descontoA;
    }

    if (ordenacao === "INICIO_PROXIMO") {
      const dataA = a.data_inicio ? new Date(a.data_inicio) : new Date(8640000000000000);
      const dataB = b.data_inicio ? new Date(b.data_inicio) : new Date(8640000000000000);
      return dataA - dataB;
    }

    // RELEVANTE: por destaque, depois visualizações
    if (a.destaque && !b.destaque) return -1;
    if (!a.destaque && b.destaque) return 1;
    return (b.visualizacoes || 0) - (a.visualizacoes || 0);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden pb-24">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Cursos Disponíveis</h1>
                <p className="text-gray-400">
                  {userArea === "ODONTOLOGIA" && "🦷 Cursos de Odontologia"}
                  {userArea === "MEDICINA" && "⚕️ Cursos de Medicina"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#13132B] border border-white/10 rounded-xl text-white hover:bg-white/5 transition-all"
            >
              <Filter className="w-5 h-5 text-brand-primary" />
              <span className="font-bold">Filtros</span>
              {showFilters ? <X className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1 rotate-90" />}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">Tipo</label>
                      <select
                        value={filtros.tipo}
                        onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all [&>option]:bg-[#13132B]"
                      >
                        {tiposCurso.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">Modalidade</label>
                      <select
                        value={filtros.modalidade}
                        onChange={(e) => setFiltros({ ...filtros, modalidade: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all [&>option]:bg-[#13132B]"
                      >
                        {modalidadeOpcoes.map((mod) => (
                          <option key={mod.value} value={mod.value}>{mod.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">Ordenar por</label>
                      <select
                        value={ordenacao}
                        onChange={(e) => setOrdenacao(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all [&>option]:bg-[#13132B]"
                      >
                        {ordenacaoOpcoes.map((ord) => (
                          <option key={ord.value} value={ord.value}>{ord.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">Cidade</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={filtros.cidade}
                          onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                          placeholder="Ex: São Paulo"
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">UF</label>
                      <input
                        type="text"
                        value={filtros.uf}
                        onChange={(e) => setFiltros({ ...filtros, uf: e.target.value })}
                        placeholder="SP"
                        maxLength={2}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">Preço Mín (R$)</label>
                      <input
                        type="number"
                        value={filtros.precoMin}
                        onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">Preço Máx (R$)</label>
                      <input
                        type="number"
                        value={filtros.precoMax}
                        onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })}
                        placeholder="10000"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resultados */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400 font-medium">
            <span className="text-white font-bold">{cursosOrdenados.length}</span> {cursosOrdenados.length === 1 ? "curso encontrado" : "cursos encontrados"}
          </p>
        </div>

        {/* Grid de Cursos */}
        {cursosOrdenados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#13132B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-400">Tente ajustar os filtros para ver mais resultados.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursosOrdenados.map((curso, index) => (
              <CursoCard
                key={curso.id}
                curso={curso}
                instituicao={instituicoesMap[curso.institution_id]}
                index={index}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CursoCard({ curso, instituicao, index, navigate }) {
  const valorFinal = curso.tem_desconto && curso.valor_com_desconto
    ? parseFloat(curso.valor_com_desconto)
    : parseFloat(curso.valor_total);

  const isOnline = curso.modalidade === "EAD";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(createPageUrl("DetalheCurso") + "?id=" + curso.id)}
      className="bg-[#13132B] border border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/30 transition-all cursor-pointer group"
    >
      {/* Imagem */}
      <div className="aspect-video overflow-hidden bg-white/5 relative">
        {curso.imagem_principal_url ? (
          <img
            src={curso.imagem_principal_url}
            alt={curso.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📚
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#13132B] to-transparent opacity-60"></div>

        {/* Badge Tipo */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-brand-primary/90 backdrop-blur-sm text-white rounded-full text-xs font-bold shadow-lg border border-brand-primary/20">
            {tipoLabels[curso.tipo]}
          </span>
        </div>

        {/* Badge Desconto */}
        {curso.tem_desconto && curso.percentual_desconto && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white rounded-full text-xs font-bold shadow-lg border border-red-500/20">
              {parseFloat(curso.percentual_desconto).toFixed(0)}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Instituição */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <GraduationCap className="w-3 h-3 text-brand-primary" />
          </div>
          <p className="text-sm text-brand-primary font-bold line-clamp-1">
            {instituicao?.nome_fantasia || "Instituição"}
          </p>
        </div>

        {/* Título */}
        <h3 className="text-lg font-black text-white mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
          {curso.titulo}
        </h3>

        {/* Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-400 bg-white/5 p-2 rounded-lg">
            <Laptop className="w-4 h-4 text-brand-secondary" />
            <span className="font-semibold text-gray-300">{curso.modalidade}</span>
            <span className="text-white/20">|</span>
            <Clock className="w-4 h-4 text-brand-secondary" />
            <span className="text-gray-300">{curso.carga_horaria}h</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>
              {isOnline ? "100% Online" : `${curso.cidade} - ${curso.uf}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              Início: <span className="text-gray-300">{curso.data_inicio ? format(new Date(curso.data_inicio), "dd/MM/yyyy", { locale: ptBR }) : "A definir"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{curso.vagas_restantes} vagas restantes</span>
          </div>
        </div>

        {/* Preço */}
        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mb-4 group-hover:border-white/10 transition-colors">
          <p className="text-xs text-gray-500 mb-1">Valor do investimento</p>
          {curso.tem_desconto && curso.percentual_desconto ? (
            <div>
              <p className="text-sm text-gray-600 line-through mb-1">
                De R$ {parseFloat(curso.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-brand-primary font-bold">Por</span>
                <p className="text-2xl font-black text-white">
                  R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-black text-white">
              R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
          {curso.numero_parcelas && curso.valor_parcela && (
            <p className="text-xs text-gray-500 mt-1">
              ou {curso.numero_parcelas}x de R$ {parseFloat(curso.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Botão */}
        <button className="w-full py-3 bg-white/10 hover:bg-brand-primary text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-brand-primary/20">
          Ver Detalhes
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}