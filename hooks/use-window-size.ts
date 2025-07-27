import { useState, useEffect } from 'react'

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 1024, // Default desktop size
    height: 768,
  })

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return
    }

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Establecer tamaño inicial
    handleResize()

    // Agregar event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export function useIsMobile(): boolean {
  const { width } = useWindowSize()
  return width < 768
}

export function useIsTablet(): boolean {
  const { width } = useWindowSize()
  return width >= 768 && width < 1024
}

export function useIsLaptop(): boolean {
  const { width } = useWindowSize()
  return width >= 1024 && width < 1440
}

export function useIsDesktop(): boolean {
  const { width } = useWindowSize()
  return width >= 1440
} 