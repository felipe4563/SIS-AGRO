import { defineConfig } from 'vite';
import react       from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA }  from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'rusoft.dev — Panel Admin',
        short_name: 'Rusoft',
        description: 'Panel de administración rusoft.dev',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        scope: '/',
        start_url: '/login',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rusoft\.dev\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
          },
        ],
      },
    }),
  ],
  server: { port: 5174 },
});
