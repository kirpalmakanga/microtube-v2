<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: Playlist[] }>();

const { queuePlaylist } = usePlayerStore();

const { mutate: removePlaylist } = useRemovePlaylist();

const selectedItem = ref<Playlist | null>(null);
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="playlist of items">
                <PlaylistsListItem
                    v-bind="playlist"
                    @queue="queuePlaylist(playlist.id)"
                    @save="selectedItem = playlist"
                />
            </li>
        </ul>
    </ScrollContainer>

    <Prompt
        :is-open="!!selectedItem"
        :title="`Remove playlist &quot;${selectedItem?.title}&quot; ?`"
        confirm-text="Remove"
        @confirm="selectedItem && removePlaylist(selectedItem)"
    />
</template>
