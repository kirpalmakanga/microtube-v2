<script setup lang="ts">
defineProps<{ title: string; thumbnails: Thumbnails; itemCount: number }>();
</script>

<template>
    <button
        class="flex items-center p-2 gap-2 rounded-md hover:bg-elevated transition-colors w-full cursor-pointer overflow-hidden text-left"
    >
        <Img
            class="bg-gray-800 aspect-video h-10 rounded-md"
            :src="getThumbnails(thumbnails, 'default')"
        />

        <span class="text-sm font-bold truncate grow ellipsis">
            {{ title }}
        </span>

        <span class="text-xs opacity-50">{{ itemCount }} item{{ itemCount !== 1 ? 's' : '' }}</span>
    </button>
</template>
