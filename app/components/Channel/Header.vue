<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
    thumbnails: Thumbnails;
    subscriptionId?: string;
}>();
</script>

<template>
    <LayoutPageHeader>
        <template #thumbnail>
            <Img
                class="size-28 rounded-md bg-slate-900 shrink-0"
                :src="getThumbnails(thumbnails, 'medium') || getThumbnails(thumbnails, 'default')"
            />
        </template>

        <template #content>
            <h1 class="text-lg font-bold leading-none ellipsis">{{ title }}</h1>
            <p class="text-sm opacity-70 leading-none ellipsis">
                {{ description }}
            </p>
        </template>
    </LayoutPageHeader>
</template>
