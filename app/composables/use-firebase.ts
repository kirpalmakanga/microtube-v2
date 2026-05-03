import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { getDatabase, ref, set, onValue, off, DataSnapshot } from 'firebase/database';

const getRef = (path: string) => ref(getDatabase(), path);

export function useFirebase() {
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
