<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';

const props = withDefaults(
    defineProps<{
        isOpen?: boolean;
        title: string;
        cancelText?: string;
        cancelColor?: ButtonProps['color'];
        confirmText?: string;
        confirmColor?: ButtonProps['color'];
    }>(),
    {
        cancelText: 'Cancel',
        cancelColor: 'error',
        confirmText: 'Confirm',
        confirmColor: 'neutral'
    }
);

const emit = defineEmits<{ confirm: [e: void] }>();

const isOpen = defineModel<boolean>('isOpen');

function handleConfirm() {
    isOpen.value = false;

    emit('confirm');
}

watch(
    () => props.isOpen,
    () => (isOpen.value = props.isOpen)
);
</script>

<template>
    <UModal :title="title" v-model:open="isOpen">
        <slot />

        <template #footer>
            <div class="flex grow gap-2 justify-end">
                <UButton :color="cancelColor" :label="cancelText" @click="isOpen = false" />

                <UButton :color="confirmColor" :label="confirmText" @click="handleConfirm" />
            </div>
        </template>
    </UModal>
</template>
