import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Calendar, MapPin, Users, Edit, Trash2, ChevronLeft, ArrowLeft } from "lucide-react";

export default function EventosInstituicao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [instituicao, setInstituicao] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_evento: "",
    horario_inicio: "",
    local: "",
    vagas_totais: "",
    inscricoes_abertas: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const instResults = await base44.entities.EducationInstitution.filter({ user_id: currentUser.id });
        setInstituicao(instResults[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadData();
  }, []);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["eventos", instituicao?.id],
    queryFn: async () => {
      if (!instituicao) return [];
      // Usando Course como proxy para eventos por enquanto
      return await base44.entities.Course.filter({ institution_id: instituicao.id, tipo: "WORKSHOP" });
    },
    enabled: !!instituicao
  });

  const criarEventoMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Course.create({
        ...data,
        institution_id: instituicao.id,
        tipo: "WORKSHOP",
        area: instituicao.areas?.[0] || "MEDICINA",
        status: "ATIVO"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      toast.success("Evento criado!");
      setModalAberto(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      data_evento: "",
      horario_inicio: "",
      local: "",
      vagas_totais: "",
      inscricoes_abertas: true
    });
    setEventoEditando(null);
  };

  const handleCriar = () => {
    if (!formData.titulo || !formData.data_evento) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    criarEventoMutation.mutate({
      titulo: formData.titulo,
      descricao: formData.descricao,
      data_inicio: formData.data_evento,
      inscricoes_ate: formData.data_evento,
      especialidade: "Geral",
      carga_horaria: 4,
      duracao_meses: 0.1,
      modalidade: "PRESENCIAL",
      valor_total: 0,
      vagas_totais: parseInt(formData.vagas_totais) || 50,
      vagas_restantes: parseInt(formData.vagas_totais) || 50,
      cidade: instituicao?.cidade || "",
      uf: instituicao?.uf || "",
      imagem_principal_url: ""
    });
  };

  if (isLoading || !instituicao) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-6 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 p-2 -ml-2 rounded-lg hover:bg-white/5 w-fit">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Eventos e Workshops</h1>
            <p className="text-gray-400">Gerencie eventos da instituição</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Criar Evento
          </button>
        </div>

        {eventos.length === 0 ? (
          <div className="bg-[#13132B] rounded-3xl p-12 text-center shadow-xl border border-dashed border-white/10">
            <div className="text-8xl mb-6 opacity-30 grayscale">📅</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-4">Nenhum evento criado</h3>
            <button
              onClick={() => setModalAberto(true)}
              className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:scale-105 transition-all"
            >
              Criar Primeiro Evento
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {eventos.map((evento) => (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#13132B] border border-white/10 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:border-brand-primary/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">{evento.titulo}</h3>
                  <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-gray-400 mb-4 line-clamp-2">{evento.descricao}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-brand-secondary" />
                    <span>{new Date(evento.data_inicio).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-brand-primary" />
                    <span>{evento.vagas_restantes} vagas</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal Criar */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setModalAberto(false)}>
            <div className="bg-[#13132B] border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-[50px] pointer-events-none"></div>

              <h2 className="text-2xl font-black text-white mb-6 relative z-10">Criar Novo Evento</h2>

              <div className="space-y-4 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-primary transition-all outline-none"
                    placeholder="Nome do evento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Descrição *</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-primary transition-all outline-none min-h-[100px]"
                    placeholder="Detalhes do evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Data do Evento *</label>
                    <input
                      type="date"
                      value={formData.data_evento}
                      onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-primary transition-all outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Vagas</label>
                    <input
                      type="number"
                      value={formData.vagas_totais}
                      onChange={(e) => setFormData({ ...formData, vagas_totais: e.target.value })}
                      placeholder="50"
                      className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 text-white rounded-xl focus:border-brand-primary transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 relative z-10">
                <button
                  onClick={() => { setModalAberto(false); resetForm(); }}
                  className="flex-1 py-3 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriar}
                  disabled={criarEventoMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all disabled:opacity-50"
                >
                  {criarEventoMutation.isPending ? "Criando..." : "Criar Evento"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}