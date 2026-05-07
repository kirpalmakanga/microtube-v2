<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const emit = defineEmits<{ queue: [e: void]; remove: [e: void] }>();

const props = defineProps<{
    id: string;
    title: string;
    thumbnails: Thumbnails;
    itemCount: number;
}>();

const copy = useCopy();

const menuOptions = computed<ContextMenuItem[]>(() => [
    {
        label: 'Add to queue',
        icon: 'i-mdi-plus-circle',
        onSelect: () => emit('queue')
    },
    {
        label: 'Share',
        icon: 'i-mdi-share',
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
        :badge="`${itemCount} video${itemCount !== 1 ? 's' : ''}`"
        :menu-options="menuOptions"
        @click="$router.push(`/playlist/${id}`)"
    >
        <template #content>
            <h2 class="font-bold text-light-50 font-montserrat ellipsis">{{ title }}</h2>
        </template>
    </ListItem>
</template>
