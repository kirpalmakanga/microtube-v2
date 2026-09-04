<script setup lang="ts">
const props = defineProps<{ title: string; text?: string }>();

const content = computed(() => (props.text ? wrapURLs(props.text) : ''));
</script>

<template>
    <USlideover :title="title" :ui="{ header: 'pr-16 sm:pr-16' }" inset>
        <slot />

        <template #body>
            <div
                class="whitespace-pre-wrap break-all [&_a]:text-primary"
                v-if="content"
                v-html="content"
            />
        </template>
    </USlideover>
</template>
