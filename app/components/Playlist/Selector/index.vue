<script setup lang="ts">
const props = defineProps<{ video: Video }>();

const emit = defineEmits<{ saved: [e: void] }>();

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = usePlaylists();

const playlists = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { mutate: addPlaylistItem } = useAddPlaylistItem();

function handleSelectPlaylist(playlist: Playlist) {
    addPlaylistItem({ video: props.video, playlist });

    emit('saved');
}
</script>

<template>
    <div class="flex flex-col h-[60vh]">
        <PlaylistSelectorLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <ScrollContainer
            v-else-if="playlists?.length"
            class="grow"
            @reached-bottom="hasNextPage && !isLoading && loadNextPage()"
        >
            <ul class="flex flex-col gap-2">
                <li v-for="playlist of playlists" :key="playlist.id">
                    <PlaylistSelectorItem
                        :playlist="playlist"
                        @click="handleSelectPlaylist(playlist)"
                    />
                </li>
            </ul>
        </ScrollContainer>

        <Placeholder
            v-else
            icon="i-mdi-format-list-bulleted"
            text="You haven't created playlists yet."
        />
    </div>
</template>
