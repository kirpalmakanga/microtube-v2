<script setup lang="ts">
const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = usePlaylists();

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { queuePlaylist } = usePlayerStore();

const { mutate: removePlaylist } = useRemovePlaylist();

const itemToRemove = ref<Playlist | null>(null);
</script>

<template>
    <div class="flex flex-col grow">
        <PlaylistsListLoader v-if="isPending || (error && isLoading)" class="p-6" />

        <Error v-else-if="error" @action="refetch()" />

        <List
            v-else-if="items"
            :items="items"
            :is-loading="isLoading"
            empty-message="You haven't created playlists yet."
            @load-more="hasNextPage && !isLoading && loadNextPage()"
        >
            <template #item="{ item }">
                <PlaylistsListItem
                    v-bind="item"
                    :can-be-removed="true"
                    @queue="queuePlaylist(item.id)"
                    @remove="itemToRemove = item"
                />
            </template>

            <template v-if="isLoading" #loader>
                <PlaylistsListLoader />
            </template>
        </List>
    </div>

    <Prompt
        :is-open="!!itemToRemove"
        :title="`Remove playlist &quot;${itemToRemove?.title}&quot; ?`"
        confirm-text="Remove"
        @confirm="itemToRemove && removePlaylist(itemToRemove)"
        @close="itemToRemove = null"
    />
</template>
