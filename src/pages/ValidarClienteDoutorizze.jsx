import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  CheckCircle2,
  XCircle,
  Gift,
  Calendar,
  Award,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function ValidarClienteDoutorizze() {
  const [tokenId, setTokenId] = useState("");
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [showModalDesconto, setShowModalDesconto] = useState(false);
  const [gerando, setGerando] = useState(false);

  const [formDesconto, setFormDesconto] = useState({
    tipo_desconto: "PERCENTUAL",
    valor_desconto: "",
    tentativa_numero: 1
  });

  const validarToken = async () => {
    if (!tokenId.trim()) {
      toast.error("Digite o TOKEN ID do cliente");
      return;
    }

    setValidando(true);
    setResultado(null);

    try {
      const response = await base44.functions.invoke('validarTokenUsuario', {
        token_id: tokenId.trim()
      });

      setResultado(response.data);

      if (response.data.valido) {
        toast.success("✅ Cliente Doutorizze validado!");
      } else {
        toast.error("❌ Token inválido ou inativo");
      }
    } catch (error) {
      toast.error("Erro ao validar: " + error.message);
      setResultado({ valido: false, error: error.message });
    }

    setValidando(false);
  };

  const gerarTokenDesconto = async () => {
    if (!formDesconto.valor_desconto || parseFloat(formDesconto.valor_desconto) <= 0) {
      toast.error("Informe o valor do desconto");
      return;
    }

    setGerando(true);

    try {
      const response = await base44.functions.invoke('gerarTokenDesconto', {
        token_usuario_id: resultado.token_usuario_id,
        parceiro_tipo: resultado.parceiro_tipo,
        tipo_desconto: formDesconto.tipo_desconto,
        valor_desconto: parseFloat(formDesconto.valor_desconto),
        tentativa_numero: formDesconto.tentativa_numero
      });

      if (response.data.success) {
        toast.success("🎉 Token de desconto gerado e enviado via WhatsApp!");
        setShowModalDesconto(false);
        setTokenId("");
        setResultado(null);
        setFormDesconto({ tipo_desconto: "PERCENTUAL", valor_desconto: "", tentativa_numero: 1 });
      } else {
        toast.error(response.data.error || "Erro ao gerar token");
      }
    } catch (error) {
      toast.error("Erro: " + error.message);
    }

    setGerando(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Validar Cliente Doutorizze</h1>
          <p className="text-gray-400">Digite o TOKEN ID para validar e gerar desconto</p>
        </div>

        {/* Card de Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] border border-white/10 rounded-3xl shadow-xl p-8 mb-6"
        >
          <label className="block text-sm font-bold text-gray-300 mb-3">
            TOKEN ID do Cliente
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value.toUpperCase())}
              placeholder="DTZ-XXXX-XXXX"
              className="flex-1 px-6 py-4 bg-[#0a0a1a] border border-white/10 rounded-2xl text-xl font-mono font-bold text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && validarToken()}
            />
            <button
              onClick={validarToken}
              disabled={validando || !tokenId.trim()}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {validando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Consultar
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Resultado da Validação */}
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-xl p-8 mb-6 border ${resultado.valido
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
              }`}
          >
            <div className="flex items-center gap-4 mb-6">
              {resultado.valido ? (
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              ) : (
                <XCircle className="w-12 h-12 text-red-400" />
              )}
              <div>
                <h2 className="text-2xl font-black text-white">
                  {resultado.valido ? "✅ Cliente Validado!" : "❌ Token Inválido"}
                </h2>
                <p className="text-gray-300">
                  {resultado.valido
                    ? "Este é um cliente verificado Doutorizze"
                    : "Não foi possível validar este token"}
                </p>
              </div>
            </div>

            {resultado.valido && (
              <div className="space-y-4">
                <div className="bg-[#13132B] border border-white/10 rounded-2xl p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Nome do Cliente</p>
                      <p className="font-bold text-white text-lg">{resultado.user_nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Tipo de Conta</p>
                      <p className="font-bold text-white">{resultado.tipo_conta}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Nível</p>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <p className="font-bold text-white">Nível {resultado.nivel}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Cadastrado desde</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <p className="font-bold text-white">
                          {new Date(resultado.cadastrado_desde).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200/80">
                      <p className="font-bold mb-1 text-yellow-400">Créditos do Cliente</p>
                      <p>✅ Usados (fechou): {resultado.creditos_usados || 0}</p>
                      <p>❌ Perdidos (não fechou): {resultado.creditos_perdidos || 0}</p>
                      <p className="mt-2 font-bold text-yellow-400">
                        Disponíveis para você: {Math.max(0, 3 - (resultado.creditos_perdidos || 0))} créditos
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowModalDesconto(true)}
                  className="w-full py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Gift className="w-6 h-6" />
                  GERAR TOKEN DE DESCONTO
                </button>
              </div>
            )}

            {!resultado.valido && resultado.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">{resultado.error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Modal Gerar Desconto */}
        {showModalDesconto && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#13132B] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-2xl font-black text-white">Configurar Desconto</h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Tipo de Desconto</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormDesconto(prev => ({ ...prev, tipo_desconto: "PERCENTUAL" }))}
                      className={`py-3 rounded-xl border font-bold transition-all ${formDesconto.tipo_desconto === "PERCENTUAL"
                          ? "border-purple-500 bg-purple-500/20 text-purple-400"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                        }`}
                    >
                      % Percentual
                    </button>
                    <button
                      onClick={() => setFormDesconto(prev => ({ ...prev, tipo_desconto: "VALOR_FIXO" }))}
                      className={`py-3 rounded-xl border font-bold transition-all ${formDesconto.tipo_desconto === "VALOR_FIXO"
                          ? "border-purple-500 bg-purple-500/20 text-purple-400"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                        }`}
                    >
                      R$ Valor Fixo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Valor do Desconto
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                      {formDesconto.tipo_desconto === "PERCENTUAL" ? "%" : "R$"}
                    </span>
                    <input
                      type="number"
                      value={formDesconto.valor_desconto}
                      onChange={(e) => setFormDesconto(prev => ({ ...prev, valor_desconto: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-xl font-bold text-white focus:border-purple-500 outline-none placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200/80">
                      <p className="font-bold mb-1 text-yellow-400">⏰ Validade: 48 horas</p>
                      <p>Máximo 2 tentativas por cliente</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setShowModalDesconto(false);
                    setFormDesconto({ tipo_desconto: "PERCENTUAL", valor_desconto: "", tentativa_numero: 1 });
                  }}
                  className="flex-1 py-3 border border-white/20 text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={gerarTokenDesconto}
                  disabled={gerando}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {gerando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Gerar Token
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}