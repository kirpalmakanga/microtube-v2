<script setup lang="ts" generic="T extends unknown">
import { useVirtualList } from '@vueuse/core';
import {
    useSortable,
    moveArrayElement,
    type UseSortableOptions
} from '@vueuse/integrations/useSortable';

const props = defineProps<{
    itemClass: string;
    itemHeight: number;
    itemKey?: keyof T;
    emptyMessage?: string;
}>();

const model = defineModel<T[]>({ default: [] });

const items = computed(() => model.value.map((item, index) => ({ data: item, index })));

let previousItemToReplace: HTMLElement | null = null;
let itemToReplace: HTMLElement | null = null;

function getItemIndex(element: HTMLElement) {
    const index = Number(element.dataset.index);

    if (isNaN(index)) {
        throw new Error('Element does not have a valid data-index attribute:');
    }

    return index;
}

const sortableOptions: UseSortableOptions = {
    handle: '.handle',
    animation: 150,
    ghostClass: 'invisible',
    watchElement: true,
    onMove: ({ related }) => {
        if (related !== itemToReplace) {
            previousItemToReplace = itemToReplace;

            itemToReplace = related;
        } else {
            itemToReplace = previousItemToReplace;
        }
    },
    onEnd: (event) => {
        const { item } = event;

        if (item && itemToReplace) {
            const oldIndex = getItemIndex(item);
            const newIndex = getItemIndex(itemToReplace);

            moveArrayElement(model, oldIndex, newIndex, event);
        }

        itemToReplace = null;
        previousItemToReplace = null;
    }
};

function getItemKey(item: T) {
    return props.itemKey && item !== null && typeof item === 'object' ? item[props.itemKey] : item;
}

useSortable(useTemplateRef('listContainer'), model, sortableOptions);

const { list, containerProps, wrapperProps } = useVirtualList(items, {
    itemHeight: props.itemHeight,
    overscan: 10
});
</script>

<template>
    <div v-if="items.length" v-bind="containerProps">
        <ul ref="listContainer" class="w-full" v-bind="wrapperProps">
            <li
                v-for="{ data: { data, index } } of list"
                :key="getItemKey(data)"
                :class="itemClass"
                :data-index="index"
            >
                <slot :item="data" :index="index" />
            </li>
        </ul>
    </div>

    <Placeholder v-else-if="emptyMessage" icon="i-mdi-format-list-bulleted" :text="emptyMessage" />
</template>
