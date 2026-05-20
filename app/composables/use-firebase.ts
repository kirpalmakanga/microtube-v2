import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import {
    getDatabase,
    ref as databaseRef,
    set,
    onValue,
    off,
    type DataSnapshot
} from 'firebase/database';

const getRef = (path: string) => databaseRef(getDatabase(), path);

const app = ref<FirebaseApp | null>(null);

const uid = ref<string | null>(null);

export function useFirebase() {
    const {
        public: { firebaseConfig }
    } = useRuntimeConfig();

    if (!app.value) app.value = initializeApp(firebaseConfig);

    function createPath(path: string) {
        return `users/${import.meta.env.DEV ? 'dev' : uid.value}/${path}`;
    }

    return {
        isSignedIntoDatabase: computed(() => !!uid.value),
        signIntoDatabase: async (idToken: string, accessToken: string) => {
            try {
                const { user } = await signInWithCredential(
                    getAuth(),
                    GoogleAuthProvider.credential(idToken, accessToken)
                );

                uid.value = user.uid;
            } catch (error) {
                captureError(error);
            }
        },
        signOutOfDatabase: async () => {
            await signOut(getAuth());

            uid.value = null;
        },
        saveData: (path: string, data: string | object | null) => {
            return set(getRef(createPath(path)), data);
        },
        subscribeToData: <T extends unknown>(path: string, callback: (data: T | null) => void) => {
            const reference = getRef(createPath(path));
            const handler = (snapshot: DataSnapshot) => callback(snapshot.val());

            onValue(reference, handler);

            return () => off(reference, 'value', handler);
        }
    };
}

export function useFirebaseData<T>(path: string, callback: (data: T | null) => void) {
    const { isSignedIntoDatabase, subscribeToData } = useFirebase();
    let unsubscribe: (() => void) | null = null;

    function clean() {
        unsubscribe?.();

        unsubscribe = null;
    }

    function init() {
        clean();

        unsubscribe = subscribeToData<T>(path, callback);
    }

    watch(
        isSignedIntoDatabase,
        () => {
            if (isSignedIntoDatabase.value) init();
            else clean();
        },
        { immediate: true }
    );

    onUnmounted(clean);
}
