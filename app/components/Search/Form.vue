<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui';

const router = useRouter();
const route = useRoute();

const state = reactive<{ query: string; forMine: number }>({
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

watch(
    state,
    debounce(
        () =>
            router.push({
                path: '/search',
                query: state
            }),
        500
    )
);

defineEmits<{ submit: [q: { query: string; forMine: number }] }>();
</script>

<template>
    <UForm>
        <UFieldGroup>
            <UInput variant="soft" v-model="state.query" />

            <USelect variant="soft" :items="menuOptions" v-model="state.forMine" />

            <UButton variant="soft" color="neutral" icon="i-mdi-search" type="submit" />
        </UFieldGroup>
    </UForm>
</template>
