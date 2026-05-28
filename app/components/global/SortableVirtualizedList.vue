<script setup lang="ts" generic="T extends unknown">
import { useVirtualList, type UseVerticalVirtualListOptions } from '@vueuse/core';
import {
    useSortable,
    moveArrayElement,
    type UseSortableOptions
} from '@vueuse/integrations/useSortable';

export interface SortableVirtualizedListOptions {
    sortable: Pick<UseSortableOptions, 'handle' | 'animation' | 'ghostClass' | 'watchElement'>;
    virtualize: UseVerticalVirtualListOptions;
}

const props = defineProps<{
    itemClass: string;
    itemKey?: keyof T;
    options: {
        sortable?: Pick<UseSortableOptions, 'handle' | 'animation' | 'ghostClass' | 'watchElement'>;
        virtualize: UseVerticalVirtualListOptions;
    };
}>();

const model = defineModel<T[]>({ default: [] });

const items = computed(() => model.value.map((item, index) => ({ data: item, index })));

const listContainer = useTemplateRef('listContainer');

function getItemIndex(element: HTMLElement) {
    const index = Number(element.dataset.index);

    if (isNaN(index)) {
        throw new Error('Element does not have a valid data-index attribute:');
    }

    return index;
}

function getViewportY(element: HTMLElement) {
    const { top } = element.getBoundingClientRect();

    return top;
}

function getItemHeight(item: HTMLElement) {
    const { itemHeight } = props.options.virtualize;

    if (typeof itemHeight === 'function') return itemHeight(getItemIndex(item));

    return itemHeight;
}

const sortableOptions: UseSortableOptions = {
    onUpdate: (event) => {
        const { item } = event;

        if (!item || !listContainer.value) return;

        const containerY = getViewportY(listContainer.value);
        const itemY = getViewportY(item);

        const oldIndex = getItemIndex(item);

        const newIndex = (itemY - containerY) / getItemHeight(item);

        moveArrayElement(model, oldIndex, newIndex, event);
    },
    ...props.options.sortable
};

function getItemKey(item: T) {
    return props.itemKey && item !== null && typeof item === 'object' ? item[props.itemKey] : item;
}

useSortable(listContainer, model, sortableOptions);

const { list, containerProps, wrapperProps } = useVirtualList(items, props.options.virtualize);
</script>

<template>
    <div v-bind="containerProps">
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
</template>
