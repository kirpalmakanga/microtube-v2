<script setup lang="ts">
const {
    params: { playlistId }
} = useRoute();

const {
    data: playlist,
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

const { queueItem } = usePlayerStore();

const { mutate: removePlaylistItem } = useRemovePlaylistItem();

const itemToSave = ref<PlaylistItem | null>(null);
const itemToRemove = ref<PlaylistItem | null>(null);

useAppTitle(computed(() => playlist.value?.title || ''));
</script>

<template>
    <div class="flex flex-col grow">
        <PlaylistLoader v-if="isPlaylistPending || (playlistError && isPlaylistLoading)" />

        <Error v-else-if="playlistError" @action="refetchPlaylist()" />

        <PlaylistHeader v-else-if="playlist" v-bind="playlist" />

        <PlaylistItemsLoader
            class="p-6"
            v-if="arePlaylistItemsPending || (playlistItemsError && arePlaylistItemsLoading)"
        />

        <Error v-else-if="playlistItemsError" @action="refetchPlaylistItems()" />

        <List
            v-else-if="items"
            :items="items"
            :is-loading="arePlaylistItemsLoading"
            empty-message="No videos in this playlist yet"
            @load-more="hasNextPage && !arePlaylistItemsLoading && loadNextPage()"
        >
            <template #item="{ item, index }">
                <PlaylistItemsItem
                    :index="index + 1"
                    v-bind="item"
                    @queue="queueItem(item)"
                    @save="itemToSave = item"
                    @remove="itemToRemove = item"
                />
            </template>

            <template v-if="arePlaylistItemsLoading" #loader>
                <PlaylistItemsLoader />
            </template>
        </List>
    </div>

    <PlaylistSelectorModal :is-open="!!itemToSave" :video="itemToSave" @close="itemToSave = null" />

    <Prompt
        v-if="playlist"
        :is-open="!!itemToRemove"
        :title="`Remove playlist item &quot;${itemToRemove?.title}&quot; ?`"
        confirm-text="Remove"
        @confirm="itemToRemove && removePlaylistItem({ playlist, video: itemToRemove })"
        @close="itemToRemove = null"
    />
</template>
