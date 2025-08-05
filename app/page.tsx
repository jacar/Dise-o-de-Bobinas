// ...otros imports y hooks...

// Margen constante para el canvas y los elementos
const CANVAS_MARGIN = 20;

// ...dentro de useMemo o donde calculas las dimensiones del SVG/canvas...
const calculations = useMemo(() => {
  let svgWidth: number;
  let svgHeight: number;

  if (isMobile) {
    svgWidth = Math.min(windowWidth - 16 - CANVAS_MARGIN * 2, windowWidth - 16 - CANVAS_MARGIN * 2);
    svgHeight = Math.min(windowHeight * 0.45 - CANVAS_MARGIN * 2, windowHeight * 0.45 - CANVAS_MARGIN * 2);
  } else if (isTablet) {
    svgWidth = Math.min(windowWidth - 100 - CANVAS_MARGIN * 2, 600 - CANVAS_MARGIN * 2);
    svgHeight = Math.min(windowHeight * 0.7 - CANVAS_MARGIN * 2, windowHeight * 0.7 - CANVAS_MARGIN * 2);
  } else if (isLaptop) {
    svgWidth = Math.min(windowWidth - 400 - CANVAS_MARGIN * 2, 800 - CANVAS_MARGIN * 2);
    svgHeight = Math.min(windowHeight * 0.8 - CANVAS_MARGIN * 2, 800 - CANVAS_MARGIN * 2);
  } else {
    svgWidth = Math.min(windowWidth - 500 - CANVAS_MARGIN * 2, 1000 - CANVAS_MARGIN * 2);
    svgHeight = Math.min(windowHeight * 0.85 - CANVAS_MARGIN * 2, 900 - CANVAS_MARGIN * 2);
  }

  // ...resto igual...
  return {
    // ...otras propiedades...
    svgWidth,
    svgHeight,
    // ...
  };
}, [params, windowWidth, windowHeight, isMobile, isTablet, isLaptop, isDesktop]);

// ...dentro del JSX, cambia el padding del contenedor...
<div className="relative w-full flex justify-center items-center p-4 md:p-6" style={{ minHeight: 400 }}>
  {/* SVG de la bobina - SIEMPRE al fondo */}
  <div style={{ zIndex: 0, position: 'relative' }}>
    <svg
      width={calculations.svgWidth}
      height={calculations.svgHeight}
      ref={svgRef}
      className="border border-gray-200 rounded-lg touch-none"
      style={{ backgroundColor: "#f9f9f9" }}
      // ...otros props
    >
      {/* ...contenido SVG (bobina y elementos SVG) */}
      {/* Los elementos interactivos dentro del SVG deben ir después del tubo y bobinado */}
    </svg>
  </div>
  
  {/* Elementos interactivos o overlays fuera del SVG */}
  <div style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
    {/* Aquí puedes renderizar popups, tooltips, toolbars flotantes, etc. */}
  </div>
</div>

// ...donde se limita la posición de elementos (agujeros, medidas, etc.)
// Antes:
// const newX = Math.max(0, Math.min(calculations.svgWidth - (element.width || 20), x - dragOffset.x));
// const newY = Math.max(0, Math.min(calculations.svgHeight - (element.height || 20), y - dragOffset.y));
//
// Después:
const newX = Math.max(CANVAS_MARGIN, Math.min(calculations.svgWidth - (element.width || 20) - CANVAS_MARGIN, x - dragOffset.x));
const newY = Math.max(CANVAS_MARGIN, Math.min(calculations.svgHeight - (element.height || 20) - CANVAS_MARGIN, y - dragOffset.y));

// Aplica este cambio en todos los handlers donde corresponda (mouse, touch, etc).

// ...resto del archivo sin cambios...

// NOTA: Si todos los elementos interactivos están dentro del SVG (como <g> o <foreignObject>) {
// asegúrate de que el orden de los elementos en el JSX sea así:
// 1. Fondo, bobina, bobinado (primero en el SVG, fondo visual)
// 2. Luego los <g> de elementos interactivos, labels, etc (al final del <svg>, visibles arriba)

// Si tienes overlays React fuera del SVG (menús, tooltips, etc), deben ir en el <div> con zIndex 10.