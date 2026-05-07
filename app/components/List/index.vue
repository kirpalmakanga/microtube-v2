<script setup lang="ts" generic="T">
defineProps<{ items: T[] }>();
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="(item, index) of items">
                <slot name="item" :item="item" :index="index" />
            </li>
            <li v-if="$slots.loader">
                <slot name="loader" />
            </li>
        </ul>
    </ScrollContainer>
</template>
