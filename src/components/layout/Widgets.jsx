import React from 'react';
import { UserPlus, MoreHorizontal } from 'lucide-react';

const Widgets = () => {
    return (
        <aside className="hidden xl:flex flex-col w-[350px] h-screen sticky top-0 p-6 space-y-6">
            {/* Search Bar Placeholder (Optional) */}
            <div className="bg-white/5 rounded-full px-4 py-3 flex items-center gap-3 border border-white/5 focus-within:border-brand-coral/50 transition-colors">
                <span className="text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder="Buscar no Doutorizze"
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                />
            </div>

            {/* Sugestões */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Talvez você curta</h3>
                    <button className="text-brand-coral text-xs font-semibold hover:underline">Ver tudo</button>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">Hospital São Lucas</h4>
                                <p className="text-xs text-gray-400 truncate">Cardiologia • SP</p>
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-brand-coral">
                                <UserPlus size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quem Seguir */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Quem seguir</h3>
                    <MoreHorizontal className="text-gray-500 cursor-pointer hover:text-white" size={16} />
                </div>

                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">Dr. Roberto Silva</h4>
                                <p className="text-xs text-gray-400 truncate">@robertosilva</p>
                            </div>
                            <button className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                Seguir
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 px-2">
                <a href="#" className="hover:underline">Termos</a>
                <a href="#" className="hover:underline">Privacidade</a>
                <a href="#" className="hover:underline">Cookies</a>
                <a href="#" className="hover:underline">Sobre nós</a>
                <span>© 2024 Doutorizze</span>
            </div>
        </aside>
    );
};

export default Widgets;
