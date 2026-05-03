<script setup lang="ts">
defineEmits<{ 'load-more': [e: void] }>();

defineProps<{ items: Video[] }>();
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="video of items">
                <SearchResultsItem v-bind="video" />
            </li>
        </ul>
    </ScrollContainer>
</template>
