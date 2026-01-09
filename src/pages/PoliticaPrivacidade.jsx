import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, Shield, Lock } from "lucide-react";
import { toast } from "sonner";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  const handleCopyText = () => {
    const content = document.querySelector('.politica-content').innerText;
    navigator.clipboard.writeText(content);
    toast.success("Texto copiado!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-20 relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* HEADER */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-8 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
            🔒 Política de Privacidade
          </h1>
          <p className="text-sm text-gray-500 mt-2">Última atualização: 22/12/2024</p>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex gap-3 relative z-10">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all border border-green-500/20">
          <Download className="w-5 h-5" />
          Baixar PDF
        </button>
        <button
          onClick={handleCopyText}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/10 hover:text-white transition-all">
          <Copy className="w-5 h-5" />
          Copiar Texto
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto px-4 pb-8 relative z-10">
        <div className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8 politica-content shadow-2xl">

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Shield className="w-6 h-6" />
            </div>
            Introdução
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            O Doutorizze está comprometido em proteger a privacidade e os dados pessoais de nossos usuários, em conformidade com a LGPD (Lei nº 13.709/2018).
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Lock className="w-6 h-6" />
            </div>
            1. Dados Coletados
          </h2>
          <p className="text-gray-300 mb-3 leading-relaxed">Coletamos:</p>
          <ul className="list-disc pl-6 text-gray-300 mb-8 space-y-2">
            <li><strong className="text-white">Profissionais:</strong> Nome, CPF, CRO/CRM, especialidade, contatos</li>
            <li><strong className="text-white">Clínicas:</strong> CNPJ, razão social, endereço, responsável técnico</li>
            <li><strong className="text-white">Dados automáticos:</strong> IP, navegador, localização</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Shield className="w-6 h-6" />
            </div>
            2. Como Usamos seus Dados
          </h2>
          <ul className="list-disc pl-6 text-gray-300 mb-8 space-y-2">
            <li>Criar e gerenciar sua conta</li>
            <li>Matching inteligente de vagas e profissionais</li>
            <li>Enviar notificações e comunicações</li>
            <li>Prevenir fraudes e garantir segurança</li>
            <li>Melhorar nossos serviços</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Shield className="w-6 h-6" />
            </div>
            3. Compartilhamento de Dados
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            <strong className="text-green-400">NÃO VENDEMOS SEUS DADOS.</strong> Compartilhamos apenas quando necessário para operação da plataforma ou exigências legais.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Shield className="w-6 h-6" />
            </div>
            4. Segurança dos Dados
          </h2>
          <ul className="list-disc pl-6 text-gray-300 mb-8 space-y-2">
            <li>Criptografia de dados</li>
            <li>Controles de acesso rigorosos</li>
            <li>Monitoramento contínuo</li>
            <li>Backups regulares</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Shield className="w-6 h-6" />
            </div>
            5. Seus Direitos (LGPD)
          </h2>
          <ul className="list-disc pl-6 text-gray-300 mb-8 space-y-2">
            <li>Acesso aos seus dados</li>
            <li>Correção de dados incorretos</li>
            <li>Exclusão de dados</li>
            <li>Portabilidade de dados</li>
            <li>Revogação de consentimento</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Shield className="w-6 h-6" />
            </div>
            6. Contato
          </h2>
          <p className="text-gray-300 mb-2 leading-relaxed">
            Para questões sobre privacidade ou exercer seus direitos:
          </p>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mt-4">
            <p className="text-gray-200 font-medium mb-1">📧 E-mail: dpo@doutorizze.com.br</p>
            <p className="text-gray-200 font-medium mb-1">📱 WhatsApp: (62) 99999-9999</p>
            <p className="text-green-400 font-medium mt-2">⏱️ Resposta em até 15 dias</p>
          </div>

        </div>
      </div>
    </div>
  );
}