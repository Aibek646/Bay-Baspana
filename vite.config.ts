import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            // В сборке для App Store и Google Play сервис-воркер только вредит:
            // приложение и так стоит на телефоне, а его кеш умеет намертво
            // подсунуть старую версию, которую нечем сбросить
            disable: process.env.VITE_STORE_BUILD === '1',
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
            manifest: {
                name: 'BAY BASPANA',
                short_name: 'BAY',
                description: 'Каталог квартир',
                lang: 'ru',
                start_url: '/',
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#f3f4f6',
                theme_color: '#f3f4f6',
                icons: [
                    {
                        src: 'pwa-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        // только фотографии из Storage, не данные
                        urlPattern:
                            /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'apartment-photos',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
});
