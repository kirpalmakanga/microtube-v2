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

const itemToReplace = ref<HTMLElement | null>(null);

const sortableOptions: UseSortableOptions = {
    //@ts-ignore
    handle: '.handle',
    animation: 150,
    ghostClass: 'invisible',
    watchElement: true,
    onMove: ({ related }) => {
        itemToReplace.value = related;
    },
    onEnd: ({ item }) => {
        if (item && itemToReplace.value) {
            const oldIndex = Number(item.dataset.index);
            const newIndex = Number(itemToReplace.value.dataset.index);

            moveArrayElement(model, oldIndex, newIndex);

            itemToReplace.value = null;
        }
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
