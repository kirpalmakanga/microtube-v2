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

const menuConfig = {
    align: 'end',
    side: 'bottom'
} as const;

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

            <div class="flex grow gap-4 overflow-hidden">
                <div class="relative shrink-0">
                    <Img
                        class="bg-gray-800 h-28 aspect-video rounded-md"
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

            <UDropdownMenu v-if="menuOptions" :items="menuOptions" :content="menuConfig">
                <UButton
                    class="ml-4"
                    color="neutral"
                    variant="ghost"
                    icon="i-mdi-dots-vertical"
                    size="lg"
                    @click.stop
                />
            </UDropdownMenu>
        </UCard>
    </UContextMenu>
</template>
