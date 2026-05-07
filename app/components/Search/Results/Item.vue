<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

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
}>();

const emit = defineEmits<{ queue: [e: void]; save: [e: void] }>();

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
            <h2 class="font-bold text-light-50 font-montserrat ellipsis">{{ title }}</h2>

            <h3 class="text-sm text-light-50 opacity-70 hover:opacity-60 font-montserrat ellipsis">
                <NuxtLink :to="`/channel/${channelId}`" @click.stop>{{ channelTitle }}</NuxtLink>
            </h3>

            <h4 class="text-xs text-light-50 opacity-50 font-montserrat ellipsis">
                {{ formatDate(publishedAt, 'MMMM do yyyy') }}
            </h4>
        </template>
    </ListItem>
</template>
