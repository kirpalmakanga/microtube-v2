<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const props = defineProps<{
    id: string;
    title: string;
    thumbnails: Thumbnails;
    itemCount: number;
}>();

const copy = useCopy();
const { mutate } = useRemovePlaylist(props.id);

const menuOptions = computed<ContextMenuItem[]>(() => [
    {
        label: 'Add to queue',
        icon: 'i-mdi-plus-circle-outline'
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
        label: 'Delete',
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
        :badge="`${itemCount} video${itemCount !== 1 ? 's' : ''}`"
        :menu-options="menuOptions"
        @click="$router.push(`/playlist/${id}`)"
    >
        <template #content>
            <h2 class="font-bold text-light-50 font-montserrat ellipsis">{{ title }}</h2>
        </template>
    </ListItem>
</template>
