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

const { queueItem } = usePlayerStore();

const { mutate: removePlaylistItem } = useRemovePlaylistItem();

const itemToBeSaved = ref<PlaylistItem | null>(null);
const itemToBeRemoved = ref<PlaylistItem | null>(null);

useAppTitle(computed(() => playlistData.value?.title || ''));
</script>

<template>
    <div class="flex flex-col grow">
        <PlaylistLoader v-if="isPlaylistPending || (playlistError && isPlaylistLoading)" />

        <Error v-else-if="playlistError" @action="refetchPlaylist()" />

        <PlaylistHeader v-else-if="playlistData" v-bind="playlistData" />

        <PlaylistItemsLoader
            class="p-6"
            v-if="arePlaylistItemsPending || (playlistItemsError && arePlaylistItemsLoading)"
        />

        <Error v-else-if="playlistItemsError" @action="refetchPlaylistItems()" />

        <List v-else-if="items" :items="items" @load-more="hasNextPage && loadNextPage()">
            <template #item="{ item, index }">
                <PlaylistItemsItem
                    :index="index + 1"
                    v-bind="item"
                    @queue="queueItem(item)"
                    @save="itemToBeSaved = item"
                    @remove="itemToBeRemoved = item"
                />
            </template>

            <template #loader>
                <PlaylistItemsLoader v-if="arePlaylistItemsLoading" />
            </template>
        </List>
    </div>

    <PlaylistSelectorModal
        :is-open="!!itemToBeSaved"
        :video="itemToBeSaved"
        @close="itemToBeSaved = null"
    />

    <Prompt
        :is-open="!!itemToBeRemoved"
        :title="`Remove playlist item &quot;${itemToBeRemoved?.title}&quot; ?`"
        confirm-text="Remove"
        @confirm="itemToBeRemoved && removePlaylistItem(itemToBeRemoved)"
        @close="itemToBeRemoved = null"
    />
</template>
