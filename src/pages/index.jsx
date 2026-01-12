import Layout from "./Layout.jsx";

import AdminDenuncias from "./AdminDenuncias";

import AdminFeed from "./AdminFeed";

import AdminRelatorios from "./AdminRelatorios";

import AdminTokens from "./AdminTokens";

import Ajuda from "./Ajuda";

import AvaliarClinica from "./AvaliarClinica";

import AvaliarProfissional from "./AvaliarProfissional";

import Busca from "./Busca";

import BuscarProfissionais from "./BuscarProfissionais";

import CadastroClinica from "./CadastroClinica";

import CadastroFornecedor from "./CadastroFornecedor";

import CadastroHospital from "./CadastroHospital";

import CadastroInstituicao from "./CadastroInstituicao";

import CadastroLaboratorio from "./CadastroLaboratorio";

import CadastroProfissional from "./CadastroProfissional";

import CadastroSucesso from "./CadastroSucesso";

import CandidatosHospital from "./CandidatosHospital";

import ChatThread from "./ChatThread";

import Chats from "./Chats";

import ClientesDoutorizze from "./ClientesDoutorizze";

import Configuracoes from "./Configuracoes";

import ConfirmarSubstituicao from "./ConfirmarSubstituicao";

import DashboardInstituicao from "./DashboardInstituicao";

import DashboardProfissional from "./DashboardProfissional";

import Denunciar from "./Denunciar";

import DetalheVaga from "./DetalheVaga";

import Feed from "./Feed";

import FuncionalidadeDetalhe from "./FuncionalidadeDetalhe";

import MinhasVagasHospital from "./MinhasVagasHospital";

import ValidarClienteDoutorizze from "./ValidarClienteDoutorizze";

import ConfiguracaoNotificacoes from "./ConfiguracaoNotificacoes";

import DetalheCurso from "./DetalheCurso";

import DetalheSubstituicao from "./DetalheSubstituicao";

import EditarClinica from "./EditarClinica";

import HomePage from "./HomePage";

import MeusFavoritos from "./MeusFavoritos";

import SimulacaoCredito from "./SimulacaoCredito";

import DetalheLaboratorio from "./DetalheLaboratorio";

import EditarPerfil from "./EditarPerfil";

import EditarVaga from "./EditarVaga";

import EditarVagaHospital from "./EditarVagaHospital";

import EscolherTipoCriador from "./EscolherTipoCriador";

import EventosInstituicao from "./EventosInstituicao";

import FeedConfig from "./FeedConfig";

import Fornecedores from "./Fornecedores";

import GerenciarCandidatos from "./GerenciarCandidatos";

import MapaOportunidades from "./MapaOportunidades";

import StatusDisponibilidade from "./StatusDisponibilidade";

import Home from "./Home";

import Marketplace from "./Marketplace";

import MarketplaceCreate from "./MarketplaceCreate";

import MarketplaceDetail from "./MarketplaceDetail";

import MeuPerfil from "./MeuPerfil";

import MeusAnuncios from "./MeusAnuncios";

import MeusAnunciosMarketplace from "./MeusAnunciosMarketplace";

import MeusCursos from "./MeusCursos";

import MeusTokens from "./MeusTokens";

import MinhasAvaliacoes from "./MinhasAvaliacoes";

import MinhasCandidaturas from "./MinhasCandidaturas";

import MinhasCandidaturasSubstituicao from "./MinhasCandidaturasSubstituicao";

import MinhasPromocoes from "./MinhasPromocoes";

import MinhasSubstituicoes from "./MinhasSubstituicoes";

import MinhasVagas from "./MinhasVagas";

import ModoUrgente from "./ModoUrgente";

import NewJobs from "./NewJobs";

import NotificationCenter from "./NotificationCenter";

import NotificationSettings from "./NotificationSettings";

import Onboarding from "./Onboarding";

import OnboardingTipoConta from "./OnboardingTipoConta";

import OnboardingVertical from "./OnboardingVertical";

import PerfilClinica from "./PerfilClinica";

import PerfilClinicaPublico from "./PerfilClinicaPublico";

import Seguranca from "./Seguranca";

import VagasDisponiveis from "./VagasDisponiveis";

import PoliticaPrivacidade from "./PoliticaPrivacidade";

import TokenDoutorizze from "./TokenDoutorizze";

import TermosUso from "./TermosUso";

import ValidarComparecimento from "./ValidarComparecimento";

import VerProfissional from "./VerProfissional";

import AdminAprovacoes from "./AdminAprovacoes";

import AdminCupons from "./AdminCupons";

import ComunidadeTelegram from "./ComunidadeTelegram";

import ConfirmarSubstituicaoTimer from "./ConfirmarSubstituicaoTimer";

import Contratar from "./Contratar";

import CriarAnuncioProfissional from "./CriarAnuncioProfissional";

import CriarCurso from "./CriarCurso";

import CriarPromocao from "./CriarPromocao";

import CriarSubstituicao from "./CriarSubstituicao";

import CriarVaga from "./CriarVaga";

import CriarVagaHospital from "./CriarVagaHospital";

import Cursos from "./Cursos";

import DashboardClinica from "./DashboardClinica";

import DashboardFornecedor from "./DashboardFornecedor";

import DashboardHospital from "./DashboardHospital";

import DashboardLaboratorio from "./DashboardLaboratorio";

import DashboardSubstituicoes from "./DashboardSubstituicoes";

import DetalheFornecedor from "./DetalheFornecedor";

import DisponibilidadeSubstituicao from "./DisponibilidadeSubstituicao";

import Laboratorios from "./Laboratorios";

import ServicosPrestados from "./ServicosPrestados";

import VerificarToken from "./VerificarToken";

// Novas páginas importadas do projeto antigo
import ClubePontos from "./ClubePontos";
import ComparadorPrecos from "./ComparadorPrecos";
import IndicarAmigo from "./IndicarAmigo";
import ContratoDigital from "./ContratoDigital";
import IAsDisponiveis from "./IAsDisponiveis";
import EscolherTipoCadastro from "./EscolherTipoCadastro";
import MentoriaExpress from "./MentoriaExpress";
import Perfil from "./Perfil";
import TestProfessional from "./TestProfessional";
import FeedBackup from "./FeedBackup";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    AdminDenuncias: AdminDenuncias,

    AdminFeed: AdminFeed,

    AdminRelatorios: AdminRelatorios,

    AdminTokens: AdminTokens,

    Ajuda: Ajuda,

    AvaliarClinica: AvaliarClinica,

    AvaliarProfissional: AvaliarProfissional,

    Busca: Busca,

    BuscarProfissionais: BuscarProfissionais,

    CadastroClinica: CadastroClinica,

    CadastroFornecedor: CadastroFornecedor,

    CadastroHospital: CadastroHospital,

    CadastroInstituicao: CadastroInstituicao,

    CadastroLaboratorio: CadastroLaboratorio,

    CadastroProfissional: CadastroProfissional,

    CadastroSucesso: CadastroSucesso,

    CandidatosHospital: CandidatosHospital,

    ChatThread: ChatThread,

    Chats: Chats,

    ClientesDoutorizze: ClientesDoutorizze,

    Configuracoes: Configuracoes,

    ConfirmarSubstituicao: ConfirmarSubstituicao,

    DashboardInstituicao: DashboardInstituicao,

    DashboardProfissional: DashboardProfissional,

    Denunciar: Denunciar,

    DetalheVaga: DetalheVaga,

    Feed: Feed,

    FuncionalidadeDetalhe: FuncionalidadeDetalhe,

    MinhasVagasHospital: MinhasVagasHospital,

    ValidarClienteDoutorizze: ValidarClienteDoutorizze,

    ConfiguracaoNotificacoes: ConfiguracaoNotificacoes,

    DetalheCurso: DetalheCurso,

    DetalheSubstituicao: DetalheSubstituicao,

    EditarClinica: EditarClinica,

    HomePage: HomePage,

    MeusFavoritos: MeusFavoritos,

    SimulacaoCredito: SimulacaoCredito,

    DetalheLaboratorio: DetalheLaboratorio,

    EditarPerfil: EditarPerfil,

    EditarVaga: EditarVaga,

    EditarVagaHospital: EditarVagaHospital,

    EscolherTipoCriador: EscolherTipoCriador,

    EventosInstituicao: EventosInstituicao,

    FeedConfig: FeedConfig,

    Fornecedores: Fornecedores,

    GerenciarCandidatos: GerenciarCandidatos,

    MapaOportunidades: MapaOportunidades,

    StatusDisponibilidade: StatusDisponibilidade,

    Home: Home,

    Marketplace: Marketplace,

    MarketplaceCreate: MarketplaceCreate,

    MarketplaceDetail: MarketplaceDetail,

    MeuPerfil: MeuPerfil,

    MeusAnuncios: MeusAnuncios,

    MeusAnunciosMarketplace: MeusAnunciosMarketplace,

    MeusCursos: MeusCursos,

    MeusTokens: MeusTokens,

    MinhasAvaliacoes: MinhasAvaliacoes,

    MinhasCandidaturas: MinhasCandidaturas,

    MinhasCandidaturasSubstituicao: MinhasCandidaturasSubstituicao,

    MinhasPromocoes: MinhasPromocoes,

    MinhasSubstituicoes: MinhasSubstituicoes,

    MinhasVagas: MinhasVagas,

    ModoUrgente: ModoUrgente,

    NewJobs: NewJobs,

    NotificationCenter: NotificationCenter,

    NotificationSettings: NotificationSettings,

    Onboarding: Onboarding,

    OnboardingTipoConta: OnboardingTipoConta,

    OnboardingVertical: OnboardingVertical,

    PerfilClinica: PerfilClinica,

    PerfilClinicaPublico: PerfilClinicaPublico,

    Seguranca: Seguranca,

    VagasDisponiveis: VagasDisponiveis,

    PoliticaPrivacidade: PoliticaPrivacidade,

    TokenDoutorizze: TokenDoutorizze,

    TermosUso: TermosUso,

    ValidarComparecimento: ValidarComparecimento,

    VerProfissional: VerProfissional,

    AdminAprovacoes: AdminAprovacoes,

    AdminCupons: AdminCupons,

    ComunidadeTelegram: ComunidadeTelegram,

    ConfirmarSubstituicaoTimer: ConfirmarSubstituicaoTimer,

    Contratar: Contratar,

    CriarAnuncioProfissional: CriarAnuncioProfissional,

    CriarCurso: CriarCurso,

    CriarPromocao: CriarPromocao,

    CriarSubstituicao: CriarSubstituicao,

    CriarVaga: CriarVaga,

    CriarVagaHospital: CriarVagaHospital,

    Cursos: Cursos,

    DashboardClinica: DashboardClinica,

    DashboardFornecedor: DashboardFornecedor,

    DashboardHospital: DashboardHospital,

    DashboardLaboratorio: DashboardLaboratorio,

    DashboardSubstituicoes: DashboardSubstituicoes,

    DetalheFornecedor: DetalheFornecedor,

    DisponibilidadeSubstituicao: DisponibilidadeSubstituicao,

    Laboratorios: Laboratorios,

    ServicosPrestados: ServicosPrestados,

    VerificarToken: VerificarToken,

    // Novas páginas do projeto antigo
    ClubePontos: ClubePontos,
    ComparadorPrecos: ComparadorPrecos,
    IndicarAmigo: IndicarAmigo,
    ContratoDigital: ContratoDigital,
    IAsDisponiveis: IAsDisponiveis,
    EscolherTipoCadastro: EscolherTipoCadastro,
    MentoriaExpress: MentoriaExpress,
    Perfil: Perfil,
    TestProfessional: TestProfessional,
    FeedBackup: FeedBackup,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Onboarding />} />


                <Route path="/AdminDenuncias" element={<AdminDenuncias />} />

                <Route path="/AdminFeed" element={<AdminFeed />} />

                <Route path="/AdminRelatorios" element={<AdminRelatorios />} />

                <Route path="/AdminTokens" element={<AdminTokens />} />

                <Route path="/Ajuda" element={<Ajuda />} />

                <Route path="/AvaliarClinica" element={<AvaliarClinica />} />

                <Route path="/AvaliarProfissional" element={<AvaliarProfissional />} />

                <Route path="/Busca" element={<Busca />} />

                <Route path="/BuscarProfissionais" element={<BuscarProfissionais />} />

                <Route path="/CadastroClinica" element={<CadastroClinica />} />

                <Route path="/CadastroFornecedor" element={<CadastroFornecedor />} />

                <Route path="/CadastroHospital" element={<CadastroHospital />} />

                <Route path="/CadastroInstituicao" element={<CadastroInstituicao />} />

                <Route path="/CadastroLaboratorio" element={<CadastroLaboratorio />} />

                <Route path="/CadastroProfissional" element={<CadastroProfissional />} />

                <Route path="/CadastroSucesso" element={<CadastroSucesso />} />

                <Route path="/CandidatosHospital" element={<CandidatosHospital />} />

                <Route path="/ChatThread" element={<ChatThread />} />

                <Route path="/Chats" element={<Chats />} />

                <Route path="/ClientesDoutorizze" element={<ClientesDoutorizze />} />

                <Route path="/Configuracoes" element={<Configuracoes />} />

                <Route path="/ConfirmarSubstituicao" element={<ConfirmarSubstituicao />} />

                <Route path="/DashboardInstituicao" element={<DashboardInstituicao />} />

                <Route path="/DashboardProfissional" element={<DashboardProfissional />} />

                <Route path="/Denunciar" element={<Denunciar />} />

                <Route path="/DetalheVaga" element={<DetalheVaga />} />

                <Route path="/Feed" element={<Feed />} />

                <Route path="/FuncionalidadeDetalhe" element={<FuncionalidadeDetalhe />} />

                <Route path="/MinhasVagasHospital" element={<MinhasVagasHospital />} />

                <Route path="/ValidarClienteDoutorizze" element={<ValidarClienteDoutorizze />} />

                <Route path="/ConfiguracaoNotificacoes" element={<ConfiguracaoNotificacoes />} />

                <Route path="/DetalheCurso" element={<DetalheCurso />} />

                <Route path="/DetalheSubstituicao" element={<DetalheSubstituicao />} />

                <Route path="/EditarClinica" element={<EditarClinica />} />

                <Route path="/HomePage" element={<HomePage />} />

                <Route path="/MeusFavoritos" element={<MeusFavoritos />} />

                <Route path="/SimulacaoCredito" element={<SimulacaoCredito />} />

                <Route path="/DetalheLaboratorio" element={<DetalheLaboratorio />} />

                <Route path="/EditarPerfil" element={<EditarPerfil />} />

                <Route path="/EditarVaga" element={<EditarVaga />} />

                <Route path="/EditarVagaHospital" element={<EditarVagaHospital />} />

                <Route path="/EscolherTipoCriador" element={<EscolherTipoCriador />} />

                <Route path="/EventosInstituicao" element={<EventosInstituicao />} />

                <Route path="/FeedConfig" element={<FeedConfig />} />

                <Route path="/Fornecedores" element={<Fornecedores />} />

                <Route path="/GerenciarCandidatos" element={<GerenciarCandidatos />} />

                <Route path="/MapaOportunidades" element={<MapaOportunidades />} />

                <Route path="/StatusDisponibilidade" element={<StatusDisponibilidade />} />

                <Route path="/Home" element={<Home />} />

                <Route path="/Marketplace" element={<Marketplace />} />

                <Route path="/MarketplaceCreate" element={<MarketplaceCreate />} />

                <Route path="/MarketplaceDetail" element={<MarketplaceDetail />} />

                <Route path="/MeuPerfil" element={<MeuPerfil />} />

                <Route path="/MeusAnuncios" element={<MeusAnuncios />} />

                <Route path="/MeusAnunciosMarketplace" element={<MeusAnunciosMarketplace />} />

                <Route path="/MeusCursos" element={<MeusCursos />} />

                <Route path="/MeusTokens" element={<MeusTokens />} />

                <Route path="/MinhasAvaliacoes" element={<MinhasAvaliacoes />} />

                <Route path="/MinhasCandidaturas" element={<MinhasCandidaturas />} />

                <Route path="/MinhasCandidaturasSubstituicao" element={<MinhasCandidaturasSubstituicao />} />

                <Route path="/MinhasPromocoes" element={<MinhasPromocoes />} />

                <Route path="/MinhasSubstituicoes" element={<MinhasSubstituicoes />} />

                <Route path="/MinhasVagas" element={<MinhasVagas />} />

                <Route path="/ModoUrgente" element={<ModoUrgente />} />

                <Route path="/NewJobs" element={<NewJobs />} />

                <Route path="/NotificationCenter" element={<NotificationCenter />} />

                <Route path="/NotificationSettings" element={<NotificationSettings />} />

                <Route path="/Onboarding" element={<Onboarding />} />

                <Route path="/OnboardingTipoConta" element={<OnboardingTipoConta />} />

                <Route path="/OnboardingVertical" element={<OnboardingVertical />} />

                <Route path="/PerfilClinica" element={<PerfilClinica />} />

                <Route path="/PerfilClinicaPublico" element={<PerfilClinicaPublico />} />

                <Route path="/Seguranca" element={<Seguranca />} />

                <Route path="/VagasDisponiveis" element={<VagasDisponiveis />} />

                <Route path="/PoliticaPrivacidade" element={<PoliticaPrivacidade />} />

                <Route path="/TokenDoutorizze" element={<TokenDoutorizze />} />

                <Route path="/TermosUso" element={<TermosUso />} />

                <Route path="/ValidarComparecimento" element={<ValidarComparecimento />} />

                <Route path="/VerProfissional" element={<VerProfissional />} />

                <Route path="/AdminAprovacoes" element={<AdminAprovacoes />} />

                <Route path="/AdminCupons" element={<AdminCupons />} />

                <Route path="/ComunidadeTelegram" element={<ComunidadeTelegram />} />

                <Route path="/ConfirmarSubstituicaoTimer" element={<ConfirmarSubstituicaoTimer />} />

                <Route path="/Contratar" element={<Contratar />} />

                <Route path="/CriarAnuncioProfissional" element={<CriarAnuncioProfissional />} />

                <Route path="/CriarCurso" element={<CriarCurso />} />

                <Route path="/CriarPromocao" element={<CriarPromocao />} />

                <Route path="/CriarSubstituicao" element={<CriarSubstituicao />} />

                <Route path="/CriarVaga" element={<CriarVaga />} />

                <Route path="/CriarVagaHospital" element={<CriarVagaHospital />} />

                <Route path="/Cursos" element={<Cursos />} />

                <Route path="/DashboardClinica" element={<DashboardClinica />} />

                <Route path="/DashboardFornecedor" element={<DashboardFornecedor />} />

                <Route path="/DashboardHospital" element={<DashboardHospital />} />

                <Route path="/DashboardLaboratorio" element={<DashboardLaboratorio />} />

                <Route path="/DashboardSubstituicoes" element={<DashboardSubstituicoes />} />

                <Route path="/DetalheFornecedor" element={<DetalheFornecedor />} />

                <Route path="/DisponibilidadeSubstituicao" element={<DisponibilidadeSubstituicao />} />

                <Route path="/Laboratorios" element={<Laboratorios />} />

                <Route path="/ServicosPrestados" element={<ServicosPrestados />} />

                <Route path="/VerificarToken" element={<VerificarToken />} />

                {/* Novas rotas do projeto antigo */}
                <Route path="/ClubePontos" element={<ClubePontos />} />
                <Route path="/ComparadorPrecos" element={<ComparadorPrecos />} />
                <Route path="/IndicarAmigo" element={<IndicarAmigo />} />
                <Route path="/ContratoDigital" element={<ContratoDigital />} />
                <Route path="/IAsDisponiveis" element={<IAsDisponiveis />} />
                <Route path="/EscolherTipoCadastro" element={<EscolherTipoCadastro />} />
                <Route path="/MentoriaExpress" element={<MentoriaExpress />} />
                <Route path="/Perfil" element={<Perfil />} />
                <Route path="/TestProfessional" element={<TestProfessional />} />
                <Route path="/FeedBackup" element={<FeedBackup />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}