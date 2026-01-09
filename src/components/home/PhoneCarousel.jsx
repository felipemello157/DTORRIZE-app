import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PhoneFrame from "./PhoneFrame";
import { MockFeedScreen, MockVagasScreen, MockMarketplaceScreen } from "./MockScreens";

const SCREENS = [
    { id: 0, component: <MockVagasScreen />, label: "Vagas", color: "from-yellow-400 to-orange-500", desc: "Encontre oportunidades" },
    { id: 1, component: <MockFeedScreen />, label: "Social", color: "from-pink-500 to-red-500", desc: "Conecte-se" },
    { id: 2, component: <MockMarketplaceScreen />, label: "Market", color: "from-blue-400 to-indigo-500", desc: "Compre e Venda" },
];

export default function PhoneCarousel() {
    const [activeIndex, setActiveIndex] = useState(1); // Começa no meio (Feed)

    const nextSlide = () => {
        setActiveIndex((prev) => (prev === SCREENS.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev === 0 ? SCREENS.length - 1 : prev - 1));
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto h-[700px] flex items-center justify-center perspective-1000">
            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 md:left-20 z-30 p-3 rounded-full bg-white/80 backdrop-blur shadow-lg hover:bg-white transition-all text-gray-800"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 md:right-20 z-30 p-3 rounded-full bg-white/80 backdrop-blur shadow-lg hover:bg-white transition-all text-gray-800"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div className="relative w-full flex items-center justify-center p-10">
                <AnimatePresence mode="popLayout">
                    {SCREENS.map((screen, index) => {
                        // Lógica de Posição
                        // 0: Esquerda, 1: Centro, 2: Direita (para 3 itens)
                        // Ajuste relativo ao activeIndex

                        let position = 0; // 0 = Center
                        if (index === activeIndex) position = 0;
                        else if (index === (activeIndex - 1 + SCREENS.length) % SCREENS.length) position = -1; // Left
                        else position = 1; // Right

                        return (
                            <motion.div
                                key={screen.id}
                                initial={false}
                                animate={{
                                    x: position === 0 ? "0%" : position === -1 ? "-60%" : "60%",
                                    scale: position === 0 ? 1 : 0.8,
                                    opacity: position === 0 ? 1 : 0.6,
                                    zIndex: position === 0 ? 10 : 5,
                                    rotateY: position === 0 ? 0 : position === -1 ? 15 : -15,
                                }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute cursor-pointer"
                                onClick={() => setActiveIndex(index)}
                                style={{ perspective: "1000px" }}
                            >
                                {/* Label Badge */}
                                <motion.div
                                    animate={{ opacity: position === 0 ? 1 : 0, y: position === 0 ? -20 : 0 }}
                                    className={`absolute -top-12 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r ${screen.color} text-white font-bold shadow-lg whitespace-nowrap z-20`}
                                >
                                    {screen.desc}
                                </motion.div>

                                <PhoneFrame>
                                    {screen.component}
                                </PhoneFrame>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-10 flex gap-3">
                {SCREENS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${idx === activeIndex
                                ? "bg-gray-800 w-8"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
