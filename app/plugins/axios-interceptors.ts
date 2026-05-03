import { instance } from '~/services/youtube';

export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();
    const { refreshTokens, signOut } = authStore;
    const { accessToken } = storeToRefs(authStore);

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

            if (status === 401 && !config._retry) {
                config._retry = true;

                try {
                    await refreshTokens();

                    return instance(config);
                } catch (refreshError) {
                    await signOut();

                    navigateTo('/login');

                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );
});
