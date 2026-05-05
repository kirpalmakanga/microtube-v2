<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const { queueItem } = usePlayerStore();

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
const { mutate } = useRemovePlaylist(props.id);

const menuOptions = computed<ContextMenuItem[]>(() => [
    {
        label: 'Add to queue',
        icon: 'i-mdi-plus-circle-outline',
        onSelect: () => {
            queueItem(
                pick(
                    props,
                    'id',
                    'title',
                    'thumbnails',
                    'duration',
                    'description',
                    'publishedAt',
                    'channelId',
                    'channelTitle',
                    'privacyStatus'
                )
            );
        }
    },
    {
        label: 'Save to playlist',
        icon: 'i-mdi-bookmark-outline'
        // onSelect: () => queuePlaylist(playlistData, false)
    },
    {
        label: 'Share',
        icon: 'i-mdi-share-outline',
        onSelect: () => {
            const url = getPlaylistURL(props.id);

            if (isMobile()) {
                shareURL({
                    title: props.title,
                    url
                });
            } else {
                copy(url);
            }
        }
    },
    { type: 'separator' },
    {
        label: 'Delete from this playlist',
        icon: 'i-mdi-delete-forever-outline',
        color: 'error'
        // onSelect: () => removePlaylist(playlistData)
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
            <h2 class="font-bold font-montserrat ellipsis">{{ title }}</h2>

            <h3 class="text-sm opacity-70 hover:opacity-60 font-montserrat ellipsis">
                <NuxtLink :to="`/channel/${channelId}`" @click.stop>{{ channelTitle }}</NuxtLink>
            </h3>

            <h4 class="text-xs opacity-50 font-montserrat ellipsis">
                {{ formatDate(publishedAt, 'MMMM do yyyy') }}
            </h4>
        </template>
    </ListItem>
</template>
