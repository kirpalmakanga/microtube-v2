<script setup lang="ts">
const { signIn } = useAuthStore();
const toast = useToast();

const isSigningIn = ref<boolean>(false);

async function handleSignIn() {
    if (isSigningIn.value) return;

    isSigningIn.value = true;

    try {
        await signIn();
    } catch (error) {
        captureError(error);

        await delay(50);

        isSigningIn.value = false;

        toast.add({
            title: 'Signing in failed, please try again.'
        });
    }
}
</script>

<template>
    <Placeholder icon="i-mdi-lock-outline" text="You must be logged in to access this content.">
        <UButton icon="i-mdi-login" :loading="isSigningIn" @click="handleSignIn" type="button">
            Sign in
        </UButton>
    </Placeholder>
</template>
