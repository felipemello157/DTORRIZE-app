import React from 'react';
import { Bell, Search, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

const AppPreview = () => {
    return (
        <section id="preview" className="app-preview-section">
            <div className="app-preview-content">
                <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    <span>Gestão na Palma da Mão</span>
                </div>
                <h2 className="section-title">Controle Total da<br />Sua Vida Profissional</h2>
                <p className="section-description mb-8">
                    Do feed de notícias às finanças, tudo foi pensado para facilitar o dia a dia do profissional de saúde moderno.
                </p>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
                            $
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Finanças Descomplicadas</h4>
                            <p className="text-white/60 text-sm">Acompanhe seus ganhos em tempo real.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                            📅
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Agenda Inteligente</h4>
                            <p className="text-white/60 text-sm">Gerencie plantões e consultas facilmente.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="app-preview-phone">
                <div className="app-preview-screen">
                    <div className="feed-preview">
                        {/* Header */}
                        <div className="feed-header-preview">
                            <div className="feed-logo-preview">
                                <div className="feed-logo-icon-preview">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <span className="feed-logo-text-preview">Doutorizze</span>
                            </div>
                            <div className="feed-icons-preview">
                                <div className="feed-icon-btn">
                                    <Search size={18} color="white" />
                                </div>
                                <div className="feed-icon-btn">
                                    <Bell size={18} color="white" />
                                    <div className="feed-icon-badge">3</div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="feed-content-preview">
                            {/* Stories */}
                            <div className="stories-preview">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="story-preview">
                                        <div className="story-avatar-preview">
                                            <div className="story-avatar-inner-preview">
                                                IMG
                                            </div>
                                        </div>
                                        <div className="story-name-preview">Dr. User {i}</div>
                                        <div className={`story-type-preview ${i % 2 === 0 ? 'type-diaria' : 'type-freelance'}`}>
                                            {i % 2 === 0 ? 'Plantão' : 'Freelance'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="stats-preview">
                                <div className="stat-preview">
                                    <div className="stat-value-preview">12</div>
                                    <div className="stat-label-preview">Propostas</div>
                                </div>
                                <div className="stat-preview">
                                    <div className="stat-value-preview">R$ 5k</div>
                                    <div className="stat-label-preview">Ganhos</div>
                                </div>
                                <div className="stat-preview">
                                    <div className="stat-value-preview">4.9</div>
                                    <div className="stat-label-preview">Avaliação</div>
                                </div>
                            </div>

                            {/* Feed Item */}
                            <div className="mini-card">
                                <div className="mini-card-header">
                                    <div className="mini-card-avatar">H</div>
                                    <div className="mini-card-info">
                                        <div className="mini-card-name">Hospital Santa Clara</div>
                                        <div className="mini-card-sub">Há 2 horas • São Paulo, SP</div>
                                    </div>
                                    <MoreHorizontal size={16} className="text-white/50" />
                                </div>
                                <div className="mini-card-image">
                                    <span className="text-white/40 text-xs">FOTO OPORTUNIDADE</span>
                                </div>
                                <div className="mini-card-text">
                                    Estamos contratando plantonistas para UTI Adulto. Plantões de 12h e 24h.
                                    Interessados enviar proposta.
                                </div>
                                <div className="flex gap-4 mt-3 pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-1 text-white/60 text-[10px]">
                                        <Heart size={12} /> 124
                                    </div>
                                    <div className="flex items-center gap-1 text-white/60 text-[10px]">
                                        <MessageCircle size={12} /> 12
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="bottombar-preview">
                            <div className="nav-item-preview active">
                                <div className="w-5 h-5 bg-white/20 rounded"></div>
                                <span className="nav-label-preview">Feed</span>
                            </div>
                            <div className="nav-item-preview">
                                <div className="w-5 h-5 bg-white/20 rounded"></div>
                                <span className="nav-label-preview">Vagas</span>
                            </div>
                            <div className="fab-preview">
                                <span className="text-white font-bold text-xl">+</span>
                            </div>
                            <div className="nav-item-preview">
                                <div className="w-5 h-5 bg-white/20 rounded"></div>
                                <span className="nav-label-preview">Loja</span>
                            </div>
                            <div className="nav-item-preview">
                                <div className="w-5 h-5 bg-white/20 rounded"></div>
                                <span className="nav-label-preview">Perfil</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppPreview;
