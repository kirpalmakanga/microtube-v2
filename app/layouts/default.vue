<script setup lang="ts">
const authStore = useAuthStore();
const { isSignedIn } = storeToRefs(authStore);
</script>

<template>
    <LayoutDefaultHeader />

    <UMain class="flex flex-col min-h-[calc(100dvh-var(--ui-header-height))]">
        <div class="flex flex-col grow ui-container">
            <NuxtPage />
        </div>

        <Player />
    </UMain>
</template>
