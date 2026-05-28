<script setup lang="ts">
import type { SortableVirtualizedListOptions } from '~/components/global/SortableVirtualizedList.vue';
const playerStore = usePlayerStore();
const { queue } = storeToRefs(playerStore);
const { isSelectedItem, clearQueue, removeQueueItem, setSelectedItem } = playerStore;

const isOpen = defineModel<boolean>('isOpen', { default: false });
const itemToSave = ref<Video | null>(null);
const isImportFormOpen = ref<boolean>(false);
const isClearingPromptOpen = ref<boolean>(false);

const listOptions: SortableVirtualizedListOptions = {
    sortable: {
        handle: '.handle',
        animation: 150,
        ghostClass: 'invisible',
        watchElement: true
    },
    virtualize: {
        itemHeight: 88,
        overscan: 10
    }
};

defineShortcuts({
    q: () => (isOpen.value = !isOpen.value)
});
</script>

<template>
    <USlideover
        v-model:open="isOpen"
        title="Queue"
        :description="`${queue.length} video${queue.length !== 1 ? 's' : ''}`"
        :ui="{
            content: 'max-w-full md:max-w-2/3 lg:max-w-1/2 xl:max-w-2/5',
            body: 'flex p-0 sm:p-0 scroll-smooth',
            footer: 'justify-end'
        }"
        inset
    >
        <slot />

        <template #body>
            <SortableVirtualizedList
                v-if="queue.length"
                v-model="queue"
                item-class="relative flex bg-elevated/50 group"
                empty-message="No videos in the queue"
                :options="listOptions"
                v-slot="{ item, index }"
            >
                <PlayerQueueItem
                    v-bind="item"
                    class="pl-10"
                    :is-playing="false"
                    :is-selected="isSelectedItem(item.id)"
                    @select="!isSelectedItem(item.id) && setSelectedItem(item.id)"
                    @save="itemToSave = item"
                    @remove="removeQueueItem(item.id)"
                />

                <div
                    class="absolute left-0 top-0 bottom-0 flex shrink-0 items-center justify-center w-10 text-sm group-hover:invisible"
                >
                    {{ index + 1 }}
                </div>

                <div
                    class="handle absolute left-0 top-0 bottom-0 flex shrink-0 items-center justify-center w-10 invisible group-hover:visible cursor-grab"
                >
                    <UIcon class="size-6" name="i-mdi-drag" />
                </div>
            </SortableVirtualizedList>

            <Placeholder v-else icon="i-mdi-format-list-bulleted" text="No videos in the queue" />
        </template>

        <template #footer>
            <UButton icon="i-mdi-plus-box-multiple" @click="isImportFormOpen = true" />
            <UButton icon="i-mdi-notification-clear-all" @click="isClearingPromptOpen = true" />
        </template>
    </USlideover>

    <PlayerQueueImportForm v-model:is-open="isImportFormOpen" />

    <PlaylistSelectorModal :is-open="!!itemToSave" :video="itemToSave" @close="itemToSave = null" />

    <Prompt
        title="Clear the current queue ?"
        v-model:is-open="isClearingPromptOpen"
        @confirm="clearQueue"
    />
</template>
