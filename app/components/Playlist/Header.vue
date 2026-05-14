<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const props = defineProps<{
    id: string;
    title: string;
    thumbnails: Thumbnails;
    itemCount: number;
    privacyStatus: string;
    channelId: string;
    channelTitle: string;
    canBeRemoved?: boolean;
}>();

const emit = defineEmits<{ queue: [e: void]; remove: [e: void] }>();

const router = useRouter();

const copy = useCopy();

const menuOptions = computed<ContextMenuItem[]>(() => [
    ...(props.itemCount
        ? [
              {
                  label: 'Add to queue',
                  icon: 'i-mdi-plus-circle',
                  onSelect: () => {
                      if (props.itemCount) emit('queue');
                  }
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
                  onSelect: () => {
                      emit('remove');
                  }
              }
          ] as ContextMenuItem[])
        : [])
]);
</script>

<template>
    <LayoutPageHeader>
        <template #thumbnail>
            <Img
                class="aspect-video h-14 md:h-28 rounded-md bg-slate-900 shrink-0"
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

        <template #actions>
            <MenuButton :menu-options="menuOptions" />
        </template>
    </LayoutPageHeader>
</template>
