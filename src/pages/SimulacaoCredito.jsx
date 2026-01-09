import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  PiggyBank,
  Wallet,
  Building,
  MapPin,
  User,
  Briefcase
} from "lucide-react";

export default function SimulacaoCredito() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome_completo: "",
    cpf: "",
    rg: "",
    data_nascimento: "",
    telefone: "",
    email: "",

    // Endereço
    cep: "",
    cidade: "",
    estado: "",
    endereco: "",

    // Dados Profissionais
    profissao: "",

    // Valor (opcional)
    valor_tratamento: ""
  });

  const [buscandoCep, setBuscandoCep] = useState(false);

  // Máscaras
  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const aplicarMascaraMoeda = (value) => {
    let num = value.replace(/\D/g, "");
    if (!num || num === "0") return "";
    num = (parseFloat(num) / 100).toFixed(2);
    if (isNaN(parseFloat(num))) return "";
    num = num.replace(".", ",");
    num = num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return num;
  };

  const handleInputChange = (campo, valor) => {
    if (campo === "nome_completo") {
      valor = valor.trimStart().replace(/\s{2,}/g, ' ');
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const buscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return;
    }

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: `${data.logradouro}, ${data.bairro}`,
        cidade: data.localidade || "",
        estado: data.uf || ""
      }));

      toast.success("CEP encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
    setBuscandoCep(false);
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;

    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;

    if (digito1 !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;

    return digito2 === parseInt(cpf.charAt(10));
  };

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const validarFormulario = () => {
    if (!formData.nome_completo.trim() || formData.nome_completo.trim().length < 3) {
      toast.error("Nome completo deve ter no mínimo 3 caracteres");
      return false;
    }

    if (!validarCPF(formData.cpf)) {
      toast.error("CPF inválido");
      return false;
    }

    if (!formData.rg.trim()) {
      toast.error("Preencha o RG");
      return false;
    }

    if (!formData.data_nascimento) {
      toast.error("Preencha a data de nascimento");
      return false;
    }

    const idade = calcularIdade(formData.data_nascimento);
    if (idade < 18) {
      toast.error("Paciente deve ter no mínimo 18 anos");
      return false;
    }

    if (!formData.telefone || formData.telefone.replace(/\D/g, "").length !== 11) {
      toast.error("Telefone inválido");
      return false;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Email inválido");
      return false;
    }

    if (!formData.cep || formData.cep.replace(/\D/g, "").length !== 8) {
      toast.error("CEP inválido");
      return false;
    }

    if (!formData.cidade.trim() || !formData.estado.trim()) {
      toast.error("Preencha cidade e estado");
      return false;
    }

    if (!formData.endereco.trim()) {
      toast.error("Preencha o endereço completo");
      return false;
    }

    if (!formData.profissao) {
      toast.error("Selecione a profissão");
      return false;
    }

    return true;
  };

  const handleSimular = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      // Simulação da API do Doutorizze
      // Em produção, seria uma chamada real à API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Resultado simulado
      const aprovado = Math.random() > 0.3; // 70% de aprovação

      setResultado({
        aprovado,
        mensagem: aprovado
          ? "Crédito pré-aprovado com sucesso!"
          : "Infelizmente o crédito não foi aprovado no momento.",
        opcoes: aprovado ? [
          {
            financeira: "Banco Dental Plus",
            valor: formData.valor_tratamento || "5.000,00",
            parcelas: "12x de R$ 450,00",
            taxa: "1,5% a.m."
          },
          {
            financeira: "CrediSorrisos",
            valor: formData.valor_tratamento || "5.000,00",
            parcelas: "18x de R$ 310,00",
            taxa: "1,8% a.m."
          },
          {
            financeira: "OdontoCredit",
            valor: formData.valor_tratamento || "5.000,00",
            parcelas: "24x de R$ 245,00",
            taxa: "2,1% a.m."
          }
        ] : []
      });

      toast.success("Simulação realizada!");
    } catch (error) {
      toast.error("Erro ao realizar simulação");
    }

    setLoading(false);
  };

  const handleNovaSimulacao = () => {
    setResultado(null);
    setFormData({
      nome_completo: "",
      cpf: "",
      rg: "",
      data_nascimento: "",
      telefone: "",
      email: "",
      cep: "",
      cidade: "",
      estado: "",
      endereco: "",
      profissao: "",
      valor_tratamento: ""
    });
  };

  const profissoes = [
    { value: "autonomo", label: "💼 Autônomo" },
    { value: "aposentado", label: "👴 Aposentado" },
    { value: "profissional_liberal", label: "👔 Profissional Liberal" },
    { value: "empresario", label: "🏢 Empresário" },
    { value: "carteira_assinada", label: "📋 Carteira Assinada" },
    { value: "funcionario_publico", label: "🏛️ Funcionário Público" },
    { value: "prestador_servico", label: "🔧 Prestador de Serviço" },
    { value: "assalariado", label: "💰 Assalariado" }
  ];

  if (resultado) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] p-6 flex items-center justify-center relative overflow-hidden">
        {/* Ambient Backgorund */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full z-10"
        >
          {resultado.aprovado ? (
            <div className="bg-[#13132B] rounded-3xl shadow-2xl overflow-hidden border border-white/10">
              {/* Header Aprovado */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 p-8 text-center relative overflow-hidden border-b border-green-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative z-10"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">🎉 Crédito Pré-Aprovado!</h2>
                  <p className="text-gray-300">{resultado.mensagem}</p>
                </motion.div>
              </div>

              {/* Opções de Financeiras */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Opções Disponíveis:</h3>
                <div className="space-y-4">
                  {resultado.opcoes.map((opcao, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border border-white/10 rounded-2xl p-6 bg-[#0a0a1a] hover:border-brand-orange/50 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-brand-orange transition-colors">{opcao.financeira}</h4>
                          <p className="text-sm text-gray-500">Taxa: {opcao.taxa}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-bold">
                          Recomendado
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Valor Total</p>
                          <p className="text-2xl font-black text-white">R$ {opcao.valor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Parcelas</p>
                          <p className="text-xl font-bold text-green-400">{opcao.parcelas}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Botões */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleNovaSimulacao}
                    className="flex-1 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
                  >
                    Nova Simulação
                  </button>
                  <button
                    onClick={() => toast.info("Em breve: Solicitar crédito")}
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all"
                  >
                    Solicitar Crédito
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#13132B] rounded-3xl shadow-2xl overflow-hidden border border-white/10">
              {/* Header Negado */}
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-8 text-center relative overflow-hidden border-b border-red-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative z-10"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/20">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">😔 Crédito Não Aprovado</h2>
                  <p className="text-gray-300">{resultado.mensagem}</p>
                </motion.div>
              </div>

              {/* Conteúdo */}
              <div className="p-8">
                <div className="bg-orange-500/10 rounded-2xl p-6 mb-6 border border-orange-500/20">
                  <h3 className="text-lg font-bold text-orange-400 mb-3">O que fazer agora?</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Revise as informações fornecidas e tente novamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Entre em contato com nossa equipe para mais opções</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Consulte outras formas de pagamento disponíveis</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNovaSimulacao}
                    className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-12 relative overflow-hidden">
      {/* Ambient Backgorund */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-10" />
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#13132B] border border-white/10 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/10 border-t-brand-orange rounded-full animate-spin"></div>
              <h3 className="text-xl font-bold text-white mb-2">Consultando financeiras...</h3>
              <p className="text-gray-400">Aguarde enquanto buscamos as melhores opções</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Botão Voltar */}
        <div className="p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-gradient-to-r from-[#13132B] to-[#1E1E3F] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            {/* Decorações */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center text-4xl shadow-lg shadow-brand-orange/20">
                <PiggyBank className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white mb-2">Simulação de Crédito</h1>
                <p className="text-gray-400 text-lg">Preencha os dados do paciente para simular opções de financiamento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#13132B] rounded-3xl shadow-xl border border-white/10 overflow-hidden">

            {/* Dados Pessoais */}
            <div className="border-b border-white/5">
              <div className="bg-white/5 px-8 py-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Dados do Paciente</h2>
              </div>

              <div className="p-8 space-y-6">
                {/* Nome Completo */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Nome Completo do Paciente *</label>
                  <input
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                    placeholder="Nome completo do paciente"
                    className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                  />
                </div>

                {/* Grid CPF e RG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">CPF *</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", aplicarMascaraCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">RG *</label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) => handleInputChange("rg", e.target.value)}
                      placeholder="Número do RG"
                      className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Grid Data e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Data de Nascimento *</label>
                    <input
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                      className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Telefone *</label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", aplicarMascaraTelefone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="border-b border-white/5">
              <div className="bg-white/5 px-8 py-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Endereço</h2>
              </div>

              <div className="p-8 space-y-6">
                {/* CEP */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">CEP *</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", aplicarMascaraCEP(e.target.value))}
                      placeholder="00000-000"
                      maxLength={9}
                      className="flex-1 h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={buscarCEP}
                      disabled={buscandoCep}
                      className="px-6 h-14 bg-[#0a0a1a] border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 hover:border-brand-orange transition-all disabled:opacity-50"
                    >
                      {buscandoCep ? "..." : "Buscar"}
                    </button>
                  </div>
                </div>

                {/* Grid Cidade e Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Cidade *</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      placeholder="Cidade"
                      className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Estado *</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                    >
                      <option value="">Selecione</option>
                      {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Endereço *</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    placeholder="Rua, Número, Bairro, Complemento"
                    className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="border-b border-white/5">
              <div className="bg-white/5 px-8 py-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Informações Profissionais</h2>
              </div>

              <div className="p-8">
                <label className="block text-sm font-bold text-gray-400 mb-2">Tipo de Ocupação *</label>
                <select
                  value={formData.profissao}
                  onChange={(e) => handleInputChange("profissao", e.target.value)}
                  className="w-full h-14 px-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 appearance-none cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione a profissão...</option>
                  {profissoes.map((prof) => (
                    <option key={prof.value} value={prof.value}>{prof.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valor do Tratamento */}
            <div className="border-b border-white/5">
              <div className="bg-white/5 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Valor do Tratamento</h2>
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold rounded-full">Opcional</span>
              </div>

              <div className="p-8">
                <label className="block text-sm font-bold text-gray-400 mb-2">Valor total do tratamento</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange font-bold text-lg">R$</span>
                  <input
                    type="text"
                    value={formData.valor_tratamento}
                    onChange={(e) => handleInputChange("valor_tratamento", aplicarMascaraMoeda(e.target.value))}
                    placeholder="0,00"
                    className="w-full h-14 pl-12 pr-4 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all outline-none text-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="p-8 bg-[#0a0a1a]/50">
              <div className="flex flex-col-reverse md:flex-row gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSimular}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-brand-coral to-brand-orange text-white font-bold rounded-xl shadow-lg hover:shadow-brand-orange/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="text-xl">💳</span>
                  Simular Crédito
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}