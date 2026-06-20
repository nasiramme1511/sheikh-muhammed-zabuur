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
        'logo.svg',
        'icon-48.png',
        'icon-96.png',
        'icon-180.png',
        'icon-192.png',
        'icon-512.png',
        'apple-touch-icon.png',
        'og-image.png',
        'video-placeholder.svg',
        'robots.txt',
      ],
      manifest: {
        name: 'Sheikh Mohammed Zabuur — Islamic Learning Platform',
        short_name: 'Sh. Zabuur',
        description:
          'Authentic Islamic education through audio lectures, video lessons, PDFs, live streams, and Telegram communities.',
        theme_color: '#0F766E',
        background_color: '#0B1220',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        scope: '/',
        start_url: '/',
        id: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['education', 'religion', 'islamic'],
        icons: [
          { src: '/icon-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
          { src: '/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: '/icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          {
            name: 'Audio Lectures',
            short_name: 'Audio',
            description: 'Browse audio lectures',
            url: '/audio',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Video Lectures',
            short_name: 'Videos',
            description: 'Watch video lectures',
            url: '/videos',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'PDF Library',
            short_name: 'PDFs',
            description: 'Read PDF books',
            url: '/pdfs',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Live Stream',
            short_name: 'Live',
            description: 'Join live stream',
            url: '/live',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'My Downloads',
            short_name: 'Downloads',
            description: 'Offline downloads',
            url: '/my-downloads',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
          },
        ],
        screenshots: [],
        prefer_related_applications: false,
        related_applications: [],
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
