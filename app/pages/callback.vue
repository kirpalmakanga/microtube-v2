<script setup lang="ts">
const { signIn } = useAuthStore();
const router = useRouter();
const route = useRoute();

onMounted(async () => {
    const {
        query: { code }
    } = route;

    try {
        if (!code) throw new Error('Missing authorization code');

        await signIn(code as string);

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
