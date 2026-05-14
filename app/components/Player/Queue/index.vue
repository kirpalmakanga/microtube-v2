<script setup lang="ts">
import { useSortable, type UseSortableOptions } from '@vueuse/integrations/useSortable';
const playerStore = usePlayerStore();
const { queue, selectedItemId } = storeToRefs(playerStore);
const { isSelectedItem, clearQueue, removeQueueItem, setSelectedItem } = playerStore;

const isOpen = defineModel<boolean>('isOpen', { default: false });
const itemToSave = ref<Video | null>(null);
const isImportFormOpen = ref<boolean>(false);
const isClearingPromptOpen = ref<boolean>(false);

const sortableOptions: UseSortableOptions = {
    //@ts-ignore
    handle: '.handle',
    animation: 150,
    ghostClass: 'invisible',
    watchElement: true
};

const list = useTemplateRef('list');

useSortable(list, queue, sortableOptions);

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
            content: 'md:max-w-2/5',
            body: 'flex p-0 sm:p-0 scroll-smooth',
            footer: 'justify-end'
        }"
        inset
    >
        <slot />

        <template #body>
            <ul ref="list" class="w-full" :options="sortableOptions">
                <li
                    class="relative flex bg-elevated/50 group"
                    v-for="(item, index) of queue"
                    :key="item.id"
                >
                    <PlayerQueueItem
                        v-bind="item"
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
                </li>
            </ul>
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
