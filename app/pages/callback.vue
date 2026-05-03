<script setup lang="ts">
import { logIn } from '~/services/youtube';

const router = useRouter();
const route = useRoute();

const { setUser } = useAuthStore();

onMounted(async () => {
    const {
        query: { code }
    } = route;

    if (code) {
        const data = await logIn(code as string);

        setUser(data);
    } else {
        captureError(new Error('Missing authorization code'));
    }
});

definePageMeta({
    layout: 'empty'
});
</script>

<template>
    <Placeholder icon="svg-spinners-90-ring-with-bg" text="Signing in..." />
</template>
