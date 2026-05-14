<script setup lang="ts">
import type { FormError, SelectItem } from '@nuxt/ui';

defineEmits<{ submit: [e: void] }>();

const { isScreenVisible } = storeToRefs(usePlayerStore());

const router = useRouter();
const route = useRoute();

export interface SearchFormData {
    query: string;
    forMine: number;
}

const state = reactive<SearchFormData>({
    query: (route.query.query as string) || '',
    forMine: parseInt(route.query.forMine as string) || 0
});

const menuOptions = computed<SelectItem[]>(() => [
    {
        label: 'All videos',
        value: 0
    },
    { label: 'My videos', value: 1 }
]);

function validate(state: Partial<SearchFormData>): FormError[] {
    const errors = [];
    if (!state.query) errors.push({ name: 'query', message: '' });
    return errors;
}

function handleSubmit() {
    isScreenVisible.value = false;

    router.push({
        path: '/search',
        query: state
    });
}
</script>

<template>
    <UForm :validate="validate" :state="state" @submit="handleSubmit">
        <UFieldGroup class="relative overflow-hidden w-full bg-default rounded-md shadow">
            <UInput
                class="w-full"
                placeholder="Search"
                variant="soft"
                size="xl"
                v-model="state.query"
                autofocus
                @keydown.stop
            />

            <USelect variant="soft" :items="menuOptions" v-model="state.forMine" />

            <UButton
                v-if="!isMobile()"
                variant="soft"
                color="neutral"
                icon="i-mdi-search"
                type="submit"
            />
        </UFieldGroup>
    </UForm>
</template>
