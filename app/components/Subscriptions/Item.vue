<script setup lang="ts">
defineProps<{
    id: string;
    title: string;
    thumbnails: Thumbnails;
    subscriptionId?: string;
    totalItemCount?: number;
}>();
</script>

<template>
    <ListItem :title="title" :thumbnails="thumbnails" @click="$router.push(`/channel/${id}`)">
        <template #content>
            <h2 class="font-bold ellipsis">{{ title }}</h2>

            <p class="text-sm opacity-70 text-muted">{{ totalItemCount ?? 0 }} videos</p>
        </template>
    </ListItem>
</template>
