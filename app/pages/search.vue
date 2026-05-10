<script setup lang="ts">
const route = useRoute();

const search = computed(() => {
    const forMine = parseInt(route.query.forMine as string);

    return {
        query: route.query.query as string,
        forMine: isNaN(forMine) ? 0 : forMine
    };
});

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } = useSearch(search);

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { queueItem } = usePlayerStore();

const selectedItem = ref<Video | null>(null);

watch(search, () => refetch());
</script>

<template>
    <div class="flex flex-col grow">
        <SearchResultsLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <List
            v-else-if="items"
            :items="items"
            :empty-message="`Search for &quot;${search.query}&quot; gave no results.`"
            @load-more="hasNextPage && !isLoading && loadNextPage()"
        >
            <template #item="{ item }">
                <SearchResultsItem
                    v-bind="item"
                    @queue="queueItem(item)"
                    @save="selectedItem = item"
                />
            </template>

            <template v-if="isLoading" #loader>
                <SearchResultsLoader />
            </template>
        </List>
    </div>

    <PlaylistSelectorModal
        :is-open="!!selectedItem"
        :video="selectedItem"
        @close="selectedItem = null"
    />
</template>
