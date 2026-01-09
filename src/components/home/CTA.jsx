import React from 'react';
import { Apple, Play } from 'lucide-react';

const CTA = () => {
    return (
        <section className="cta-section">
            <div className="cta-card">
                <div className="cta-content">
                    <h2 className="cta-title">Pronto para revolucionar<br />sua carreira?</h2>
                    <p className="cta-description">
                        Junte-se a milhares de profissionais e clínicas que já estão transformando o mercado de saúde.
                    </p>
                    <div className="cta-buttons">
                        <button className="cta-btn-white">
                            <Apple size={24} />
                            Baixar para iOS
                        </button>
                        <button className="cta-btn-outline">
                            <Play size={24} fill="currentColor" />
                            Baixar para Android
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
