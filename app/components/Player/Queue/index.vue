<script setup lang="ts">
import { UseSortable } from '@vueuse/integrations/useSortable/component';
const playerStore = usePlayerStore();
const { queue, selectedItemId } = storeToRefs(playerStore);
const { clearQueue, removeQueueItem, setSelectedItem } = playerStore;
const list = shallowRef(queue);

const itemToSave = ref<Video | null>(null);
const isImportFormOpen = ref<boolean>(false);
const isClearingPromptOpen = ref<boolean>(false);

function isSelected(videoId: string) {
    return videoId === selectedItemId.value;
}
</script>

<template>
    <USlideover
        title="Queue"
        :description="`${queue.length} video${queue.length !== 1 ? 's' : ''}`"
        :ui="{ content: 'max-w-2/5', body: 'flex p-0 sm:p-0', footer: 'justify-end' }"
        inset
    >
        <slot />

        <template #body>
            <UseSortable
                class="w-full"
                v-model="list"
                as="ul"
                :options="{
                    //@ts-ignore
                    handle: '.handle',
                    animation: 150,
                    ghostClass: 'invisible'
                }"
            >
                <li
                    class="relative flex bg-elevated/50 group"
                    v-for="(item, index) of list"
                    :key="item.id"
                >
                    <PlayerQueueItem
                        v-bind="item"
                        :is-playing="false"
                        :is-selected="isSelected(item.id)"
                        @select="!isSelected(item.id) && setSelectedItem(item.id)"
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
            </UseSortable>
        </template>

        <template #footer>
            <UButton icon="i-mdi-plus-box" @click="isImportFormOpen = true" />
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
