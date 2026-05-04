<script setup lang="ts">
const {
    params: { playlistId }
} = useRoute();

const {
    data: playlistData,
    isPending: isPlaylistPending,
    isLoading: isPlaylistLoading,
    error: playlistError,
    refetch: refetchPlaylist
} = usePlaylist(playlistId as string);

const {
    data: playlistItems,
    isPending: arePlaylistItemsPending,
    isLoading: arePlaylistItemsLoading,
    error: playlistItemsError,
    refetch: refetchPlaylistItems,
    hasNextPage,
    loadNextPage
} = usePlaylistItems(playlistId as string);

const items = computed(() => playlistItems.value?.pages.flatMap(({ items }) => items));

useAppTitle(computed(() => playlistData.value?.title || ''));
</script>

<template>
    <div class="flex flex-col grow">
        <PlaylistLoader v-if="isPlaylistPending || (playlistError && isPlaylistLoading)" />

        <Error v-else-if="playlistError" @action="refetchPlaylistItems()" />

        <PlaylistHeader v-else-if="playlistData" v-bind="playlistData" />

        <PlaylistItemsLoader
            v-if="arePlaylistItemsPending || (playlistItemsError && arePlaylistItemsLoading)"
        />

        <Error v-else-if="playlistItemsError" @action="refetchPlaylistItems()" />

        <PlaylistItems
            v-else-if="items"
            :items="items"
            @load-more="hasNextPage && loadNextPage()"
        />
    </div>
</template>
