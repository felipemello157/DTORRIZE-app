import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Briefcase,
    ShoppingBag,
    Users,
    PieChart,
    User,
    LogOut,
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const [userType, setUserType] = React.useState(null);

    React.useEffect(() => {
        // Tentar pegar do localStorage primeiro (cache rápido)
        const cached = localStorage.getItem('doutorizze_user_type');
        if (cached) setUserType(cached);
    }, []);

    const menus = {
        PROFISSIONAL: [
            { icon: <Home />, label: 'Feed', path: '/Feed' },
            { icon: <Briefcase />, label: 'Vagas', path: '/VagasDisponiveis' },
            { icon: <ShoppingBag />, label: 'Marketplace', path: '/Marketplace' },
            { icon: <Users />, label: 'Networking', path: '/BuscarProfissionais' },
            { icon: <PieChart />, label: 'Minhas Finanças', path: '/MeusTokens' },
            { icon: <User />, label: 'Meu Perfil', path: '/MeuPerfil' },
        ],
        CLINICA: [
            { icon: <Home />, label: 'Feed', path: '/Feed' },
            { icon: <Briefcase />, label: 'Minhas Vagas', path: '/MinhasSubstituicoes' },
            { icon: <Users />, label: 'Candidatos', path: '/Candidatos' },
            { icon: <ShoppingBag />, label: 'Marketplace', path: '/Marketplace' },
            { icon: <User />, label: 'Perfil da Clínica', path: '/PerfilClinica' },
        ],
        FORNECEDOR: [
            { icon: <Home />, label: 'Feed', path: '/Feed' },
            { icon: <ShoppingBag />, label: 'Meus Produtos', path: '/MinhasPromocoes' },
            { icon: <PieChart />, label: 'Vendas', path: '/DashboardFornecedor' },
            { icon: <User />, label: 'Perfil', path: '/PerfilFornecedor' },
        ],
        HOSPITAL: [
            { icon: <Home />, label: 'Feed', path: '/Feed' },
            { icon: <Briefcase />, label: 'Vagas', path: '/MinhasVagas' },
            { icon: <Users />, label: 'Candidatos', path: '/CandidatosHospital' },
            { icon: <PieChart />, label: 'Dashboard', path: '/DashboardHospital' },
        ],
        INSTITUICAO: [
            { icon: <Home />, label: 'Feed', path: '/Feed' },
            { icon: <Users />, label: 'Alunos', path: '/MeusAlunos' },
            { icon: <Briefcase />, label: 'Cursos', path: '/MeusCursos' },
            { icon: <User />, label: 'Perfil', path: '/PerfilInstituicao' },
        ]
    };

    const items = menus[userType] || menus.PROFISSIONAL; // Default to Profissional

    return (
        <aside className="hidden lg:flex flex-col w-[280px] h-screen sticky top-0 p-6 border-r border-white/5 bg-[#0a0a1a]/50 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-coral to-brand-orange flex items-center justify-center shadow-lg shadow-brand-coral/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="font-display font-bold text-xl text-white tracking-tight">Doutorizze</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, index) => {
                    // Item divisor/espaçador
                    if (!item.path && !item.label) return <div key={index} className="h-4" />;

                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive(item.path)
                                ? 'bg-brand-coral/10 text-brand-coral font-semibold'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className={`transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {React.cloneElement(item.icon, {
                                    size: 20,
                                    className: isActive(item.path) ? 'text-brand-coral' : 'text-gray-400 group-hover:text-white'
                                })}
                            </div>
                            <span>{item.label}</span>
                            {isActive(item.path) && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-coral" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-white/5 space-y-2 bg-[#0a0a1a]/50">
                <Link
                    to="/Configuracoes"
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Settings size={20} />
                    <span>Configurações</span>
                </Link>
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
