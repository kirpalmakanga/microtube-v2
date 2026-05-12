<script setup lang="ts">
const authStore = useAuthStore();
const { isSignedIn } = storeToRefs(authStore);
</script>

<template>
    <LayoutDefaultHeader />

    <UMain class="flex flex-col">
        <div class="flex flex-col grow w-full max-w-(--ui-container) mx-auto">
            <NuxtPage />
        </div>

        <Player v-if="isSignedIn" />
    </UMain>
</template>
