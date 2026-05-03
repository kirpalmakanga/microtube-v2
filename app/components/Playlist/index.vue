<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: PlaylistItem[] }>();
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul>
            <li v-for="(playlistItem, index) of items">
                <PlaylistItem :index="index" v-bind="playlistItem" />
            </li>
        </ul>
    </ScrollContainer>
</template>
