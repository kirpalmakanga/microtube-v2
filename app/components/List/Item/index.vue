<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';
import { getThumbnails } from '~/utils/helpers';

const props = defineProps<{
    index?: number;
    title: string;
    subtitle?: string;
    subSubtitle?: string;
    badge?: string;
    thumbnails: Thumbnails;
    menuOptions?: ContextMenuItem[];
}>();

defineEmits<{ click: [e: void] }>();
</script>

<template>
    <UContextMenu :items="menuOptions" :disabled="!menuOptions">
        <UCard
            class="hover:bg-elevated/25 transition-colors cursor-pointer"
            variant="soft"
            :ui="{ body: 'flex items-center' }"
            @click="$emit('click')"
        >
            <div
                v-if="typeof index === 'number'"
                class="text-sm text-center whitespace-nowrap w-4 mr-4"
            >
                {{ index }}
            </div>

            <div class="flex max-lg:items-center grow gap-4 overflow-hidden">
                <div class="relative shrink-0">
                    <Img
                        class="bg-gray-800 h-14 md:h-28 aspect-video rounded-md"
                        :src="
                            getThumbnails(thumbnails, 'medium') ||
                            getThumbnails(thumbnails, 'default')
                        "
                        :alt="title"
                    />

                    <span
                        v-if="badge"
                        class="absolute bottom-2 right-2 bg-gray-800/70 font-semibold text-xs rounded px-2 py-1"
                    >
                        {{ badge }}
                    </span>
                </div>

                <div class="flex flex-col grow gap-1 overflow-hidden">
                    <slot name="content" />
                </div>
            </div>

            <div v-if="$slots.actions" class="flex gap-2">
                <slot name="actions" />
            </div>
        </UCard>
    </UContextMenu>
</template>
