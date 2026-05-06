<script setup lang="ts">
const { queueItem } = usePlayerStore();

const selectedItem = ref<Video | null>();

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

    <UModal
        :open="!!selectedItem"
        :title="selectedItem?.title"
        description="Save to playlist"
        @close:prevent="selectedItem = null"
    >
        <template #body>
            <PlaylistSelector
                v-if="selectedItem"
                :video-id="selectedItem.id"
                @saved="selectedItem = null"
            />
        </template>
    </UModal>
</template>
