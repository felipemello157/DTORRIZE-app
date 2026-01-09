import React from "react";

export default function PhoneFrame({ children }) {
    return (
        <div className="relative mx-auto border-gray-900 bg-gray-900 border-[10px] rounded-[2.5rem] h-[580px] w-[290px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-gray-900/50">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[24px] w-[90px] bg-black rounded-b-[1rem] z-20"></div>

            {/* Screen Content */}
            <div className="flex-1 bg-white rounded-[2rem] overflow-hidden relative w-full h-full">
                {/* Inner Border Smoothness */}
                <div className="absolute inset-0 rounded-[2rem] pointer-events-none border border-black/5 z-10"></div>
                {children}
            </div>

            {/* Side Buttons (Decorativos) */}
            <div className="absolute top-[80px] -left-[14px] h-[35px] w-[4px] bg-gray-800 rounded-l-lg"></div>
            <div className="absolute top-[130px] -left-[14px] h-[50px] w-[4px] bg-gray-800 rounded-l-lg"></div>
            <div className="absolute top-[100px] -right-[14px] h-[70px] w-[4px] bg-gray-800 rounded-r-lg"></div>
        </div>
    );
}
