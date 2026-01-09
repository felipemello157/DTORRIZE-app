import React from "react";
import {
    Bell,
    Search,
    Filter,
    MapPin,
    Star,
    MoreVertical,
    Heart,
    MessageCircle,
    Share2,
    Briefcase,
    ShoppingBag,
    Home as HomeIcon,
    User,
    PlusCircle,
    CheckCircle2
} from "lucide-react";

// --- COMPONENTES AUXILIARES ---

const StatusBar = () => (
    <div className="h-6 w-full bg-white flex justify-between items-center px-4 text-[10px] font-bold text-gray-800">
        <span>9:41</span>
        <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
        </div>
    </div>
);

const BottomNav = ({ active }) => (
    <div className="h-16 bg-white border-t border-gray-100 flex justify-around items-center text-gray-400 px-2">
        <HomeIcon className={`w-6 h-6 ${active === 'Feed' ? 'text-orange-500 fill-orange-500/20' : ''}`} />
        <Briefcase className={`w-6 h-6 ${active === 'Vagas' ? 'text-orange-500 fill-orange-500/20' : ''}`} />
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-white -mt-6 shadow-lg">
            <PlusCircle className="w-6 h-6" />
        </div>
        <ShoppingBag className={`w-6 h-6 ${active === 'Marketplace' ? 'text-orange-500 fill-orange-500/20' : ''}`} />
        <User className="w-6 h-6" />
    </div>
);

// --- TELAS MOCK ---

export const MockFeedScreen = () => (
    <div className="w-full h-full bg-gray-50 flex flex-col font-sans overflow-hidden select-none pointer-events-none">
        <StatusBar />

        {/* Header */}
        <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg"></div>
                <span className="font-black text-gray-800">Doutorizze</span>
            </div>
            <div className="flex gap-3 text-gray-600">
                <Search className="w-5 h-5" />
                <Bell className="w-5 h-5" />
            </div>
        </div>

        {/* Stories */}
        <div className="flex gap-3 px-4 py-3 overflow-hidden bg-white border-b border-gray-100">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-14 h-14 rounded-full border-2 border-pink-500 p-0.5">
                        <div className="w-full h-full bg-gray-200 rounded-full"></div>
                    </div>
                    <span className="text-[10px] text-gray-500">Story {i}</span>
                </div>
            ))}
        </div>

        {/* Feed Content */}
        <div className="flex-1 overflow-hidden p-3 space-y-3">
            {/* Post 1 */}
            <div className="bg-white rounded-2xl p-3 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                        <div>
                            <p className="font-bold text-sm text-gray-900">Dr. Silva</p>
                            <p className="text-xs text-gray-500">Dentista • 2h</p>
                        </div>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="h-32 bg-gray-100 rounded-xl mb-2"></div>
                <div className="flex gap-4 text-gray-500">
                    <Heart className="w-5 h-5" />
                    <MessageCircle className="w-5 h-5" />
                    <Share2 className="w-5 h-5 ml-auto" />
                </div>
            </div>

            {/* Post 2 */}
            <div className="bg-white rounded-2xl p-3 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full"></div>
                        <div>
                            <p className="font-bold text-sm text-gray-900">Clínica Top</p>
                            <p className="text-xs text-gray-500">Patrocinado</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-800 mb-2">Nova vaga disponível para Ortodontista!</p>
                <div className="h-24 bg-gray-100 rounded-xl"></div>
            </div>
        </div>

        <BottomNav active="Feed" />
    </div>
);

export const MockVagasScreen = () => (
    <div className="w-full h-full bg-gray-50 flex flex-col font-sans overflow-hidden select-none pointer-events-none">
        <StatusBar />

        {/* Header */}
        <div className="bg-white px-4 py-3 shadow-sm z-10">
            <h1 className="font-black text-xl text-gray-800 mb-2">Vagas</h1>
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input disabled type="text" placeholder="Buscar cargo..." className="w-full bg-gray-100 rounded-xl py-2 pl-9 pr-4 text-sm" />
            </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 px-4 py-3 overflow-hidden">
            <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold">Todas</span>
            <span className="px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-full text-xs font-bold">Plantão</span>
            <span className="px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-full text-xs font-bold">Fixo</span>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-hidden px-4 space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between mb-2">
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Destaque</span>
                        <span className="text-[10px] text-gray-400">Há 2h</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">Cirurgião Dentista</h3>
                    <p className="text-xs text-gray-500 mb-2">Clínica OdontoLife • SP</p>
                    <div className="flex justify-between items-center">
                        <span className="text-green-600 font-bold text-sm">R$ 5.000</span>
                        <button className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Ver</button>
                    </div>
                </div>
            ))}
        </div>

        <BottomNav active="Vagas" />
    </div>
);

export const MockMarketplaceScreen = () => (
    <div className="w-full h-full bg-gray-50 flex flex-col font-sans overflow-hidden select-none pointer-events-none">
        <StatusBar />

        {/* Header */}
        <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
            <h1 className="font-black text-xl text-gray-800">Market</h1>
            <ShoppingBag className="w-5 h-5 text-gray-800" />
        </div>

        {/* Banner */}
        <div className="m-4 h-32 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white flex flex-col justify-center">
            <span className="text-xs font-bold opacity-75">OFERTA DO DIA</span>
            <h2 className="text-lg font-black leading-tight">Equipamentos com 30% OFF</h2>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-hidden px-4">
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-2 rounded-xl shadow-sm">
                        <div className="h-24 bg-gray-100 rounded-lg mb-2 relative">
                            <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm">
                                <Heart className="w-3 h-3 text-gray-400" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-900 truncate">Cadeira Odontológica</p>
                        <p className="text-xs text-gray-500 mb-1">Usado • Bom estado</p>
                        <p className="text-sm font-black text-green-600">R$ 2.500</p>
                    </div>
                ))}
            </div>
        </div>

        <BottomNav active="Marketplace" />
    </div>
);
