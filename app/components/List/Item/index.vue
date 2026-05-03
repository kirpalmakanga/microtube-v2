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
        <div
            class="flex items-center w-full bg-gray-900 hover:bg-gray-800 transition-colors no-highlights"
        >
            <div
                v-if="typeof index === 'number'"
                class="text-sm text-center text-light-50 font-montserrat w-10"
            >
                {{ index + 1 }}
            </div>

            <div class="flex grow overflow-hidden p-4 gap-4 cursor-pointer" @click="$emit('click')">
                <ListItemThumbnail
                    :img="
                        getThumbnails(thumbnails, 'medium') || getThumbnails(thumbnails, 'default')
                    "
                    :alt="title"
                    :badge="badge"
                />

                <div class="flex flex-col grow gap-1">
                    <slot name="content" />
                </div>
            </div>

            <UDropdownMenu v-if="menuOptions" :items="menuOptions" :content="menuConfig">
                <button
                    class="flex items-center justify-center transition-colors text-light-50 hover:text-opacity-50 p-2 cursor-pointer"
                    @click.stop=""
                >
                    <UIcon class="size-5" name="i-mdi-dots-vertical" />
                </button>
            </UDropdownMenu>
        </div>
    </UContextMenu>
</template>
