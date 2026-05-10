<script setup lang="ts">
const props = defineProps<{ text?: string }>();

const content = computed(() => (props.text ? wrapURLs(props.text) : ''));
</script>

<template>
    <div class="whitespace-pre-wrap break-all [&_a]:text-primary" v-if="content" v-html="content" />
</template>
