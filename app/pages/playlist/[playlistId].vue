<script setup lang="ts">
const {
    params: { playlistId }
} = useRoute();

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = usePlaylistItems(
    playlistId as string
);

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));
</script>

<template>
    <div class="flex flex-col grow">
        <PlaylistLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <Playlist v-else-if="items" :items="items" @load-more="hasNextPage && loadNextPage()" />
    </div>
</template>
