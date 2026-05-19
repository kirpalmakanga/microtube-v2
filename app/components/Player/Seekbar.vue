<script setup lang="ts">
import { useEventListener } from '@vueuse/core';

const props = defineProps<{ duration: number }>();

const emit = defineEmits<{ start: [e: void]; end: [e: void] }>();

const container = useTemplateRef('container');
const marker = useTemplateRef('marker');

const position = defineModel<number>('position', { default: 0 });
const isSeeking = defineModel<boolean>('isSeeking', { default: false });

const seekingPosition = ref<number>(0);

const progress = computed<number>(() => position.value / props.duration);

const handlePosition = computed<number>(() => {
    if (!container.value) return 0;

    if (isSeeking.value) return seekingPosition.value * container.value.offsetWidth;

    return container.value.offsetWidth * progress.value;
});

const markerPosition = ref<number | null>(null);

const markerMargin = 12;

function calculateSeekingPosition(mousePositionX: number, containerWidth: number) {
    seekingPosition.value = mousePositionX / containerWidth;

    if (isSeeking.value) position.value = seekingPosition.value * props.duration;
}

function calculateMarkerPosition(mousePositionX: number, containerWidth: number) {
    if (!marker.value) return;

    const { offsetWidth: markerWidth } = marker.value;

    let position = mousePositionX;

    if (mousePositionX + markerWidth / 2 >= containerWidth) {
        position = containerWidth - markerWidth / 2 - markerMargin;
    } else if (mousePositionX - markerWidth / 2 <= 0) {
        position = markerWidth / 2 + markerMargin;
    }

    markerPosition.value = position;
}

function trackMousePosition({ pageX }: MouseEvent) {
    if (!container.value) return;

    const { left } = container.value.getBoundingClientRect();
    const { offsetWidth: containerWidth } = container.value;

    const positionX = pageX - left;

    calculateSeekingPosition(positionX, containerWidth);

    calculateMarkerPosition(positionX, containerWidth);
}

function startSeeking(e: MouseEvent) {
    e.preventDefault();

    isSeeking.value = true;

    trackMousePosition(e);

    emit('start');
}

function stopSeeking() {
    if (isSeeking.value) {
        isSeeking.value = false;

        emit('end');
    }
}

function handleMouseLeave() {
    if (!isSeeking.value) {
        markerPosition.value = null;

        seekingPosition.value = 0;
    }
}

function getContainerEvents() {
    if (props.duration) {
        return {
            mousedown: startSeeking,
            mousemove: trackMousePosition,
            mouseleave: handleMouseLeave
        };
    }

    return {};
}

useEventListener(document, 'mouseup', stopSeeking);
</script>

<template>
    <div
        ref="container"
        class="relative w-full h-1 cursor-pointer"
        v-on="getContainerEvents()"
        draggable="false"
    >
        <div class="absolute top-0 left-0 right-0 h-3 -translate-y-full"></div>

        <div class="relative w-full h-full overflow-hidden bg-zinc-100 pointer-events-none">
            <span
                class="absolute inset-0 bg-zinc-400"
                :style="`transform: translateX(${100 * seekingPosition - 100}%)`"
            />

            <span
                class="absolute inset-0 bg-zinc-600"
                :style="`transform: translateX(${100 * progress - 100}%)`"
            />
        </div>

        <span
            class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3 rounded-full bg-zinc-600 pointer-events-none"
            :style="`transform: translateX(${handlePosition}px)`"
        ></span>

        <span
            ref="marker"
            class="absolute left-0 -top-5 bg-gray-900/50 text-xs px-2 py-1 rounded-md shadow pointer-events-none -translate-y-full -translate-x-1/2 font-mono"
            :class="{ invisible: markerPosition === null && !isSeeking }"
            :style="`transform: translateX(${markerPosition}px)`"
        >
            {{ formatTime(seekingPosition * duration) }}
        </span>
    </div>
</template>
