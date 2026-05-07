import { getAuthorizationUrl, refreshAccessToken } from '~/services/youtube';
import { captureError } from '~/utils/helpers';

interface AuthState {
    id: string;
    name: string;
    picture: string;
    accessToken: string;
    refreshToken: string;
    idToken: string;
    isSignedIn: boolean;
}

export const getInitialState = (): AuthState => ({
    id: '',
    name: '',
    picture: '',
    accessToken: '',
    refreshToken: '',
    idToken: '',
    isSignedIn: false
});

export const useAuthStore = defineStore(
    'auth',
    () => {
        const { signIntoDatabase, signOutOfDatabase } = useFirebase();
        const state = reactive<AuthState>(getInitialState());

        async function signIn() {
            window.location.href = await getAuthorizationUrl();
        }

        function setUser(data: User) {
            Object.assign(state, data, { isSignedIn: true });
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
                    signOutOfDatabase();
                }
            }
        );

        return {
            ...toRefs(state),
            setUser,
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
