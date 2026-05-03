<script setup lang="ts">
const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = usePlaylists();

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));
</script>

<template>
    <div class="flex flex-col grow">
        <PlaylistsListLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <PlaylistsList
            v-else-if="items"
            :items="items"
            @load-more="hasNextPage && loadNextPage()"
        />
    </div>
</template>
