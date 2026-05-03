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
                class="text-sm text-center text-light-50 font-montserrat w-4 whitespace-nowrap mr-4"
            >
                {{ index }}
            </div>

            <div class="flex grow overflow-hidden gap-4">
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
                <UButton
                    class="cursor-pointer"
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
