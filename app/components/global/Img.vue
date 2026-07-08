<script setup lang="ts">
import { error } from '#build/ui';

const props = defineProps<{
    src?: string;
    imgClass?: string;
    altText?: string;
}>();

const isLoading = ref<boolean>(true);
const hasError = ref<boolean>(false);

const image = useTemplateRef<HTMLImageElement>('image');

function onLoad() {
    isLoading.value = false;
}

function onError(error: Error) {
    captureError(error);

    hasError.value = true;
    isLoading.value = false;
}
</script>

<template>
    <span class="relative flex overflow-hidden">
        <img
            ref="image"
            class="block transition-opacity object-cover object-center w-full h-full"
            :class="{
                [imgClass || '']: !!imgClass,
                'opacity-0': isLoading || hasError
            }"
            :src="src"
            :alt="altText"
            loading="lazy"
            @load="onLoad"
            @error="onError"
        />

        <Transition name="fade" v-if="!src || isLoading || hasError">
            <span class="absolute inset-0 flex items-center justify-center bg-inherit">
                <UIcon
                    class="size-1/2"
                    :class="{ 'animate-pulse': isLoading }"
                    :name="hasError ? 'i-mdi:image-broken-variant' : 'i-mdi-image'"
                />
            </span>
        </Transition>
    </span>
</template>
