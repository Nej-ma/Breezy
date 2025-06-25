import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimisations pour la production
  output: 'standalone',
  
  // Images optimisées
  images: {
    domains: [
      'api.breezy.website',
      'localhost'
    ],
    unoptimized: false,
  },

  // Compression et optimisations
  compress: true,
  poweredByHeader: false,
  
  // Gestion des erreurs en production
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'notifications=()'
          }
        ]
      }
    ]
  }
}

export default nextConfig