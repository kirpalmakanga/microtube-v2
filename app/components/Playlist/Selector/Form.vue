<script setup lang="ts">
import type { FormError, FormSubmitEvent, SelectMenuItem } from '@nuxt/ui';

interface PlaylisFormData {
    title: string;
    privacyStatus: 'public' | 'unlisted' | 'private';
}

function getInitialState(): PlaylisFormData {
    return {
        title: '',
        privacyStatus: 'private'
    };
}

const { mutate: createPlaylist } = useCreateplaylist();

const formData = reactive<PlaylisFormData>(getInitialState());

const isOpen = defineModel<boolean>('isOpen');

const visibilityOptions: SelectMenuItem[] = [
    { label: 'Public', icon: 'i-mdi-earth', value: 'public' },
    { label: 'Unlisted', icon: 'i-mdi-link-variant', value: 'unlisted' },
    { label: 'Private', icon: 'i-mdi-lock', value: 'private' }
];

function validate(state: Partial<PlaylisFormData>): FormError[] {
    const errors = [];
    if (!state.title) errors.push({ name: 'title', message: 'A title is required' });
    return errors;
}

function close() {
    isOpen.value = false;
}

function reset() {
    Object.assign(formData, getInitialState());
}

function handleSubmit() {
    createPlaylist(formData);

    close();
}
</script>

<template>
    <UModal v-model:open="isOpen" title="New Playlist" @after:leave="reset">
        <slot />

        <template #body>
            <UForm
                id="playlist-form"
                class="flex flex-col gap-4"
                :validate="validate"
                :state="formData"
                @submit="handleSubmit"
            >
                <UFormField label="Title" name="title" required>
                    <UInput
                        class="w-full"
                        variant="soft"
                        placeholder="Choose a title"
                        v-model="formData.title"
                    />
                </UFormField>

                <UFormField label="Visibility" name="privacyStatus">
                    <USelect
                        class="w-full"
                        :items="visibilityOptions"
                        variant="soft"
                        v-model="formData.privacyStatus"
                    />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex gap-2 justify-end">
                <UButton color="error" label="Cancel" @click="close" />
                <UButton type="submit" form="playlist-form" label="Create" />
            </div>
        </template>
    </UModal>
</template>
