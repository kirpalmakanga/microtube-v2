const {
    NUXT_PUBLIC_FIREBASE_API_KEY,
    NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NUXT_PUBLIC_FIREBASE_DATABASE_URL,
    NUXT_PUBLIC_FIREBASE_PROJECT_ID,
    NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NUXT_PUBLIC_FIREBASE_APP_ID
} = process.env;

export default defineNuxtConfig({
    app: {
        head: {
            title: 'Microtube',
            bodyAttrs: {
                style: 'background-color:oklch(21% 0.034 264.665));height:100dvh;'
            }
        }
    },
    ssr: false,
    modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia/colada-nuxt', 'pinia-plugin-persistedstate/nuxt'],
    imports: {
        dirs: ['composables/**']
    },
    css: ['~/assets/styles/main.css'],
    routeRules: {
        '/': { prerender: true }
    },
    devtools: {
        enabled: true
    },
    vite: {
        server: {
            allowedHosts: true
        },
        optimizeDeps: {
            include: [
                'axios',
                'firebase/app',
                'firebase/auth',
                'firebase/database',
                'date-fns',
                '@vueuse/core',
                '@vueuse/integrations/useSortable/component'
            ]
        }
    },
    runtimeConfig: {
        public: {
            firebaseConfig: {
                apiKey: NUXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                databaseURL: NUXT_PUBLIC_FIREBASE_DATABASE_URL,
                projectId: NUXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: NUXT_PUBLIC_FIREBASE_APP_ID
            }
        }
    },
    experimental: { viteEnvironmentApi: true },
    compatibilityDate: '2025-01-15'
});
