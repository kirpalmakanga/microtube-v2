<script setup lang="ts">
defineProps<{ video?: Video }>();

const isOpen = defineModel<boolean>('open');
</script>

<template>
    <UModal v-model:open="isOpen" :title="video?.title" description="Save to playlist">
        <template #body>
            <PlaylistSelector v-if="isOpen && video" :video-id="video.id" @saved="isOpen = false" />
        </template>
    </UModal>
</template>
