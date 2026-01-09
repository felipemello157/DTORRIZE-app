import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  Star,
  Sparkles
} from "lucide-react";

export default function VerificarToken() {
  const navigate = useNavigate();
  const [codigoToken, setCodigoToken] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const formatarCodigo = (value) => {
    const limpo = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 7) return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
    return `${limpo.slice(0, 3)}-${limpo.slice(3, 7)}-${limpo.slice(7, 13)}`;
  };

  const handleInputChange = (e) => {
    const formatted = formatarCodigo(e.target.value);
    setCodigoToken(formatted);
  };

  const handleVerificar = async () => {
    if (codigoToken.length < 16) {
      toast.error("Digite um código válido (DTZ-XXXX-XXXXXX)");
      return;
    }

    setVerificando(true);
    setResultado(null);

    try {
      const tokens = await base44.entities.TokenUsuario.filter({ token_id: codigoToken });

      if (tokens.length === 0) {
        setResultado({
          valido: false,
          mensagem: "Token não encontrado ou inválido"
        });
      } else {
        const token = tokens[0];

        if (token.status !== "ATIVO") {
          setResultado({
            valido: false,
            mensagem: `Token ${token.status.toLowerCase()}`
          });
        } else {
          setResultado({
            valido: true,
            token: token
          });
        }
      }
    } catch (error) {
      toast.error("Erro ao verificar token: " + error.message);
    }

    setVerificando(false);
  };

  const niveisConfig = {
    1: { label: "Iniciante", color: "text-gray-400", bg: "bg-gray-500/10" },
    2: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-500/10" },
    3: { label: "Prata", color: "text-gray-300", bg: "bg-gray-400/10" },
    4: { label: "Ouro", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    5: { label: "Diamante", color: "text-blue-400", bg: "bg-blue-500/10" }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24">
      <div className="bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/10 p-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Verificar Token Doutorizze</h1>
              <p className="text-sm text-gray-400">Digite o código para validar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13132B] rounded-3xl shadow-xl border border-white/10 p-8 mb-6"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Digite o Código do Token</h2>
            <p className="text-gray-400">Formato: DTZ-XXXX-XXXXXX</p>
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={codigoToken}
              onChange={handleInputChange}
              placeholder="DTZ-"
              maxLength={16}
              className="w-full px-6 py-5 text-center text-2xl font-bold bg-[#0a0a1a] border border-white/10 text-white rounded-2xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none uppercase tracking-wider placeholder-gray-600"
            />

            <button
              onClick={handleVerificar}
              disabled={verificando || codigoToken.length < 16}
              className="w-full mt-4 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {verificando ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  Verificar Token
                </>
              )}
            </button>
          </div>
        </motion.div>

        {resultado && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-3xl shadow-2xl p-8 border ${resultado.valido
                ? "bg-green-500/5 border-green-500/30"
                : "bg-red-500/5 border-red-500/30"
              }`}
          >
            {resultado.valido ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-14 h-14 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">✅ Token Válido!</h3>
                  <p className="text-lg text-green-400 font-semibold">
                    {resultado.token.token_id}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#13132B] rounded-2xl p-5 shadow-lg border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-400">Tipo de Conta</p>
                          <p className="font-black text-white text-lg">{resultado.token.tipo_conta}</p>
                        </div>
                      </div>
                      {resultado.token.verificado && (
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold flex items-center gap-1 border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Verificado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#13132B] rounded-2xl p-5 shadow-lg border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Nível</p>
                        <p className={`font-black text-xl ${niveisConfig[resultado.token.nivel]?.color}`}>
                          {niveisConfig[resultado.token.nivel]?.label} (Nível {resultado.token.nivel})
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`flex-1 h-2 rounded-full ${n <= resultado.token.nivel ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gray-700"
                            }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#13132B] rounded-2xl p-5 shadow-lg border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Pontos Acumulados</p>
                          <p className="font-black text-white text-2xl">{resultado.token.pontos.toLocaleString()}</p>
                        </div>
                      </div>
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-500/20">
                    <h4 className="font-black text-white text-lg mb-3">💰 Benefícios Utilizados</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 backdrop-blur rounded-xl p-3">
                        <p className="text-white/80 text-sm">Descontos Usados</p>
                        <p className="font-black text-white text-2xl">{resultado.token.total_descontos_usados}</p>
                      </div>
                      <div className="bg-black/20 backdrop-blur rounded-xl p-3">
                        <p className="text-white/80 text-sm">Economizado</p>
                        <p className="font-black text-white text-2xl">
                          R$ {resultado.token.valor_economizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    Emitido em {new Date(resultado.token.data_emissao).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
                    <XCircle className="w-14 h-14 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">❌ Token Inválido</h3>
                  <p className="text-lg text-gray-400">{resultado.mensagem}</p>
                </div>
              </>
            )}
          </motion.div>
        )}

        <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
          <h4 className="font-bold text-blue-400 mb-2">ℹ️ Sobre o Token Doutorizze</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• O token é único e pessoal</li>
            <li>• Válido para acesso a benefícios exclusivos</li>
            <li>• Verifique se o código está correto</li>
            <li>• Em caso de dúvidas, entre em contato com o suporte</li>
          </ul>
        </div>
      </div>
    </div>
  );
}