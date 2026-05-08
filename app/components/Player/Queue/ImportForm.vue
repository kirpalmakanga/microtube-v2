<script setup lang="ts">
import type { FormError } from '@nuxt/ui';

const { importVideos } = usePlayerStore();

interface ImportFormData {
    text: string;
}

const formData = reactive<ImportFormData>({ text: '' });
const isLoading = ref<boolean>(false);

const isOpen = defineModel<boolean>('isOpen');

const toast = useToast();

function validate(state: Partial<ImportFormData>): FormError[] {
    const errors = [];
    if (!state.text) errors.push({ name: 'text', message: 'Required' });
    return errors;
}

async function handleSubmit() {
    const lines = splitLines(formData.text).filter(Boolean);

    isLoading.value = true;

    if (lines.length) {
        const videoIds = [...new Set(lines.map(parseVideoId))];

        const chunks = chunk(videoIds, 50);

        try {
            for (const ids of chunks) {
                await importVideos(ids);
            }

            formData.text = '';
            isOpen.value = false;
        } catch (error) {
            captureError(error);

            toast.add({ title: 'An error has occured, please retry.', color: 'error' });
        }
    }

    isLoading.value = false;
}
</script>
<template>
    <UModal
        title="Import videos"
        v-model:open="isOpen"
        :ui="{ footer: 'justify-end' }"
        :close="{ disabled: isLoading }"
        :dismissible="!isLoading"
    >
        <template #body>
            <UForm id="import-form" :state="formData" :validate="validate" @submit="handleSubmit">
                <UFormField name="text" required>
                    <UTextarea
                        class="w-full"
                        placeholder="Links/IDs"
                        :rows="10"
                        v-model="formData.text"
                    />
                </UFormField>
            </UForm>

            <UAlert
                class="mt-6"
                color="info"
                title="Paste IDs links to youtube videos or their, one link per line."
            />
        </template>

        <template #footer>
            <UButton type="submit" form="import-form" :loading="isLoading">
                {{ isLoading ? 'Importing...' : 'Import' }}
            </UButton>
        </template>
    </UModal>
</template>
