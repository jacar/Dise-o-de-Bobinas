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
<div className="flex justify-center items-center w-full p-4 md:p-6">

// ...donde se limita la posición de elementos (agujeros, medidas, etc.)
// Antes:
const newX = Math.max(0, Math.min(calculations.svgWidth - (element.width || 20), x - dragOffset.x));
const newY = Math.max(0, Math.min(calculations.svgHeight - (element.height || 20), y - dragOffset.y));

// Después:
const newX = Math.max(CANVAS_MARGIN, Math.min(calculations.svgWidth - (element.width || 20) - CANVAS_MARGIN, x - dragOffset.x));
const newY = Math.max(CANVAS_MARGIN, Math.min(calculations.svgHeight - (element.height || 20) - CANVAS_MARGIN, y - dragOffset.y));

// Aplica este cambio en todos los handlers donde corresponda (mouse, touch, etc).

// ...resto del archivo sin cambios...