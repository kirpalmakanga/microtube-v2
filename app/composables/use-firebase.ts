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

    if (!app.value) app.value = initializeApp(firebaseConfig);

    return {
        signIntoDatabase(idToken: string, accessToken: string) {
            return signInWithCredential(
                getAuth(),
                GoogleAuthProvider.credential(idToken, accessToken)
            );
        },
        signOutOfDatabase() {
            return signOut(getAuth());
        },
        saveData(path: string, data: string | object) {
            return set(getRef(path), data);
        },
        subscribeToData(path: string, callback: Function) {
            const reference = getRef(path);
            const handler = (snapshot: DataSnapshot) => callback(snapshot.val() || undefined);

            onValue(reference, handler);

            return () => off(reference, 'value', handler);
        }
    };
}
