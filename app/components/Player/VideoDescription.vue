<script setup lang="ts">
defineProps<{ title: string; text?: string }>();
</script>

<template>
    <USlideover :title="title">
        <slot />

        <template #body>
            <div class="whitespace-pre-wrap" v-if="text" v-html="text" />
        </template>
    </USlideover>
</template>
