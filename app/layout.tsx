import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'VoiceCoil Designer - Constructor Profesional de Bobinas de Voz',
  description: 'Diseña y calcula bobinas de voz personalizadas para altavoces con precisión profesional. Configura parámetros técnicos y obtén especificaciones exactas en tiempo real. Herramienta para ingenieros de audio y fabricantes de altavoces.',
  keywords: [
    'bobina de voz',
    'voice coil',
    'diseño de altavoces',
    'calculadora de bobinas',
    'especificaciones técnicas',
    'audio profesional',
    'ingeniería de audio',
    'fabricación de altavoces',
    'woofer',
    'tweeter',
    'subwoofer',
    'driver de compresión',
    'impedancia',
    'ohmios',
    'aluminio',
    'cobre',
    'kapton',
    'bobinado',
    'devanado',
    'altavoces profesionales'
  ],
  authors: [{ name: 'Armando Ovalle J' }],
  creator: 'Armando Ovalle J',
  publisher: 'VoiceCoil Designer',
  generator: 'Next.js',
  applicationName: 'VoiceCoil Designer',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    title: 'VoiceCoil Designer - Constructor Profesional de Bobinas de Voz',
    description: 'Diseña y calcula bobinas de voz personalizadas para altavoces con precisión profesional. Configura parámetros técnicos y obtén especificaciones exactas en tiempo real.',
    url: 'https://voicecoil-designer.vercel.app',
    siteName: 'VoiceCoil Designer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoiceCoil Designer - Constructor de Bobinas de Voz',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoiceCoil Designer - Constructor Profesional de Bobinas de Voz',
    description: 'Diseña y calcula bobinas de voz personalizadas para altavoces con precisión profesional.',
    images: ['/og-image.png'],
    creator: '@jacar',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://voicecoil-designer.vercel.app',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        
        {/* Android Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#ffffff" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VoiceCoil Designer" />
        
        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "VoiceCoil Designer",
              "description": "Constructor Profesional de Bobinas de Voz para altavoces",
              "url": "https://voicecoil-designer.vercel.app",
              "applicationCategory": "EngineeringApplication",
              "operatingSystem": "Web Browser",
              "author": {
                "@type": "Person",
                "name": "Armando Ovalle J",
                "url": "https://github.com/jacar"
              },
              "creator": {
                "@type": "Person",
                "name": "Armando Ovalle J",
                "url": "https://github.com/jacar"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Diseño de bobinas de voz",
                "Cálculos técnicos en tiempo real",
                "Plantillas profesionales",
                "Exportación PNG/PDF",
                "Configuración de materiales",
                "Especificaciones técnicas"
              ]
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
