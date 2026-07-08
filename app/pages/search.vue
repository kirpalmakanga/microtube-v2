<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router';

const query = useRouteQuery('query', '');
const forMine = useRouteQuery('forMine', '0', { transform: Number });
</script>

<template>
    <div class="flex flex-col grow">
        <div class="p-4 md:p-6 bg-slate-600/80">
            <SearchForm />
        </div>

        <SearchResults v-if="query" :query="query" :forMine="forMine" />
    </div>
</template>
