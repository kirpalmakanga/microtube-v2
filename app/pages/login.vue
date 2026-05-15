<script setup lang="ts">
import { getAuthorizationUrl } from '~/services/youtube';
const toast = useToast();

const isSigningIn = ref<boolean>(false);

async function handleSignIn() {
    if (isSigningIn.value) return;

    isSigningIn.value = true;

    try {
        window.location.href = await getAuthorizationUrl();
    } catch (error) {
        captureError(error);

        isSigningIn.value = false;

        toast.add({
            title: 'Signing in failed, please try again.'
        });
    }
}

definePageMeta({
    layout: 'empty'
});
</script>

<template>
    <div class="flex flex-col grow items-center justify-center">
        <div class="flex items-center gap-1 mb-4 md:mb-6">
            <UIcon class="size-14" name="i-mdi-youtube" />
            <h1 class="text-4xl font-bold leading-none">MicroTube</h1>
        </div>

        <UButton icon="i-mdi-login" :loading="isSigningIn" @click="handleSignIn" type="button">
            Sign in
        </UButton>
    </div>
</template>
