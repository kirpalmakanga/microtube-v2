<script setup lang="ts">
import { getThumbnails } from '~/utils/helpers';

defineProps<{
    index?: number;
    title: string;
    subtitle?: string;
    subSubtitle?: string;
    badge: string;
    thumbnails: Thumbnails;
}>();
</script>

<template>
    <div
        class="flex items-center w-full bg-gray-900 hover:bg-gray-800 transition-colors no-highlights"
    >
        <div
            v-if="typeof index === 'number'"
            class="text-sm text-center text-light-50 font-montserrat w-10"
        >
            {{ index + 1 }}
        </div>

        <div class="flex flex-grow overflow-hidden p-4 gap-4 cursor-pointer">
            <ListItemThumbnail
                :img="getThumbnails(thumbnails, 'medium') || getThumbnails(thumbnails, 'default')"
                :alt="title"
                :badge="badge"
            />

            <div class="flex flex-col grow gap-1">
                <slot name="content" />
            </div>

            <!-- <ListItemMeta :title="title" :subtitle="subtitle" :subSubtitle="subSubtitle" /> -->
        </div>

        <button
            class="flex items-center justify-center transition-colors text-light-50 hover:text-opacity-50 p-2"
            @click.stop=""
        >
            <UIcon class="size-5" name="i-mdi-dots-vertical" />
        </button>
    </div>
</template>
