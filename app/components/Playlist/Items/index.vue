<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: PlaylistItem[] }>();

const { queueItem } = usePlayerStore();

const { mutate: removePlaylistItem } = useRemovePlaylistItem();

const itemToBeSaved = ref<PlaylistItem | null>(null);
const itemToBeRemoved = ref<PlaylistItem | null>(null);
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="(playlistItem, index) of items">
                <PlaylistItemsItem
                    :index="index + 1"
                    v-bind="playlistItem"
                    @queue="queueItem(playlistItem)"
                    @save="itemToBeSaved = playlistItem"
                    @remove="itemToBeRemoved = playlistItem"
                />
            </li>
        </ul>
    </ScrollContainer>

    <PlaylistSelectorModal
        v-if="itemToBeSaved"
        :video-id="itemToBeSaved.id"
        @saved="itemToBeSaved = null"
    />

    <Prompt
        :is-open="!!itemToBeRemoved"
        :title="`Remove playlist item &quot;${itemToBeRemoved?.title}&quot; ?`"
        confirm-text="Remove"
        @confirm="itemToBeRemoved && removePlaylistItem(itemToBeRemoved)"
    />
</template>
