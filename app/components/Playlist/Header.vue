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
    <LayoutPageHeader>
        <template #thumbnail>
            <Img
                class="aspect-video h-28 rounded-md bg-slate-900 shrink-0"
                :src="getThumbnails(thumbnails, 'medium') || getThumbnails(thumbnails, 'default')"
            />
        </template>

        <template #content>
            <h1 class="text-lg font-bold leading-none">{{ title }}</h1>
            <p class="text-sm opacity-70 leading-none">
                <NuxtLink :to="`/channel/${channelId}`">{{ channelTitle }}</NuxtLink>
            </p>
            <p class="text-xs opacity-50 leading-none">
                Playlist • {{ `${itemCount} video${itemCount !== 1 ? 's' : ''}` }}
            </p>
        </template>
    </LayoutPageHeader>
</template>
