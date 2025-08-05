// ...otros imports y hooks...

export default function Page(props) {
  // ...hooks y lógica previa...

  return (
    <div className="w-full flex flex-col items-center">
      {/* Sección: Configuración de Bobina */}
      <section className="w-full max-w-3xl mb-4 z-20 relative">
        <h2 className="font-bold text-lg mb-2">Configuración de Bobina</h2>
        {/* ...campos y controles de configuración... */}
      </section>

      {/* Sección: Herramientas */}
      <section className="w-full max-w-3xl mb-4 z-20 relative">
        <h2 className="font-bold text-lg mb-2">Herramientas</h2>
        {/* ...botones, selectores y utilidades... */}
      </section>

      {/* Canvas/SVG de la bobina */}
      <div
        className="relative flex justify-center items-center w-full p-4 md:p-6 z-10"
        style={{
          minHeight: 400,
          maxWidth: "100vw",
          overflow: "auto",
        }}
      >
        {/* SVG de la bobina - SIEMPRE al fondo */}
        <div style={{ zIndex: 0, position: 'relative', width: "100%", display: "flex", justifyContent: "center" }}>
          <svg
            width={calculations.svgWidth}
            height={calculations.svgHeight}
            ref={svgRef}
            className="border border-gray-200 rounded-lg touch-none"
            style={{
              backgroundColor: "#f9f9f9",
              display: "block",
              maxWidth: "100%",
              height: "auto",
            }}
            // ...otros props
          >
            {/* ...contenido SVG (bobina y elementos SVG) */}
          </svg>
        </div>
        {/* Elementos interactivos o overlays fuera del SVG */}
        <div
          style={{
            zIndex: 10,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {/* Aquí puedes renderizar popups, tooltips, toolbars flotantes, etc. */}
        </div>
      </div>
    </div>
  );
}

// ...resto del archivo igual...