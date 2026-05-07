<script setup lang="ts">
defineEmits<{ close: [e: void] }>();
const props = defineProps<{ isOpen: boolean; video: Video | null }>();

const isOpen = defineModel<boolean>('open');

watch(
    () => props.isOpen,
    () => (isOpen.value = props.isOpen)
);
</script>

<template>
    <UModal
        v-model:open="isOpen"
        :title="video?.title"
        description="Save to playlist"
        @after:leave="$emit('close')"
    >
        <template #body>
            <PlaylistSelector v-if="isOpen && video" :video-id="video.id" @saved="isOpen = false" />
        </template>
    </UModal>
</template>
