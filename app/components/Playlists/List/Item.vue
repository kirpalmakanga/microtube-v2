<script setup lang="ts">
defineProps<{
    index: number;
    id: string;
    title: string;
    thumbnails: Thumbnails;
    itemCount: number;
}>();
</script>

<template>
    <ListItem
        :index="index"
        :title="title"
        :thumbnails="thumbnails"
        :badge="`${itemCount} video${itemCount !== 1 ? 's' : ''}`"
    >
        <template #content>
            <h2 class="font-bold text-light-50 font-montserrat ellipsis">{{ title }}</h2>
        </template>
    </ListItem>
</template>
