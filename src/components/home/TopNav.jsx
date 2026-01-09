import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopNav = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="nav-logo">
                <div className="nav-logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="nav-logo-text">Doutorizze</span>
            </Link>

            <div className={`nav-links ${mobileMenuOpen ? 'flex flex-col absolute top-20 left-0 w-full bg-[#0a0a1a] p-4 lg:flex-row lg:static lg:w-auto lg:bg-transparent lg:p-0' : 'hidden lg:flex'}`}>
                <a href="#features" className="nav-link">Funcionalidades</a>
                <a href="#preview" className="nav-link">App</a>
                <a href="#testimonials" className="nav-link">Depoimentos</a>
                <a href="#about" className="nav-link">Sobre</a>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/login" className="text-white/70 hover:text-white font-medium text-sm transition-colors">
                    Entrar
                </Link>
                <Link to="/register-clinic" className="nav-cta">
                    Cadastrar Clínica
                </Link>
                <button
                    className="lg:hidden text-white ml-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </nav>
    );
};

export default TopNav;
