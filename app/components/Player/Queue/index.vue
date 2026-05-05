<script setup lang="ts">
import { UseSortable } from '@vueuse/integrations/useSortable/component';
const playerStore = usePlayerStore();
const { queue, selectedItemId } = storeToRefs(playerStore);
const { removeQueueItem, setSelectedItem } = playerStore;
const list = shallowRef(queue);
</script>

<template>
    <USlideover
        title="Queue"
        :description="`${queue.length} video${queue.length !== 1 ? 's' : ''}`"
        :ui="{ body: 'flex sm:p-0' }"
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
                        :index="index"
                        :is-playing="false"
                        :is-selected="item.id === selectedItemId"
                        @select="setSelectedItem(item.id)"
                        @remove="removeQueueItem(item.id)"
                    />

                    <div
                        class="absolute left-0 top-0 bottom-0 flex shrink-0 items-center justify-center w-10 text-sm group-hover:invisible"
                    >
                        {{ index }}
                    </div>

                    <div
                        class="handle absolute left-0 top-0 bottom-0 flex shrink-0 items-center justify-center w-10 invisible group-hover:visible cursor-grab"
                    >
                        <UIcon class="size-6" name="i-mdi-drag" />
                    </div>
                </li>
            </UseSortable>
        </template>
    </USlideover>
</template>
