import { logIn, refreshAccessToken } from '~/services/youtube';
import { captureError } from '~/utils/helpers';

export const getInitialState = (): User => ({
    id: '',
    name: '',
    picture: '',
    accessToken: '',
    refreshToken: '',
    idToken: ''
});

export const useAuthStore = defineStore(
    'auth',
    () => {
        const { signIntoDatabase, signOutOfDatabase } = useFirebase();
        const state = reactive<User>(getInitialState());

        async function signIn(code: string) {
            const user = await logIn(code);

            Object.assign(state, user);
        }

        async function signOut() {
            try {
                await signOutOfDatabase();

                Object.assign(state, getInitialState());
            } catch (error) {
                captureError(error);
            }
        }

        async function refreshTokens() {
            const data = await refreshAccessToken(state.refreshToken);

            Object.assign(state, data);
        }

        watch(
            () => state.accessToken,
            async (accessToken) => {
                if (accessToken) {
                    try {
                        await signIntoDatabase(state.idToken, accessToken);
                    } catch (error) {
                        captureError(error);

                        await refreshTokens();
                    }
                } else {
                    await signOutOfDatabase();
                }
            }
        );

        return {
            ...toRefs(state),
            isSignedIn: computed(() => !!state.accessToken),
            signIn,
            signOut,
            refreshTokens
        };
    },
    {
        persist: {
            storage: piniaPluginPersistedstate.localStorage()
        }
    }
);
