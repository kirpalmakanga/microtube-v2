import { instance } from '~/services/youtube';

export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();
    const { refreshTokens, signOut } = authStore;
    const { accessToken } = storeToRefs(authStore);

    let refreshing: Promise<void> | null = null;

    async function refresh() {
        if (!refreshing) {
            refreshing = refreshTokens();
        }

        try {
            await refreshing;
        } finally {
            refreshing = null;
        }
    }

    instance.interceptors.request.use((config) => {
        if (accessToken.value) {
            config.headers.Authorization = `Bearer ${accessToken.value}`;
        }

        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const {
                response: { status },
                config
            } = error;

            if (status !== 401 || config._hasBeenRetried) {
                return Promise.reject(error);
            }

            config._hasBeenRetried = true;

            try {
                await refresh();

                return instance(config);
            } catch (refreshError) {
                await signOut();

                await navigateTo('/login');

                return Promise.reject(refreshError);
            }
        }
    );
});
