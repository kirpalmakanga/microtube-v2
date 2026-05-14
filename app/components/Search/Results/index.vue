<script setup lang="ts">
const props = defineProps<{ query: string; forMine: number }>();

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = useSearch(
    computed(() => ({
        query: props.query,
        forMine: props.forMine
    }))
);

const clearSearchResults = useClearSearchResults();

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { queueItem } = usePlayerStore();

const selectedItem = ref<Video | null>(null);

watch(
    () => [props.query, props.forMine],
    () => {
        // clearSearchResults();

        refetch();
    }
);
</script>

<template>
    <SearchResultsLoader v-if="isPending || (error && isLoading)" />

    <Error v-else-if="error" @action="refetch()" />

    <List
        v-else-if="items"
        :items="items"
        :is-loading="isLoading"
        :empty-message="`Search for &quot;${query}&quot; gave no results.`"
        @load-more="hasNextPage && !isLoading && loadNextPage()"
    >
        <template #item="{ item }">
            <SearchResultsItem v-bind="item" @queue="queueItem(item)" @save="selectedItem = item" />
        </template>

        <template v-if="isLoading" #loader>
            <SearchResultsLoader />
        </template>
    </List>

    <PlaylistSelectorModal
        :is-open="!!selectedItem"
        :video="selectedItem"
        @close="selectedItem = null"
    />
</template>
