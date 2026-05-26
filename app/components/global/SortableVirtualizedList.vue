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

const sortableOptions: UseSortableOptions = {
    //@ts-ignore
    handle: '.handle',
    animation: 150,
    ghostClass: 'invisible',
    watchElement: true,
    onUpdate: ({ item }) => {
        if (!item) return;

        // TODO: replace item that has been moved

        const oldIndex = Number(item.dataset.index);
        const previousIndex = Number((item.previousElementSibling as HTMLElement)?.dataset.index);
        const nextIndex = Number((item.nextElementSibling as HTMLElement)?.dataset.index);

        let newIndex: number = oldIndex;

        console.log(JSON.stringify({ oldIndex, previousIndex, nextIndex }, null, 2));

        if (!isNaN(previousIndex)) {
            newIndex = previousIndex + 1;
        } else if (!isNaN(nextIndex)) {
            newIndex = nextIndex;
        }

        moveArrayElement(model, oldIndex, newIndex);
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
