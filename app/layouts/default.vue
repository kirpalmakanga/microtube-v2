<script setup lang="ts">
const authStore = useAuthStore();
const { isSignedIn } = storeToRefs(authStore);
</script>

<template>
    <LayoutDefaultHeader />

    <UMain class="flex">
        <NuxtPage />
    </UMain>

    <!-- <Player v-if="isSignedIn" /> -->
</template>
