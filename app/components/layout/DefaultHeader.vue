<script setup lang="ts">
const authStore = useAuthStore();
const { picture } = storeToRefs(authStore);
</script>

<template>
    <UHeader :toggle="false">
        <template #left>
            <NuxtLink class="flex items-center gap-1" to="/">
                <UIcon class="size-8" name="i-mdi-youtube" />

                <span class="font-bold">MicroTube</span>
            </NuxtLink>
        </template>

        <template #right>
            <SearchForm />

            <UColorModeButton />

            <UButton color="neutral" variant="ghost"><UAvatar :src="picture" /></UButton>
        </template>
    </UHeader>
</template>
