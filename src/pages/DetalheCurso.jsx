import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  GraduationCap,
  Clock,
  Calendar,
  MapPin,
  Award,
  Share2,
  ExternalLink,
  Building2,
  Laptop,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

const tipoLabels = {
  POS_GRADUACAO: "Pós-Graduação",
  ESPECIALIZACAO: "Especialização",
  EXTENSAO: "Extensão",
  ATUALIZACAO: "Atualização",
  WORKSHOP: "Workshop",
  CONGRESSO: "Congresso"
};

const modalidadeLabels = {
  PRESENCIAL: "Presencial",
  EAD: "100% Online (EAD)",
  HIBRIDO: "Híbrido (Presencial + EAD)"
};

export default function DetalheCurso() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const queryClient = useQueryClient();
  const [imagemAtiva, setImagemAtiva] = useState(0);

  const { data: curso, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const cursos = await base44.entities.Course.filter({ id });
      if (!cursos || cursos.length === 0) throw new Error("Curso não encontrado");
      return cursos[0];
    }
  });

  const { data: instituicao } = useQuery({
    queryKey: ["institution", curso?.institution_id],
    queryFn: async () => {
      if (!curso?.institution_id) return null;
      const insts = await base44.entities.EducationInstitution.filter({ id: curso.institution_id });
      return insts[0] || null;
    },
    enabled: !!curso?.institution_id
  });

  const incrementarVisualizacaoMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Course.update(id, {
        visualizacoes: (curso.visualizacoes || 0) + 1
      });
    }
  });

  useEffect(() => {
    if (curso) {
      incrementarVisualizacaoMutation.mutate();
    }
  }, [curso?.id]);

  const handleCompartilhar = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: curso.titulo,
          text: `Confira este curso: ${curso.titulo}`,
          url
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error("Erro ao compartilhar");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("✅ Link copiado!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <GraduationCap className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Curso não encontrado</h2>
          <p className="text-gray-400 mb-6">O curso que você procura não existe ou foi removido.</p>
          <button
            onClick={() => navigate(createPageUrl("Cursos"))}
            className="px-8 py-4 bg-[#13132B] border border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-all"
          >
            Ver Todos os Cursos
          </button>
        </div>
      </div>
    );
  }

  const valorFinal = curso.tem_desconto && curso.valor_com_desconto
    ? parseFloat(curso.valor_com_desconto)
    : parseFloat(curso.valor_total);

  const percentualVagasRestantes = curso.vagas_totais > 0
    ? (curso.vagas_restantes / curso.vagas_totais) * 100
    : 0;

  const todasImagens = [
    curso.imagem_principal_url,
    ...(curso.imagens_extras || [])
  ].filter(Boolean);

  const mensagemWhatsApp = `Olá! Gostaria de mais informações sobre o curso "${curso.titulo}".`;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-32">
      {/* Header com Imagem Hero */}
      <div className="relative">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all border border-white/10 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="aspect-[16/9] md:aspect-[21/7] overflow-hidden bg-[#13132B] relative">
          {curso.imagem_principal_url ? (
            <>
              <img
                src={curso.imagem_principal_url}
                alt={curso.titulo}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-9xl bg-gradient-to-br from-brand-orange/20 to-brand-coral/20">
              📚
            </div>
          )}

          {/* Badge Tipo */}
          <div className="absolute top-6 right-6 z-20">
            <span className="px-4 py-2 bg-blue-500/80 backdrop-blur text-white rounded-full text-sm font-bold shadow-lg border border-white/10">
              {tipoLabels[curso.tipo]}
            </span>
          </div>

          {/* Wrapper do Título no Hero */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
            <div className="max-w-6xl mx-auto">
              {/* Badge Desconto Mobile */}
              {curso.tem_desconto && curso.percentual_desconto && (
                <div className="inline-block mb-4 md:hidden">
                  <span className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-black shadow-lg">
                    {parseFloat(curso.percentual_desconto).toFixed(0)}% OFF
                  </span>
                </div>
              )}

              {instituicao && (
                <div className="flex items-center gap-3 mb-4 opacity-0 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                  {instituicao.logo_url ? (
                    <img
                      src={instituicao.logo_url}
                      alt={instituicao.nome_fantasia}
                      className="w-10 h-10 rounded-lg object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <p className="text-white font-medium text-lg text-shadow">{instituicao.nome_fantasia}</p>
                </div>
              )}

              <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight text-shadow-lg max-w-4xl">
                {curso.titulo}
              </h1>

              {/* Badges Info */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-200 rounded-xl font-bold backdrop-blur-sm">
                  <GraduationCap className="w-5 h-5" />
                  {curso.area}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-200 rounded-xl font-bold backdrop-blur-sm">
                  <Laptop className="w-5 h-5" />
                  {curso.modalidade}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-200 rounded-xl font-bold backdrop-blur-sm">
                  <Clock className="w-5 h-5" />
                  {curso.carga_horaria}h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Informações */}
          <div className="lg:col-span-2 space-y-6">

            {/* Descrição */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-orange" />
                Sobre o Curso
              </h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {curso.descricao}
              </p>
            </motion.div>

            {/* Informações Detalhadas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h2 className="text-xl font-black text-white mb-6">Informações Detalhadas</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <div className="mt-1">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Especialidade</p>
                    <p className="font-bold text-white">{curso.especialidade}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <div className="mt-1">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duração</p>
                    <p className="font-bold text-white">{curso.duracao_meses} meses</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <div className="mt-1">
                    <Laptop className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Modalidade</p>
                    <p className="font-bold text-white">{modalidadeLabels[curso.modalidade]}</p>
                  </div>
                </div>

                {curso.certificacao && (
                  <div className="flex items-start gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-white/5">
                    <div className="mt-1">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Certificação</p>
                      <p className="font-bold text-white">{curso.certificacao}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Datas Importantes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
            >
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-orange" />
                Datas Importantes
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#0a0a1a] rounded-xl border border-white/5 hover:border-brand-orange/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-orange" />
                    <div>
                      <p className="text-sm text-gray-500">Inscrições até</p>
                      <p className="font-bold text-white">
                        {format(new Date(curso.inscricoes_ate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0a0a1a] rounded-xl border border-white/5 hover:border-green-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-500">Início do curso</p>
                      <p className="font-bold text-white">
                        {format(new Date(curso.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                {curso.data_fim && (
                  <div className="flex items-center justify-between p-4 bg-[#0a0a1a] rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-500">Término previsto</p>
                        <p className="font-bold text-white">
                          {format(new Date(curso.data_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Localização */}
            {(curso.modalidade === "PRESENCIAL" || curso.modalidade === "HIBRIDO") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
              >
                <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-orange" />
                  Localização
                </h2>

                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-1">{curso.cidade} - {curso.uf}</p>
                    {curso.endereco && (
                      <p className="text-gray-400 text-sm">{curso.endereco}</p>
                    )}
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${curso.endereco || ""} ${curso.cidade} ${curso.uf}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#0a0a1a] border border-white/10 text-gray-300 font-bold rounded-xl hover:text-white hover:bg-white/5 transition-all"
                >
                  Ver no Google Maps
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            )}

            {/* Galeria */}
            {todasImagens.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
              >
                <h2 className="text-xl font-black text-white mb-4">Galeria</h2>

                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-2xl mb-4 bg-black/50">
                    <img
                      src={todasImagens[imagemAtiva]}
                      alt={`Imagem ${imagemAtiva + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {todasImagens.length > 1 && (
                    <>
                      <button
                        onClick={() => setImagemAtiva(Math.max(0, imagemAtiva - 1))}
                        disabled={imagemAtiva === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition-all disabled:opacity-30 border border-white/10 text-white"
                      >
                        <ChevronLeftIcon className="w-6 h-6" />
                      </button>

                      <button
                        onClick={() => setImagemAtiva(Math.min(todasImagens.length - 1, imagemAtiva + 1))}
                        disabled={imagemAtiva === todasImagens.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition-all disabled:opacity-30 border border-white/10 text-white"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {todasImagens.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImagemAtiva(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${imagemAtiva === index ? "border-brand-orange opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Instituição */}
            {instituicao && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6"
              >
                <h2 className="text-xl font-black text-white mb-4">Sobre a Instituição</h2>

                <div className="flex items-start gap-4 mb-4">
                  {instituicao.logo_url ? (
                    <img
                      src={instituicao.logo_url}
                      alt={instituicao.nome_fantasia}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">{instituicao.nome_fantasia}</h3>
                    <p className="text-gray-400 mb-2">{instituicao.tipo_instituicao}</p>
                    <p className="text-sm text-gray-500">{instituicao.cidade} - {instituicao.uf}</p>
                  </div>
                </div>

                {instituicao.site && (
                  <a
                    href={instituicao.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#0a0a1a] border border-white/10 text-gray-300 font-bold rounded-xl hover:text-white hover:bg-white/5 transition-all"
                  >
                    Visitar Site
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            )}
          </div>

          {/* Coluna Direita - Cards Fixos */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#13132B] rounded-3xl border border-white/10 shadow-xl p-6 sticky top-6"
            >
              <h3 className="text-lg font-black text-white mb-4">Investimento</h3>

              {curso.tem_desconto && curso.percentual_desconto ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-gray-500 line-through">
                      De R$ {parseFloat(curso.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">
                      -{parseFloat(curso.percentual_desconto).toFixed(0)}%
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-4xl font-black text-brand-orange">
                      R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="text-sm text-green-400 font-bold mb-4">
                    Economia de R$ {(parseFloat(curso.valor_total) - valorFinal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </>
              ) : (
                <p className="text-4xl font-black text-brand-orange mb-4">
                  R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              )}

              {curso.numero_parcelas && curso.valor_parcela && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                  <p className="text-sm text-blue-200">
                    ou <span className="font-bold text-white">{curso.numero_parcelas}x de R$ {parseFloat(curso.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              )}

              {/* Vagas */}
              <div className="mb-6 p-4 bg-[#0a0a1a] border border-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-400">Vagas Restantes</span>
                  <span className="text-sm font-bold text-brand-orange">
                    {curso.vagas_restantes}/{curso.vagas_totais}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-orange to-brand-coral rounded-full transition-all"
                    style={{ width: `${percentualVagasRestantes}%` }}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <WhatsAppSafeButton
                  phone={instituicao?.whatsapp}
                  message={mensagemWhatsApp}
                  className="w-full py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-brand-orange/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Quero me Inscrever
                </WhatsAppSafeButton>

                <button
                  onClick={handleCompartilhar}
                  className="w-full py-3 bg-[#0a0a1a] border border-white/10 text-gray-300 font-bold rounded-xl hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}