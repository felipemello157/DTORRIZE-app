import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Tag,
  FileText,
  ArrowLeft,
  LifeBuoy
} from "lucide-react";

export default function FuncionalidadeDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [funcionalidade, setFuncionalidade] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simular carregamento de dados
        // Em produção, substituir por chamada real à API
        await new Promise(resolve => setTimeout(resolve, 500));

        setFuncionalidade({
          id: id,
          titulo: "Funcionalidade Premium",
          descricao: "Esta é uma descrição detalhada da funcionalidade. Aqui você encontrará informações completas sobre como utilizar este recurso, seus benefícios e configurações disponíveis.",
          status: "ATIVO",
          categoria: "Sistema",
          data_criacao: new Date().toISOString(),
          responsavel: "Administrador"
        });
      } catch (error) {
        toast.error("Erro ao carregar detalhes");
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-brand-primary"></div>
      </div>
    );
  }

  if (!funcionalidade) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#13132B] rounded-3xl p-8 text-center border border-white/10 shadow-2xl">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Funcionalidade não encontrada</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all w-full"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-24 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative pt-6 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <Info className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Detalhes da Funcionalidade</h1>
              <p className="text-gray-400">Informações completas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10 space-y-6">
        {/* Card Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{funcionalidade.titulo}</h2>
              <div className="flex items-center gap-2">
                {funcionalidade.status === "ATIVO" ? (
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm font-bold flex items-center gap-2 border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Ativo
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-500/10 text-gray-400 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-500/20">
                    <Clock className="w-4 h-4" />
                    Inativo
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a1a] rounded-xl p-6 border border-white/5">
            <p className="text-gray-300 leading-relaxed font-medium">{funcionalidade.descricao}</p>
          </div>
        </motion.div>

        {/* Informações Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#13132B] rounded-3xl border border-white/10 shadow-2xl p-8"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-primary" />
            Informações Detalhadas
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-xl border border-white/5 hover:border-brand-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 border border-purple-500/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <p className="font-semibold text-white">{funcionalidade.categoria}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-xl border border-white/5 hover:border-brand-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 border border-blue-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Responsável</p>
                <p className="font-semibold text-white">{funcionalidade.responsavel}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-xl border border-white/5 hover:border-brand-primary/30 transition-colors md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 text-green-400 border border-green-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Criação</p>
                <p className="font-semibold text-white">
                  {new Date(funcionalidade.data_criacao).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-3xl shadow-xl p-6 border border-brand-primary/20 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/20 rounded-full text-brand-primary">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">Precisa de ajuda?</p>
                <p className="text-sm text-gray-400">Entre em contato com o suporte técnico</p>
              </div>
            </div>
            <button
              onClick={() => toast.info("Suporte em desenvolvimento")}
              className="px-6 py-3 bg-[#0a0a1a] border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all w-full md:w-auto"
            >
              Contatar Suporte
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}