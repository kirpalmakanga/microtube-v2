<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: Playlist[] }>();
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="playlist of items">
                <PlaylistsListItem v-bind="playlist" />
            </li>
        </ul>
    </ScrollContainer>
</template>
