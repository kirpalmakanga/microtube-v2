<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const emit = defineEmits<{ queue: [e: void]; save: [e: void]; remove: [e: void] }>();

const props = defineProps<{
    id: string;
    title: string;
    description: string;
    thumbnails: Thumbnails;
    duration: number;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    privacyStatus: string;
    playlistId: string;
    playlistItemId: string;
}>();

const copy = useCopy();

const menuOptions = computed<ContextMenuItem[]>(() => [
    {
        label: 'Add to queue',
        icon: 'i-mdi-plus-circle',
        onSelect: () => emit('queue')
    },
    {
        label: 'Save to playlist',
        icon: 'i-mdi-bookmark',
        onSelect: () => emit('save')
    },
    {
        label: 'Share',
        icon: 'i-mdi-share',
        onSelect: () => {
            const url = getVideoURL(props.id);

            if (isMobile()) {
                shareURL({
                    title: props.title,
                    url
                });
            } else {
                copy(url, 'Link copied to clipboard.');
            }
        }
    },
    { type: 'separator' },
    {
        label: 'Delete from this playlist',
        icon: 'i-mdi-delete-forever',
        color: 'error',
        onSelect: () => emit('remove')
    }
]);
</script>

<template>
    <ListItem
        :title="title"
        :thumbnails="thumbnails"
        :badge="formatTime(duration)"
        :menu-options="menuOptions"
        @click="$router.push(`/video/${id}`)"
    >
        <template #content>
            <h2 class="font-bold ellipsis">{{ title }}</h2>

            <p class="text-sm opacity-70 hover:opacity-60 ellipsis">
                <NuxtLink :to="`/channel/${channelId}`" @click.stop>{{ channelTitle }}</NuxtLink>
            </p>

            <p class="text-xs opacity-50 ellipsis">
                {{ formatDate(publishedAt, 'MMMM do yyyy') }}
            </p>
        </template>
    </ListItem>
</template>
