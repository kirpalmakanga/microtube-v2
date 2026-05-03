<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: PlaylistItem[] }>();
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="(playlistItem, index) of items">
                <PlaylistItem :index="index + 1" v-bind="playlistItem" />
            </li>
        </ul>
    </ScrollContainer>
</template>
