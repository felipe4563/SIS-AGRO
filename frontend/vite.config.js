import { defineConfig } from 'vite';
import react          from '@vitejs/plugin-react';
import tailwindcss    from '@tailwindcss/vite';
import { VitePWA }   from 'vite-plugin-pwa';

// ── Manifest de la PWA ────────────────────────────────────────────────────────
const pwaManifest = {
  name:             'SIS-AGRO — Sistema Agropecuario',
  short_name:       'SIS-AGRO',
  description:      'Gestión de Ventas, Inventario, Caja y Reportes Agropecuarios',
  theme_color:      '#facc15',   // yellow-400 (color acento del sistema)
  background_color: '#18181b',   // zinc-900
  display:          'standalone',
  orientation:      'portrait-primary',
  start_url:        '/dashboard',
  scope:            '/',
  lang:             'es',
  categories:       ['business', 'productivity'],
  icons: [
    {
      src:     '/logo.png',
      sizes:   '192x192',
      type:    'image/png',
    },
    {
      src:     '/logo.png',
      sizes:   '512x512',
      type:    'image/png',
    },
    {
      src:     '/logo.png',
      sizes:   '512x512',
      type:    'image/png',
      purpose: 'maskable',
    },
  ],
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType:  'autoUpdate',   // actualiza SW automáticamente en background
      injectRegister: 'auto',

      manifest: pwaManifest,

      // ── Workbox (service worker) ──────────────────────────────────────────
      workbox: {
        // Archivos a pre-cachear (app shell)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Rutas de la SPA — el SW responde con index.html para navegación offline
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],   // las llamadas API no usan fallback

        runtimeCaching: [
          // ── Estado en tiempo real (caja/turno): siempre red, nunca caché ───
          // Una respuesta vieja de este endpoint bloquea ventas aunque ya
          // haya turno abierto y haya conexión — no puede servirse de caché.
          {
            urlPattern: /^https?:\/\/.*\/api\/caja\/turno-activo/i,
            handler:    'NetworkOnly',
          },
          // ── API: Network-first, caché de respaldo 24h ─────────────────────
          {
            urlPattern: /^https?:\/\/.*\/api\//i,
            handler:    'NetworkFirst',
            options: {
              cacheName:            'api-runtime',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries:    300,
                maxAgeSeconds: 60 * 60 * 24,   // 24 horas
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Imágenes / uploads: Cache-first 30 días ───────────────────────
          {
            urlPattern: /\/uploads\//i,
            handler:    'CacheFirst',
            options: {
              cacheName: 'uploads',
              expiration: {
                maxEntries:    150,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Fuentes / assets externos ─────────────────────────────────────
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/i,
            handler:    'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // ── Opciones de desarrollo ────────────────────────────────────────────
      devOptions: {
        enabled:  false,   // desactiva SW en dev para evitar problemas con HMR
        type:     'module',
      },
    }),
  ],

  server: {
    allowedHosts: [
      'atm-zoo-measurements-newspapers.trycloudflare.com',
    ],
  },

  test: {
    environment: 'jsdom',
  },
});
