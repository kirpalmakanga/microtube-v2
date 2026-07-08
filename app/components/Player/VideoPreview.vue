<script setup lang="ts">
defineProps<{ text: string; video?: Video; kbds?: string[] }>();
</script>

<template>
    <UTooltip :kbds="kbds" :ui="{ content: 'h-auto p-3' }" :disabled="isMobile() || !video">
        <slot />

        <template v-if="video" #content>
            <div class="flex flex-col gap-2 overflow-hidden w-48">
                <p class="flex items-center text-sm justify-center">
                    <span class="mr-2">{{ text }}</span>
                    <UKbd v-if="kbds">{{ kbds.join(' + ') }}</UKbd>
                </p>
                <Img
                    class="bg-gray-800 w-full aspect-video rounded-md"
                    :src="
                        getThumbnails(video.thumbnails, 'medium') ||
                        getThumbnails(video.thumbnails, 'default')
                    "
                    :alt="video.title"
                />
                <p class="text-sm">{{ video.title }}</p>
            </div>
        </template>
    </UTooltip>
</template>
