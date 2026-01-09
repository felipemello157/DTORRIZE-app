import React from 'react';
import { Briefcase, Users, PieChart, ShoppingBag, Bot, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: <Briefcase size={32} className="text-white" />,
        colorClass: 'feature-icon-coral',
        title: 'Vagas Exclusivas',
        description: 'Acesse as melhores oportunidades na área da saúde, filtradas pelo seu perfil e especialidade.',
        linkText: 'Buscar Vagas',
        linkTo: '/vagas'
    },
    {
        icon: <Users size={32} className="text-white" />,
        colorClass: 'feature-icon-purple',
        title: 'Networking',
        description: 'Conecte-se com outros profissionais, troque experiências e expanda sua rede de contatos.',
        linkText: 'Ver Feed',
        linkTo: '/feed'
    },
    {
        icon: <PieChart size={32} className="text-white" />,
        colorClass: 'feature-icon-blue',
        title: 'Gestão Inteligente',
        description: 'Ferramentas completas para gerenciar sua carreira, agenda e finanças em um só lugar.',
        linkText: 'Meu Perfil',
        linkTo: '/meu-perfil'
    },
    {
        icon: <ShoppingBag size={32} className="text-white" />,
        colorClass: 'feature-icon-green',
        title: 'Marketplace',
        description: 'Compre e venda equipamentos, cursos e materiais com segurança e facilidade.',
        linkText: 'Ir para Loja',
        linkTo: '/marketplace'
    },
    {
        icon: <Bot size={32} className="text-white" />,
        colorClass: 'feature-icon-coral',
        title: 'Marketing IA',
        description: 'Crie conteúdos incríveis para suas redes sociais com ajuda da nossa Inteligência Artificial.',
        linkText: 'Testar Agora',
        linkTo: '/marketing'
    }
];

const FeaturesCarousel = () => {
    return (
        <section id="features" className="features-section">
            <div className="features-header">
                <div className="section-badge">
                    <span>🚀</span>
                    <span>Tudo em um só lugar</span>
                </div>
                <h2 className="section-title">A Super App para<br />Profissionais de Saúde</h2>
                <p className="section-description">
                    Unificamos tudo o que você precisa para alavancar sua carreira em uma experiência única e fluida.
                </p>
            </div>

            <div className="features-carousel">
                {features.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <div className={`feature-icon ${feature.colorClass}`}>
                            {feature.icon}
                        </div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                        <Link to={feature.linkTo} className="feature-link">
                            {feature.linkText}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesCarousel;
