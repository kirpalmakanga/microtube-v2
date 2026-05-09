<script setup lang="ts">
defineProps<{
    title: string;
    thumbnails: Thumbnails;
    itemCount: number;
    privacyStatus: string;
    channelId: string;
    channelTitle: string;
}>();
</script>

<template>
    <div class="flex bg-elevated/80 p-6 gap-6 shadow">
        <Img
            class="aspect-video h-28 rounded-md"
            :src="getThumbnails(thumbnails, 'medium') || getThumbnails(thumbnails, 'default')"
        />

        <div class="flex flex-col grow gap-2">
            <h1 class="text-lg font-bold leading-none">{{ title }}</h1>
            <p class="text-sm opacity-70 leading-none">
                <NuxtLink :to="`/channel/${channelId}`">{{ channelTitle }}</NuxtLink>
            </p>
            <p class="text-xs opacity-50 leading-none">
                Playlist • {{ `${itemCount} video${itemCount !== 1 ? 's' : ''}` }}
            </p>
        </div>
    </div>
</template>
