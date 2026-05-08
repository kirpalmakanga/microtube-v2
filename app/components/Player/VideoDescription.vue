<script setup lang="ts">
const props = defineProps<{ title: string; text?: string }>();

const content = computed(() => (props.text ? wrapURLs(props.text) : ''));
</script>

<template>
    <USlideover :title="title" inset>
        <slot />

        <template #body>
            <a href="">hey</a>
            <div
                class="whitespace-pre-wrap break-all [&_a]:text-primary"
                v-if="content"
                v-html="content"
            />
        </template>
    </USlideover>
</template>
