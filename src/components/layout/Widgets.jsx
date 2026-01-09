import React from 'react';
import { UserPlus, MoreHorizontal, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const Widgets = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(createPageUrl(path));
    };

    return (
        <aside className="hidden xl:flex flex-col w-[350px] h-screen sticky top-0 p-6 space-y-6">
            {/* Search Bar Placeholder (Optional) */}
            <div className="bg-white/5 rounded-full px-4 py-3 flex items-center gap-3 border border-white/5 focus-within:border-brand-coral/50 transition-colors group">
                <Search className="text-gray-400 w-5 h-5 group-focus-within:text-brand-coral transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar no Doutorizze"
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            // Redirecionar para Vagas com busca
                            navigate(createPageUrl('NewJobs') + `?q=${e.target.value}`);
                        }
                    }}
                />
            </div>

            {/* Sugestões */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Talvez você curta</h3>
                    <button
                        onClick={() => handleNavigate('NewJobs')}
                        className="text-brand-coral text-xs font-semibold hover:underline"
                    >
                        Ver tudo
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Mock funcional para validação de rota */}
                    <div
                        onClick={() => navigate(createPageUrl('PerfilClinicaPublico') + '?id=mock-hospital')}
                        className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center font-bold text-xs" >H</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">Hospital São Lucas</h4>
                            <p className="text-xs text-gray-400 truncate">Cardiologia • SP</p>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-brand-coral">
                            <UserPlus size={18} />
                        </button>
                    </div>

                    <div
                        onClick={() => navigate(createPageUrl('PerfilClinicaPublico') + '?id=mock-clinica')}
                        className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0 flex items-center justify-center font-bold text-xs" >C</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">Clínica Sorriso</h4>
                            <p className="text-xs text-gray-400 truncate">Odontologia • RJ</p>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-brand-coral">
                            <UserPlus size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quem Seguir */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Quem seguir</h3>
                    <MoreHorizontal className="text-gray-500 cursor-pointer hover:text-white" size={16} />
                </div>

                <div className="space-y-4">
                    <div
                        onClick={() => navigate(createPageUrl('VerProfissional') + '?id=mock-doctor')}
                        className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs" >👨‍⚕️</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">Dr. Roberto Silva</h4>
                            <p className="text-xs text-gray-400 truncate">@robertosilva</p>
                        </div>
                        <button className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                            Seguir
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Links - Agora funcionais */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 px-2">
                <button onClick={() => navigate(createPageUrl('TermosUso'))} className="hover:underline text-left">Termos</button>
                <button onClick={() => navigate(createPageUrl('PoliticaPrivacidade'))} className="hover:underline text-left">Privacidade</button>
                <button onClick={() => navigate(createPageUrl('Ajuda'))} className="hover:underline text-left">Ajuda</button>
                <span>© 2024 Doutorizze</span>
            </div>
        </aside>
    );
};

export default Widgets;
