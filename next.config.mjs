/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para evitar problemas de SSR con window
  experimental: {
    // Deshabilitar prerendering estático para páginas que usan window
    workerThreads: false,
    cpus: 1,
  },
  // Configurar para renderizado dinámico
  trailingSlash: false,
  generateEtags: false,
}

export default nextConfig
