<script setup lang="ts">
const props = defineProps<{ videoId: string }>();

const emit = defineEmits<{ saved: [e: void] }>();

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = usePlaylists();

const playlists = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { mutate: addPlaylistItem } = useAddPlaylistItem();

function handleSelectPlaylist(playlist: Playlist) {
    addPlaylistItem({ videoId: props.videoId, playlist });

    emit('saved');
}
</script>

<template>
    <div class="flex flex-col h-[60vh]">
        <PlaylistSelectorLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <ScrollContainer class="grow" @reached-bottom="hasNextPage && loadNextPage()">
            <ul class="flex flex-col gap-2">
                <li v-for="playlist of playlists" :key="playlist.id">
                    <PlaylistSelectorItem
                        v-bind="playlist"
                        @click="handleSelectPlaylist(playlist)"
                    />
                </li>
            </ul>
        </ScrollContainer>
    </div>
</template>
