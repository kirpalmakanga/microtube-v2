<script setup lang="ts" generic="T extends unknown">
import type { ScrollAreaVirtualizeOptions } from '@nuxt/ui';
import { useInfiniteScroll } from '@vueuse/core';

const emit = defineEmits<{ 'load-more': [e: void] }>();

const props = withDefaults(
    defineProps<{ items: T[]; itemKey?: string; emptyMessage?: string; isLoading?: boolean }>(),
    {
        itemKey: 'id'
    }
);

const scrollContainer = useTemplateRef('scrollContainer');

function getItemKey() {
    return props.itemKey;
}

const list = computed(() => [...props.items, ...(props.isLoading ? [null] : [])]);

const virtualizeSettings: ScrollAreaVirtualizeOptions = {
    overscan: 10,
    gap: 16,
    getItemKey
};

useInfiniteScroll(
    computed(() => scrollContainer.value?.$el),
    () => emit('load-more'),
    {
        behavior: 'smooth',
        distance: 300,
        throttle: 100
    }
);
</script>

<template>
    <div v-if="items.length" class="relative flex grow">
        <UScrollArea
            ref="scrollContainer"
            class="absolute inset-0 grow p-4 md:p-6"
            :virtualize="virtualizeSettings"
            :items="list"
            v-slot="{ item, index }"
        >
            <slot v-if="item !== null" name="item" :item="item" :index="index" />
            <slot v-else-if="isLoading && $slots.loader" name="loader" />
        </UScrollArea>
    </div>

    <Placeholder v-else-if="emptyMessage" icon="i-mdi-format-list-bulleted" :text="emptyMessage" />
</template>
