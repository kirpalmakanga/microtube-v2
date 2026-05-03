<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: Playlist[] }>();
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul>
            <li v-for="(playlist, index) of items">
                <PlaylistsListItem :index="index" v-bind="playlist" />
            </li>
        </ul>
    </ScrollContainer>
</template>
