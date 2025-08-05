import React from "react";

export default function Page() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* SVG - FONDO */}
      <div className="w-full flex justify-center items-center relative z-0" style={{ minHeight: 400 }}>
        <svg width="656" height="659.2" className="border border-gray-200 rounded-lg touch-none" style={{backgroundColor: "rgb(249, 249, 249)"}}>
          <defs><linearGradient id="materialGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#E8E8E8"></stop><stop offset="100%" stopColor="#CCCCCC"></stop></linearGradient><linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#CD7F32"></stop><stop offset="100%" stopColor="#A0522D"></stop></linearGradient><marker id="arrowhead-black" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#333"></polygon></marker><marker id="arrowhead-black-v" markerWidth="6" markerHeight="8" refX="3" refY="7" orient="auto"><polygon points="0 0, 6 0, 3 8" fill="#333"></polygon></marker></defs>
          <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="1"></path></pattern></defs>
          <rect width="656" height="659.2" fill="url(#grid)" style={{pointerEvents: "none"}}></rect>
          <rect x="245.6" y="184.24" width="164.8" height="230.72" fill="url(#materialGradient)" stroke="#333" strokeWidth="1" rx="3" transform="rotate(0 328 299.6)"></rect>
          <rect x="253.84" y="184.24" width="148.32" height="230.72" fill="white" stroke="#666" strokeWidth="0.5" transform="rotate(0 328 299.6)"></rect>
          {/* ...el resto de tu SVG aquí (puedes pegarlo todo, lo corté para claridad) */}
        </svg>
      </div>

      {/* Sección: Configuración de Bobina */}
      <section className="w-full max-w-3xl mb-4 relative z-10">
        <h2 className="font-bold text-lg mb-2">Configuración de Bobina</h2>
        {/* ...tus componentes/campos aquí... */}
      </section>

      {/* Sección: Herramientas */}
      <section className="w-full max-w-3xl mb-4 relative z-10">
        <h2 className="font-bold text-lg mb-2">Herramientas</h2>
        {/* ...tus botones/componentes aquí... */}
      </section>
    </div>
  );
}
