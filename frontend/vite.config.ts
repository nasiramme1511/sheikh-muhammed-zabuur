import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icon-maskable.svg',
        'logo.svg',
        'logo-dark.svg',
        'logo-light.svg',
        'og-image.png',
        'splash-screen.svg',
        'social-avatar.svg',
        'video-placeholder.svg',
        'robots.txt',
      ],
      manifest: {
        name: 'Sheikh Mohammed Zabuur — Official Islamic Learning Platform',
        short_name: 'Sh. Zabuur',
        description:
          'Authentic Islamic education with Sheikh Mohammed Zabuur. Download audio lectures, video lessons, and PDF books. Study Tafsir, Hadith, Aqeedah, and Fiqh offline.',
        theme_color: '#0F766E',
        background_color: '#064E4A',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        scope: '/',
        start_url: '/',
        id: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['education', 'religion', 'islam', 'books', 'reference'],
        icons: [
          { src: '/icon-48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/favicon.svg', sizes: '48x48 96x96 128x128 192x192 256x256 512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-maskable.svg', sizes: '48x48 96x96 128x128 192x192 256x256 512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Audio Lectures',
            short_name: 'Audio',
            description: 'Browse audio lectures by Sheikh Mohammed Zabuur',
            url: '/audio',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Video Lectures',
            short_name: 'Videos',
            description: 'Watch video lectures and recorded lessons',
            url: '/videos',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Study Series',
            short_name: 'Series',
            description: 'Explore structured Islamic study series',
            url: '/series',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Live Stream',
            short_name: 'Live',
            description: 'Join live stream broadcast',
            url: '/live',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'My Downloads',
            short_name: 'Downloads',
            description: 'Access your offline downloads',
            url: '/my-downloads',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
        ],
        screenshots: [],
        prefer_related_applications: false,
        related_applications: [],
        edge_side_panel: {},
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:mp3|wav|ogg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:mp4|webm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'video-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:pdf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/img\.youtube\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbnails',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      selfDestroying: false,
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['framer-motion'],
          'icons': ['lucide-react', 'react-icons'],
          'pdf': ['react-pdf'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
});
