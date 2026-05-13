<script setup lang="ts">
const props = defineProps<{ position: number; duration: number }>();

const emit = defineEmits<{ update: [position: number]; start: [e: void]; end: [e: void] }>();

const container = useTemplateRef('container');

const seekingPosition = ref<number>(0);

const progress = computed(() => props.position / props.duration);

const markerPosition = ref<number | null>(null);

function handleMouseMove({ pageX }: MouseEvent) {
    if (container.value) {
        const { left } = container.value.getBoundingClientRect();

        const positionX = pageX - left;

        seekingPosition.value = positionX / container.value.offsetWidth;
        markerPosition.value = positionX;
    }
}

function handleMouseLeave() {
    seekingPosition.value = 0;
    markerPosition.value = null;
}

function handleMouseUp() {
    emit('update', seekingPosition.value * props.duration);
}

function getContainerEvents() {
    if (props.duration) {
        return {
            mousemove: handleMouseMove,
            mouseleave: handleMouseLeave,
            mouseup: handleMouseUp
        };
    }

    return null;
}
</script>

<template>
    <div ref="container" class="relative w-full h-3" v-on="getContainerEvents()">
        <div class="absolute top-0 left-0 right-0 h-full -translate-y-full"></div>

        <div class="relative w-full h-full overflow-hidden rounded-full bg-zinc-100">
            <span
                class="absolute inset-0 bg-zinc-500"
                :style="`transform: translateX(${100 * seekingPosition - 100}%)`"
            />

            <span
                class="absolute inset-0 bg-zinc-600"
                :style="`transform: translateX(${100 * progress - 100}%)`"
            />
        </div>

        <span
            v-if="markerPosition !== null"
            class="absolute left-0 -top-2 bg-gray-900/50 text-xs px-2 py-1 rounded-md shadow pointer-events-none -translate-y-full -translate-x-1/2"
            :style="`transform: translateX(${markerPosition}px)`"
        >
            {{ formatTime(seekingPosition * duration) }}
        </span>
    </div>
</template>
