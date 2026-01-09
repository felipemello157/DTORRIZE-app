import React, { useEffect } from 'react';
import { Apple, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import TopNav from '../components/home/TopNav';
import PhoneCarousel from '../components/home/PhoneCarousel';
import FeaturesCarousel from '../components/home/FeaturesCarousel';
import AppPreview from '../components/home/AppPreview';
import CTA from '../components/home/CTA';
import Footer from '../components/home/Footer';

const HomePage = () => {
  useEffect(() => {
    // Scroll Animation Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#0a0a1a] min-h-screen text-white overflow-x-hidden selection:bg-brand-coral selection:text-white">
      {/* Background Effects */}
      <div className="bg-mesh" />
      <div className="floating-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grid-pattern" />

      {/* Navigation */}
      <TopNav />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span>Novo! Marketplace de Equipamentos</span>
          </div>

          <h1 className="hero-title">
            Conectando <span className="hero-title-gradient">Profissionais</span> e <span className="hero-title-gradient">Clínicas</span> em um só lugar.
          </h1>

          <p className="hero-description">
            A plataforma completa para quem respira saúde. Encontre plantões, gerencie sua carreira, faça networking e muito mais.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">
              <Apple size={20} />
              Baixar App
            </button>
            <button className="btn-secondary">
              <Play size={20} fill="currentColor" />
              Ver Demo
            </button>
          </div>
        </div>

        {/* 3D Phone Carousel Component */}
        <PhoneCarousel />
      </section>

      {/* Features Carousel (TikTok Style) */}
      <FeaturesCarousel />

      {/* App Preview Section */}
      <AppPreview />

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;