import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Star,
  Building2,
  MapPin,
  Phone,
  Mail,
  Share2,
  CheckCircle2,
  Briefcase,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Flag
} from "lucide-react";
import { toast } from "sonner";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";
import { motion } from "framer-motion";

export default function PerfilClinicaPublico() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const queryId = searchParams.get('id');
  const id = paramId || queryId;

  // Buscar unidade da clínica
  const { data: unit, isLoading, isError } = useQuery({
    queryKey: ["companyUnitPublic", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await base44.entities.CompanyUnit.filter({ id });
      return result[0] || null;
    },
    enabled: !!id,
    retry: 1
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["unitRatings", id],
    queryFn: async () => {
      if (!id) return [];
      return await base44.entities.Rating.filter({
        avaliado_id: id,
        avaliado_tipo: "CLINICA"
      });
    },
    enabled: !!id
  });

  // Buscar vagas abertas
  const { data: jobs = [] } = useQuery({
    queryKey: ["unitJobs", id],
    queryFn: async () => {
      if (!id) return [];
      return await base44.entities.Job.filter({
        unit_id: id,
        status: "ABERTO"
      });
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-coral mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (isError || !unit || !id) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-white font-bold text-xl mb-2">Clínica não encontrada</p>
          <p className="text-gray-400 mb-4">Este perfil pode ter sido removido ou não existe.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Calcular avaliações
  const mediaAvaliacoes = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.nota, 0) / ratings.length)
    : 0;

  // Distribuição de estrelas
  const distribuicao = [5, 4, 3, 2, 1].map(estrela => ({
    estrelas: estrela,
    count: ratings.filter(r => r.nota === estrela).length
  }));

  // Formatar CEP
  const formatarCEP = (cep) => {
    if (!cep) return "";
    return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  };

  // Fotos da clínica
  const fotos = [
    unit.foto_fachada_url,
    unit.foto_recepcao_url,
    unit.foto_consultorio_url
  ].filter(Boolean);

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${unit.nome_fantasia}`,
        text: `${unit.tipo_empresa} - ${unit.cidade}/${unit.uf}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const tipoLabels = {
    CLINICA: "Clínica",
    CONSULTORIO: "Consultório",
    HOSPITAL: "Hospital",
    LABORATORIO: "Laboratório",
    FORNECEDOR: "Fornecedor"
  };

  const mundoLabels = {
    ODONTOLOGIA: "🦷 Odontologia",
    MEDICINA: "🩺 Medicina",
    AMBOS: "🦷🩺 Odontologia e Medicina"
  };

  const tipoVagaConfig = {
    PLANTAO: { label: "Plantão", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
    FIXO: { label: "Fixo", color: "bg-green-500/10 text-green-400 border border-green-500/20" },
    SUBSTITUICAO: { label: "Substituição", color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" },
    TEMPORARIO: { label: "Temporário", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20" }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* HEADER */}
      <div className="relative pt-10 pb-32 px-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          {/* Nav Bar */}
          <div className="flex items-center justify-between py-2 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={() => navigate(createPageUrl("Denunciar") + "?tipo=CLINICA&id=" + id)}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-medium transition-colors"
              title="Denunciar"
            >
              <Flag className="w-5 h-5" />
              <span className="text-sm">Denunciar</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Foto/Logo */}
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-brand-coral to-brand-orange mb-6 shadow-2xl relative group">
              <div className="absolute inset-0 rounded-full bg-brand-coral/50 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-full rounded-full bg-[#1a1a2e] flex items-center justify-center text-white text-4xl font-black relative z-10">
                {unit.foto_fachada_url ? (
                  <img src={unit.foto_fachada_url} alt="Logo" className="w-full h-full object-cover rounded-full" />
                ) : (
                  unit.nome_fantasia?.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Nome e Info */}
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
              {unit.nome_fantasia}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {unit.status_cadastro === "APROVADO" && (
                <span className="px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 font-bold rounded-full text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Verificada
                </span>
              )}
              <span className="px-4 py-1.5 bg-white/10 text-gray-300 border border-white/10 font-bold rounded-full text-sm">
                {tipoLabels[unit.tipo_empresa]}
              </span>
            </div>

            <p className="text-gray-300 text-lg font-medium mb-8 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-coral" />
              {unit.cidade} - {unit.uf}
            </p>

            <button
              onClick={handleCompartilhar}
              className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all border border-white/10"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 pb-12 space-y-6 relative z-10">

        {/* SEÇÃO AVALIAÇÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/20">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Avaliações</h2>
              <p className="text-gray-400">Reputação na plataforma</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="text-center">
              <p className="text-6xl font-black text-white mb-2">{mediaAvaliacoes.toFixed(1)}</p>
              <div className="flex gap-1 mb-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(mediaAvaliacoes) ? "fill-brand-orange text-brand-orange" : "text-gray-700"
                      }`}
                  />
                ))}
              </div>
              <p className="text-gray-500">{ratings.length} avaliações</p>
            </div>

            {/* Distribuição */}
            <div className="flex-1 w-full space-y-3">
              {distribuicao.map(({ estrelas, count }) => (
                <div key={estrelas} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-400 w-8">{estrelas} ★</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-coral to-brand-orange"
                      style={{ width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* INFORMAÇÕES DA CLÍNICA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/20">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Sobre</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
              <Building2 className="w-6 h-6 text-brand-orange mt-1" />
              <div>
                <p className="text-sm text-gray-400 mb-1">Tipo de Empresa</p>
                <p className="font-bold text-white text-lg">{tipoLabels[unit.tipo_empresa]}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
              <Star className="w-6 h-6 text-brand-orange mt-1" />
              <div>
                <p className="text-sm text-gray-400 mb-1">Área de Atuação</p>
                <p className="font-bold text-white text-lg">{mundoLabels[unit.tipo_mundo]}</p>
              </div>
            </div>
          </div>

          {/* Responsável Técnico */}
          {unit.nome_responsavel && (
            <div className="mt-4 p-5 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-start gap-4">
                <Users className="w-6 h-6 text-brand-pink mt-1" />
                <div>
                  <p className="text-sm text-gray-400 mb-2">Responsável Técnico</p>
                  <p className="font-bold text-white text-lg">{unit.nome_responsavel}</p>
                  <div className="flex gap-4 mt-2">
                    {unit.cro_responsavel && (
                      <p className="text-sm text-gray-500">CRO: {unit.cro_responsavel}</p>
                    )}
                    {unit.crm_responsavel && (
                      <p className="text-sm text-gray-500">CRM: {unit.crm_responsavel}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ENDEREÇO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/20">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Endereço</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 text-lg">
              <strong className="text-white block mb-1">{unit.endereco}, {unit.numero}</strong>
              {unit.complemento && <span className="block text-gray-500 mb-1">{unit.complemento}</span>}
              <span className="block">{unit.bairro} - {unit.cidade}/{unit.uf}</span>
            </p>
            <p className="text-gray-500">
              CEP: {formatarCEP(unit.cep)}
            </p>

            {unit.ponto_referencia && (
              <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-200">
                <p className="text-sm text-yellow-500/80 mb-1">Ponto de Referência</p>
                <p className="font-medium">{unit.ponto_referencia}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* FOTOS */}
        {fotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/20">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Fotos da Clínica</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
              {fotos.map((foto, index) => (
                <div key={index} className="flex-shrink-0 snap-start">
                  <img
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className="w-72 h-56 object-cover rounded-2xl border border-white/10 shadow-xl"
                    onClick={() => window.open(foto, "_blank")}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VAGAS ABERTAS */}
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/20">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between flex-1">
                <div>
                  <h2 className="text-2xl font-bold text-white">Vagas Abertas</h2>
                  <p className="text-gray-400 text-sm">{jobs.length} oportunidades disponíveis</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-brand-coral/50 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => navigate(createPageUrl("DetalheVaga") + "?id=" + job.id)}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`px-3 py-1 ${tipoVagaConfig[job.tipo_vaga]?.color} font-bold rounded-full text-xs`}>
                          {tipoVagaConfig[job.tipo_vaga]?.label}
                        </span>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-full text-xs">
                          {job.tipo_profissional === "DENTISTA" ? "🦷 Dentista" : "🩺 Médico"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-coral transition-colors">{job.titulo}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{job.descricao}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {job.horario_inicio && job.horario_fim && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{job.horario_inicio} - {job.horario_fim}</span>
                          </div>
                        )}
                        {job.valor_proposto && job.tipo_remuneracao !== "A_COMBINAR" && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="font-bold text-green-400">
                              R$ {job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-coral group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* REDES SOCIAIS E LOCALIZAÇÃO */}
        {(unit.instagram_clinica || unit.google_maps_link) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/20">
                <Share2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Redes & Localização</h2>
            </div>

            <div className="grid gap-4">
              {unit.instagram_clinica && (
                <a
                  href={`https://instagram.com/${unit.instagram_clinica.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-pink-500/20 hover:border-pink-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Instagram</p>
                      <p className="font-bold text-white">{unit.instagram_clinica}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-pink-500 transition-colors" />
                </a>
              )}

              {unit.google_maps_link && (
                <a
                  href={unit.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Localização</p>
                      <p className="font-bold text-white">Ver no Google Maps</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* CONTATO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/20">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Contato</h2>
          </div>

          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="flex items-center justify-between p-5 bg-green-500/10 rounded-2xl border border-green-500/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/50">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">WhatsApp</p>
                  <p className="font-bold text-white">
                    ({unit.whatsapp?.slice(0, 2)}) {unit.whatsapp?.slice(2, 7)}-{unit.whatsapp?.slice(7)}
                  </p>
                </div>
              </div>
              <WhatsAppSafeButton
                phone={unit.whatsapp}
                message={`Olá! Vi o perfil de ${unit.nome_fantasia} na Doutorizze e gostaria de conversar.`}
                buttonText="Abrir"
                className="px-6 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg"
              />
            </div>

            {/* Telefone Fixo */}
            {unit.telefone_fixo && (
              <div className="flex items-center gap-4 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/50">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Telefone Fixo</p>
                  <p className="font-bold text-white">
                    ({unit.telefone_fixo?.slice(0, 2)}) {unit.telefone_fixo?.slice(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-4 p-5 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-900/50">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-bold text-white">{unit.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ESTATÍSTICAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-[#13132B]/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300 mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{jobs.length}</p>
            <p className="text-sm text-gray-500">Vagas Abertas</p>
          </div>

          <div className="bg-[#13132B]/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300 mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{unit.total_contratacoes || 0}</p>
            <p className="text-sm text-gray-500">Contratações</p>
          </div>

          <div className="bg-[#13132B]/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300 mb-3">
              <Star className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{mediaAvaliacoes.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avaliação Média</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}