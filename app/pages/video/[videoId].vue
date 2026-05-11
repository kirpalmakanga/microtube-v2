<script setup lang="ts">
const route = useRoute();

const { video } = storeToRefs(usePlayerStore());

const { data } = useVideo(route.params.videoId as string);

watch(data, () => {
    if (data.value) {
        video.value = data.value;
    }
});

onBeforeUnmount(() => {
    video.value = null;
});
</script>

<template></template>
