<script setup lang="ts">
const { data, error, isPending, isLoading, hasNextPage, loadNextPage, refetch } =
    useSubscriptions();

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));
</script>

<template>
    <SubscriptionsLoader v-if="isPending || (error && isLoading)" class="p-4 md:p-6" />

    <Error v-else-if="error" @action="refetch()" />

    <List
        v-else-if="items"
        :items="items"
        :is-loading="isLoading"
        empty-message="You haven't subscribed to any channels yet."
        @load-more="hasNextPage && !isLoading && loadNextPage()"
    >
        <template #item="{ item }">
            <SubscriptionsItem v-bind="item" />
        </template>

        <template v-if="isLoading" #loader>
            <SubscriptionsLoader />
        </template>
    </List>
</template>
