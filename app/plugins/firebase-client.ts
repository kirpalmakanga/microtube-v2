import { initializeApp } from 'firebase/app';

export default defineNuxtPlugin(() => {
    const {
        public: { firebaseConfig }
    } = useRuntimeConfig();

    initializeApp(firebaseConfig);
});
