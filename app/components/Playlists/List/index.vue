<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: Playlist[] }>();

const { queuePlaylist } = usePlayerStore();

const { mutate: removePlaylist } = useRemovePlaylist();

const selectedPlaylist = ref<Playlist | null>(null);

function handleRemovePlaylist() {
    if (selectedPlaylist.value) removePlaylist({ playlistId: selectedPlaylist.value.id });
}
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="playlist of items">
                <PlaylistsListItem
                    v-bind="playlist"
                    @queue="queuePlaylist(playlist.id)"
                    @save="selectedPlaylist = playlist"
                />
            </li>
        </ul>
    </ScrollContainer>

    <Prompt
        :is-open="!!selectedPlaylist"
        :title="`Remove playlist &quot;${selectedPlaylist?.title}&quot; ?`"
        confirm-text="Remove"
        @confirm="handleRemovePlaylist"
    />
</template>
