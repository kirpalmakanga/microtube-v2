<script setup lang="ts">
const { queueItem } = usePlayerStore();

const selectedItem = ref<Video | null>(null);

defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: Video[] }>();
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="video of items">
                <SearchResultsItem
                    v-bind="video"
                    @queue="queueItem(video)"
                    @save="selectedItem = video"
                />
            </li>
        </ul>
    </ScrollContainer>

    <PlaylistSelectorModal
        :is-open="!!selectedItem"
        :video="selectedItem"
        @close="selectedItem = null"
    />
</template>
