import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, FileText } from "lucide-react";
import { toast } from "sonner";

export default function TermosUso() {
  const navigate = useNavigate();

  const handleCopyText = () => {
    const content = document.querySelector('.termos-content').innerText;
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] opacity-20" />
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
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            📜 Termos de Uso
          </h1>
          <p className="text-sm text-gray-500 mt-2">Última atualização: 22/12/2024</p>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex gap-3 relative z-10">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all border border-blue-400/20">
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
        <div className="bg-[#13132B]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8 termos-content shadow-2xl">

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            1. Aceitação dos Termos
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Ao acessar e utilizar o Doutorizze ("Plataforma"), você concorda em cumprir e estar vinculado aos
            presentes Termos de Uso. Se você não concorda com estes termos, não deve utilizar a Plataforma.
          </p>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Estes Termos de Uso constituem um acordo legal entre você ("Usuário") e o Doutorizze, regulando
            o acesso e uso dos serviços oferecidos pela Plataforma.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            2. Descrição do Serviço
          </h2>
          <p className="text-gray-300 mb-3 leading-relaxed">
            O Doutorizze é uma plataforma digital que conecta profissionais de saúde (dentistas e médicos)
            com clínicas, hospitais e oportunidades de trabalho. A Plataforma também oferece:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-8 space-y-2">
            <li>Sistema de matching inteligente entre profissionais e vagas</li>
            <li>Marketplace para compra e venda de equipamentos médicos e odontológicos</li>
            <li>Sistema de avaliações e reputação</li>
            <li>Ferramentas de comunicação entre usuários</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            3. Cadastro e Conta
          </h2>
          <p className="text-gray-300 mb-3 leading-relaxed">
            Para usar determinadas funcionalidades do Doutorizze, você deve criar uma conta. Ao criar uma conta, você concorda em:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-8 space-y-2">
            <li>Fornecer informações verdadeiras, precisas, atuais e completas</li>
            <li>Manter e atualizar prontamente suas informações de cadastro</li>
            <li>Manter a segurança e confidencialidade de sua senha</li>
            <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            4. Uso Aceitável
          </h2>
          <p className="text-gray-300 mb-3 leading-relaxed">
            Você concorda em usar o Doutorizze apenas para fins legais e de acordo com estes Termos. É proibido:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-8 space-y-2">
            <li>Usar o serviço de qualquer maneira que viole leis locais, estaduais, nacionais ou internacionais</li>
            <li>Publicar conteúdo falso, enganoso, difamatório ou fraudulento</li>
            <li>Fazer-se passar por outra pessoa ou entidade</li>
            <li>Enviar spam, correntes ou comunicações não solicitadas</li>
            <li>Interferir ou interromper o funcionamento do aplicativo</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            5. Propriedade Intelectual
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Todo o conteúdo do Doutorizze, incluindo textos, gráficos, logos, ícones, imagens e software, é propriedade da Doutorizze ou de seus licenciadores e está protegido por leis de direitos autorais.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            6. Limitação de Responsabilidade
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            O Doutorizze não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu acesso ou uso do serviço.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            7. Modificações dos Termos
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos os usuários sobre alterações significativas.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            8. Contato
          </h2>
          <p className="text-gray-300 mb-2 leading-relaxed">
            Para questões sobre estes Termos:
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mt-4">
            <p className="text-gray-200 font-medium mb-1">📧 E-mail: contato@doutorizze.com.br</p>
            <p className="text-gray-200 font-medium">📱 WhatsApp: (62) 99999-9999</p>
          </div>

        </div>
      </div>
    </div>
  );
}