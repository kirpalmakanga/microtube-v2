<script setup lang="ts">
import { logIn } from '~/services/youtube';

const router = useRouter();
const route = useRoute();

const { setUser } = useAuthStore();

onMounted(async () => {
    const {
        query: { code }
    } = route;

    try {
        if (!code) throw new Error('Missing authorization code');

        const userData = await logIn(code as string);

        setUser(userData);

        router.replace('/');
    } catch (error) {
        captureError(error);
    }
});

definePageMeta({
    layout: 'empty'
});
</script>

<template>
    <Placeholder icon="svg-spinners-90-ring-with-bg" text="Signing in..." />
</template>
