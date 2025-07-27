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
  // Configuración para evitar problemas de SSR
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Configurar para renderizado dinámico
  trailingSlash: false,
  generateEtags: false,
  // Configuración específica para client components
  output: 'standalone',
}

export default nextConfig
