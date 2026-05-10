<script setup lang="ts">
const route = useRoute();

const channelId = computed<string>(() => route.params.channelId as string);

const { data, isPending, isLoading, error, refetch, hasNextPage, loadNextPage } =
    useChannelVideos(channelId);

const items = computed(() => data.value?.pages.flatMap(({ items }) => items));

const { queueItem } = usePlayerStore();

const selectedItem = ref<Video | null>(null);

watch(channelId, () => refetch());
</script>

<template>
    <div class="flex flex-col grow">
        <ChannelVideosLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <Placeholder
            v-else-if="items && !items.length"
            icon="i-mdi-format-list-bulleted"
            :text="`This channel doesn't have videos yet.`"
        />

        <List
            v-else-if="items"
            :items="items"
            @load-more="hasNextPage && !isLoading && loadNextPage()"
        >
            <template #item="{ item }">
                <ChannelVideosItem
                    v-bind="item"
                    @queue="queueItem(item)"
                    @save="selectedItem = item"
                />
            </template>

            <template v-if="isLoading" #loader>
                <ChannelVideosLoader />
            </template>
        </List>
    </div>

    <PlaylistSelectorModal
        :is-open="!!selectedItem"
        :video="selectedItem"
        @close="selectedItem = null"
    />
</template>
