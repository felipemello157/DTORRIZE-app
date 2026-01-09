import React, { useRef, useState, useEffect } from "react";
import { MapPin } from "lucide-react";

/**
 * Stories Unificado - Substituições + Vagas Fixas em um único carrossel
 */
export default function StoriesUnificado({ substituicoes, vagas, userType, onSubstituicaoClick, onVagaClick }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Combinar todos os itens
  const allItems = [
    ...substituicoes.map(item => ({ ...item, tipo: 'substituicao' })),
    ...vagas.map(item => ({ ...item, tipo: 'vaga' }))
  ];

  // Duplicar para loop infinito
  const duplicatedItems = [...allItems, ...allItems];

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current || isPaused || allItems.length === 0) return;

    const container = scrollRef.current;

    const animate = () => {
      if (!container || isPaused) return;
      container.scrollLeft += 0.5;
      const singleSetWidth = container.scrollWidth / 2;
      if (container.scrollLeft >= singleSetWidth) {
        container.scrollLeft = 0;
      }
    };

    const interval = setInterval(animate, 20);
    return () => clearInterval(interval);
  }, [isPaused, allItems.length]);

  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => setTimeout(() => setIsPaused(false), 3000);

  if (allItems.length === 0) return null;

  return (
    <div className="relative overflow-hidden py-4 px-3 bg-gradient-to-r from-brand-coral/20 via-brand-orange/20 to-brand-coral/20 border-b border-white/5">
      {/* Efeito de brilho */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>

      {/* Carrossel */}
      <div
        ref={scrollRef}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        className="flex gap-3 overflow-x-auto relative z-10"
        style={{
          scrollBehavior: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {duplicatedItems.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            onClick={() => {
              if (String(item.id).includes('-dup-')) {
                const realId = String(item.id).split('-dup-')[0];
                item.tipo === 'substituicao'
                  ? onSubstituicaoClick({ ...item, id: realId })
                  : onVagaClick({ ...item, id: realId });
              } else {
                item.tipo === 'substituicao'
                  ? onSubstituicaoClick(item)
                  : onVagaClick(item);
              }
            }}
            className="flex-shrink-0 w-[100px] bg-white/10 backdrop-blur-xl rounded-2xl p-2.5 shadow-lg border border-white/10 hover:border-brand-coral/50 transition-all active:scale-95 hover:bg-white/15"
          >
            {/* Badge Localização compacto */}
            <div className="flex items-center justify-center gap-1 mb-2 px-1.5 py-0.5 bg-black/40 rounded-full">
              <MapPin className="w-2.5 h-2.5 text-red-500 fill-red-500" />
              <span className="text-[9px] text-white font-bold truncate">
                {item.cidade}-{item.uf}
              </span>
            </div>

            {/* Foto Circular compacta */}
            <div className="relative mb-2 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-700 ring-2 ring-white/20 p-[1px]">
                {item.foto ? (
                  <img
                    src={item.foto}
                    alt={item.nome}
                    className="w-full h-full object-cover object-center rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {item.nome?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nome compacto */}
            <h3 className="text-[10px] font-bold text-white truncate text-center leading-tight mb-0.5 w-full">
              {item.nome}
            </h3>

            {/* Especialidade compacta */}
            <p className="text-[9px] text-brand-coral font-semibold truncate text-center mb-1.5 w-full">
              {item.especialidade}
            </p>

            {/* Badge Tipo compacto */}
            <div className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full shadow-md w-full ${item.tipo === 'substituicao'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
              <span className="text-[8px] font-bold uppercase tracking-wide">
                {item.tipo === 'substituicao' ? 'URGENTE' : 'VAGA'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}