<script setup lang="ts">
const props = defineProps<{ videoId: string }>();

const emit = defineEmits<{ saved: [e: void] }>();

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = usePlaylists();

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { mutate: addPlaylistItem } = useAddPlaylistItem();

function handleSelectPlaylist(playlistId: string) {
    addPlaylistItem({ playlistId, videoId: props.videoId });

    emit('saved');
}
</script>

<template>
    <div class="flex flex-col h-[60vh] gap-4">
        <PlaylistSelectorLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <ScrollContainer class="grow" @reached-bottom="hasNextPage && loadNextPage()">
            <ul class="flex flex-col gap-2">
                <li v-for="{ id, title, thumbnails, itemCount } of items" :key="id">
                    <button
                        class="flex items-center p-2 gap-2 rounded-md hover:bg-elevated transition-colors w-full cursor-pointer overflow-hidden text-left"
                        @click="handleSelectPlaylist(id)"
                    >
                        <Img
                            class="aspect-video h-16 rounded-md"
                            :src="getThumbnails(thumbnails, 'default')"
                        />

                        <span class="font-bold truncate grow ellipsis">
                            {{ title }}
                        </span>

                        <span class="text-xs">
                            {{ itemCount }} item{{ itemCount !== 1 ? 's' : '' }}
                        </span>
                    </button>
                </li>
            </ul>
        </ScrollContainer>
    </div>
</template>
