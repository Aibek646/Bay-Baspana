import type { CapacitorConfig } from '@capacitor/cli';

// appId менять после публикации нельзя — магазин считает его именем приложения
const config: CapacitorConfig = {
    appId: 'kz.baybaspana.app',
    appName: 'BAY BASPANA',
    webDir: 'dist',
    android: {
        // тема всегда чёрная: без этого при запуске мигает белым
        backgroundColor: '#000000',
    },
};

export default config;
