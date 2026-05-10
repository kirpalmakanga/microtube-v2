<script setup lang="ts">
const route = useRoute();

const channelId = computed<string>(() => route.params.channelId as string);

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } =
    usePlaylists(channelId);

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { queuePlaylist } = usePlayerStore();
</script>

<template>
    <div class="flex flex-col grow">
        <PlaylistsListLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <List
            v-else-if="items"
            :items="items"
            empty-message="This channel doesn't have playlists yet."
            @reached-bottom="hasNextPage && !isLoading && loadNextPage()"
        >
            <template #item="{ item }">
                <PlaylistsListItem v-bind="item" @queue="queuePlaylist(item.id)" />
            </template>

            <template v-if="isLoading" #loader>
                <PlaylistsListLoader />
            </template>
        </List>
    </div>
</template>
