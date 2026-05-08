<script setup lang="ts">
defineEmits<{ close: [e: void] }>();
const props = defineProps<{ isOpen?: boolean; video: Video | null }>();

const isOpen = defineModel<boolean>('open');
const isFormOpen = ref<boolean>(false);

function handleOpenForm() {
    isOpen.value = false;
    isFormOpen.value = true;
}

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
        :ui="{ footer: 'justify-center' }"
        @after:leave="$emit('close')"
    >
        <slot />

        <template #body>
            <PlaylistSelector v-if="video" :video-id="video.id" @saved="isOpen = false" />
        </template>

        <template #footer>
            <UButton class="text-center" icon="i-mdi-plus" @click="handleOpenForm">
                New playlist
            </UButton>
        </template>
    </UModal>

    <PlaylistSelectorForm v-model:is-open="isFormOpen" />
</template>
