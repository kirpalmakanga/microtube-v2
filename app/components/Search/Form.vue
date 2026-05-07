<script setup lang="ts">
import type { FormError, SelectItem } from '@nuxt/ui';

const router = useRouter();
const route = useRoute();

interface SearchFormData {
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

defineEmits<{ submit: [q: { query: string; forMine: number }] }>();

function validate(state: Partial<SearchFormData>): FormError[] {
    const errors = [];
    if (!state.query) errors.push({ name: 'query', message: '' });
    return errors;
}

function handleSubmit() {
    router.push({
        path: '/search',
        query: state
    });
}
</script>

<template>
    <UForm :validate="validate" :state="state" @submit="handleSubmit">
        <UFieldGroup>
            <UInput placeholder="Search" variant="soft" v-model="state.query" />

            <USelect variant="soft" :items="menuOptions" v-model="state.forMine" />

            <UButton variant="soft" color="neutral" icon="i-mdi-search" type="submit" />
        </UFieldGroup>
    </UForm>
</template>
