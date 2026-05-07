<script setup lang="ts" generic="T extends unknown">
const props = withDefaults(defineProps<{ items: T[]; itemKey?: string }>(), {
    itemKey: 'id'
});

function itemHasKey(item: T, key: any): key is keyof typeof item {
    return item && typeof item === 'object' && item.hasOwnProperty(key);
}

function getItemKey(item: T) {
    return itemHasKey(item, props.itemKey) ? item[props.itemKey] : item;
}
</script>

<template>
    <ScrollContainer @reached-bottom="$emit('load-more')">
        <ul class="flex flex-col p-6 gap-6">
            <li v-for="(item, index) of items" :key="getItemKey(item)">
                <slot name="item" :item="item" :index="index" />
            </li>
            <li v-if="$slots.loader">
                <slot name="loader" />
            </li>
        </ul>
    </ScrollContainer>
</template>
