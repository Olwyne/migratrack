import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MigraTrack',
        short_name: 'MigraTrack',
        description: 'Suivi des migraines',
        theme_color: '#5C5FAA',
        background_color: '#F8F7FC',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: 'any', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ],
  server: { port: 5556 },
})
