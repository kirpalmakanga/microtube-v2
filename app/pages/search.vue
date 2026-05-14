<script setup lang="ts">
import type { SearchFormData } from '~/components/Search/Form.vue';

const route = useRoute();

const search = computed(() => {
    const forMine = parseInt(route.query.forMine as string);

    return {
        query: route.query.query as string,
        forMine: isNaN(forMine) ? 0 : forMine
    } as SearchFormData;
});
</script>

<template>
    <div class="flex flex-col grow">
        <div class="p-4 md:p-6 bg-slate-600/80"><SearchForm /></div>

        <template v-if="search.query">
            <SearchResults v-bind="search" />
        </template>
    </div>
</template>
