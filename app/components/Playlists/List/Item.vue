<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const emit = defineEmits<{ queue: [e: void]; remove: [e: void] }>();

const props = defineProps<{
    id: string;
    title: string;
    thumbnails: Thumbnails;
    itemCount: number;
    canBeRemoved?: boolean;
}>();

const copy = useCopy();

const menuOptions = computed<ContextMenuItem[]>(() => [
    ...(props.itemCount
        ? [
              {
                  label: 'Add to queue',
                  icon: 'i-mdi-plus-circle',
                  onSelect: () => props.itemCount && emit('queue')
              }
          ]
        : []),
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
                copy(url, 'Link copied to clipboard.');
            }
        }
    },
    ...(props.canBeRemoved
        ? ([
              { type: 'separator' },
              {
                  label: 'Delete',
                  icon: 'i-mdi-delete-forever',
                  color: 'error',
                  onSelect: () => emit('remove')
              }
          ] as ContextMenuItem[])
        : [])
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
            <h2 class="font-bold ellipsis">{{ title }}</h2>
        </template>
    </ListItem>
</template>
