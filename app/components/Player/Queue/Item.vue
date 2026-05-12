<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const copy = useCopy();

const emit = defineEmits<{ save: [e: void]; select: [e: void]; remove: [e: void] }>();

const props = defineProps<{
    id: string;
    title: string;
    thumbnails: Thumbnails;
    duration: number;
    channelId: string;
    channelTitle: string;
    isSelected: boolean;
    isPlaying: boolean;
}>();

const menuOptions = computed<ContextMenuItem[]>(() => [
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
        label: 'Remove from queue',
        icon: 'i-mdi-delete-forever',
        color: 'error',
        onSelect: () => emit('remove')
    }
]);

const menuConfig = {
    align: 'end',
    side: 'bottom'
} as const;
</script>

<template>
    <UContextMenu :items="menuOptions" :disabled="!menuOptions">
        <div
            class="bg-elevated/50 hover:bg-elevated/25 transition-colors relative flex grow items-center overflow-hidden pl-10 py-2 pr-2"
            :class="{
                'bg-zinc-700 hover:bg-zinc-600': isSelected
            }"
            @click="emit('select')"
        >
            <div class="flex grow gap-4 overflow-hidden">
                <div class="relative flex shrink-0">
                    <Img
                        class="bg-gray-800 h-18 aspect-video rounded-md"
                        :src="
                            getThumbnails(thumbnails, 'medium') ||
                            getThumbnails(thumbnails, 'default')
                        "
                        :alt="title"
                    />

                    <span
                        class="absolute bottom-2 right-2 bg-gray-800/70 font-semibold text-xs rounded px-2 py-1"
                    >
                        {{ formatTime(duration) }}
                    </span>
                </div>

                <div class="flex flex-col grow gap-1 overflow-hidden">
                    <h2 class="font-bold ellipsis">{{ title }}</h2>

                    <h3 class="text-sm opacity-70 hover:opacity-60 ellipsis">
                        <NuxtLink :to="`/channel/${channelId}`" @click.stop>
                            {{ channelTitle }}
                        </NuxtLink>
                    </h3>
                </div>
            </div>

            <UDropdownMenu v-if="menuOptions" :items="menuOptions" :content="menuConfig">
                <UButton
                    class="ml-4"
                    color="neutral"
                    variant="ghost"
                    icon="i-mdi-dots-vertical"
                    size="lg"
                    @click.stop
                />
            </UDropdownMenu>
        </div>
    </UContextMenu>
</template>
