<script setup lang="ts">
defineProps<{
    img: string;
    alt: string;
    badge: string;
}>();
</script>

<template>
    <div class="relative flex bg-red shrink-0">
        <Img class="rounded h-28 aspect-video" :src="img" :alt="alt" />

        <span
            v-if="badge"
            class="absolute bottom-2 right-2 bg-gray-800/70 text-light-50 font-semibold font-montserrat text-xs rounded px-2 py-1"
        >
            {{ badge }}
        </span>
    </div>
</template>
