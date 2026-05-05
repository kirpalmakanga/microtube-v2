<script setup lang="ts">
const authStore = useAuthStore();
const { isSignedIn } = storeToRefs(authStore);
</script>

<template>
    <LayoutDefaultHeader />

    <UMain class="flex flex-col">
        <div class="flex flex-col grow">
            <NuxtPage />
        </div>

        <Player v-if="isSignedIn" />
    </UMain>
</template>
