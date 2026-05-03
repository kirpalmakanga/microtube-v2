<script setup lang="ts">
const route = useRoute();

const search = computed(() => {
    const forMine = parseInt(route.query.forMine as string);

    return {
        query: route.query.query as string,
        forMine: isNaN(forMine) ? 0 : forMine
    };
});

const { data, isPending, isLoading, error, refetch, refresh, hasNextPage, loadNextPage } =
    useSearch(search);

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));

watch(search, () => {
    refetch();
});
</script>

<template>
    <div class="flex flex-col grow">
        <SearchResultsLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <SearchResults
            v-else-if="items && items.length"
            :items="items"
            @load-more="hasNextPage && loadNextPage()"
        />

        <Placeholder
            v-else-if="items && !items.length"
            icon="i-mdi-format-list-bulleted"
            :text="`Search for &quot;${search.query}&quot; gave no results.`"
        />
    </div>
</template>
