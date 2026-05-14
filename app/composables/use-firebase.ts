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

export function useFirebase() {
    const {
        public: { firebaseConfig }
    } = useRuntimeConfig();
    const isSignedIntoDatabase = ref<boolean>(false);

    if (!app.value) app.value = initializeApp(firebaseConfig);

    return {
        isSignedIntoDatabase,
        signIntoDatabase: async (idToken: string, accessToken: string) => {
            try {
                await signInWithCredential(
                    getAuth(),
                    GoogleAuthProvider.credential(idToken, accessToken)
                );

                isSignedIntoDatabase.value = true;
            } catch (error) {
                captureError(error);
            }
        },
        signOutOfDatabase: async () => {
            await signOut(getAuth());

            isSignedIntoDatabase.value = false;
        },
        saveData: (path: string, data: string | object | null) => {
            return set(getRef(path), data);
        },
        subscribeToData: <T extends unknown>(path: string, callback: (data: T) => void) => {
            const reference = getRef(path);
            const handler = (snapshot: DataSnapshot) => {
                const value = snapshot.val();

                if (typeof value !== 'undefined') callback(value);
            };

            onValue(reference, handler);

            return () => off(reference, 'value', handler);
        }
    };
}

export function useFirebaseData<T>(path: MaybeRef<string>, callback: (data: T) => void) {
    const { isSignedIntoDatabase, subscribeToData } = useFirebase();
    let unsubscribe: (() => void) | null = null;

    function clean() {
        unsubscribe?.();

        unsubscribe = null;
    }

    function init() {
        clean();

        unsubscribe = subscribeToData<T>(toValue(path), callback);
    }

    watch(
        [isSignedIntoDatabase, ...(isRef(path) ? [path] : [])],
        () => {
            if (isSignedIntoDatabase.value) {
                init();
            }
        },
        { immediate: true }
    );
}
