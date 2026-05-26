<script setup lang="ts" generic="T extends unknown">
import { useSortable, type UseSortableOptions } from '@vueuse/integrations/useSortable';

const props = defineProps<{
    itemClass: string;
    itemKey?: keyof T;
    emptyMessage?: string;
}>();

const model = defineModel<T[]>({ default: [] });

const sortableOptions: UseSortableOptions = {
    //@ts-ignore
    handle: '.handle',
    animation: 150,
    ghostClass: 'invisible',
    watchElement: true
};

function getItemKey(item: T) {
    return props.itemKey && item !== null && typeof item === 'object' ? item[props.itemKey] : item;
}

useSortable(useTemplateRef('listContainer'), model, sortableOptions);
</script>

<template>
    <ul v-if="model.length" ref="listContainer" class="w-full">
        <li :class="itemClass" v-for="(item, index) of model" :key="getItemKey(item)">
            <slot :item="item" :index="index" />
        </li>
    </ul>

    <Placeholder v-else-if="emptyMessage" icon="i-mdi-format-list-bulleted" :text="emptyMessage" />
</template>
