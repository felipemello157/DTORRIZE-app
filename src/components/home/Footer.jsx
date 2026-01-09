import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <div className="footer-logo-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="footer-logo-text">Doutorizze</span>
                </div>

                <div className="footer-links">
                    <Link to="/PoliticaPrivacidade" className="footer-link">Privacidade</Link>
                    <Link to="/TermosUso" className="footer-link">Termos</Link>
                    <Link to="/Ajuda" className="footer-link">Ajuda</Link>
                    <a href="mailto:contato@doutorizze.com" className="footer-link">Contato</a>
                </div>

                <div className="flex gap-4">
                    <a href="#" className="text-white/60 hover:text-white transition-colors"><Instagram size={20} /></a>
                    <a href="#" className="text-white/60 hover:text-white transition-colors"><Linkedin size={20} /></a>
                    <a href="#" className="text-white/60 hover:text-white transition-colors"><Twitter size={20} /></a>
                </div>
            </div>
            <div className="footer-copyright">
                © 2024 Doutorizze. Todos os direitos reservados.
            </div>
        </footer>
    );
};

export default Footer;
