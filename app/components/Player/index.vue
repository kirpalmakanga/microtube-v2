<script setup lang="ts">
import { onKeyStroke, useFullscreen } from '@vueuse/core';
import { YoutubePlaybackState, type YouTubePlayerInstance } from '~/services/youtube-player';

const playerStore = usePlayerStore();
const { currentVideo, video } = storeToRefs(playerStore);
const { resetNewItemCount, goToNextQueueItem } = playerStore;

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(useTemplateRef('playerWrapper'));

interface PlayerState {
    isPlaying: boolean;
    isBuffering: boolean;
    isMuted: boolean;
    isQueueVisible: boolean;
    isScreenVisible: boolean;
    isDescriptionVisible: boolean;
    volume: number;
}

const getInitialPlayerState = () => ({
    isPlaying: false,
    isBuffering: false,
    isMuted: false,
    isQueueVisible: false,
    isScreenVisible: false,
    isDescriptionVisible: false,
    volume: 100
});

const state = reactive<PlayerState>(getInitialPlayerState());

let isStartup: boolean = true;
let youtube: YouTubePlayerInstance | null;
let youtubeVolume = ref<number>(100);

function isSingleVideo() {
    return !!video.value?.id;
}

function hasCurrentVideo() {
    return !!currentVideo.value?.id;
}

function setVolume(volume: number) {
    state.volume = volume;
}

function toggleMute() {
    state.isMuted = !state.isMuted;
}

function toggleScreen() {
    const isScreenVisible = !state.isScreenVisible;

    Object.assign(state, {
        isScreenVisible,
        ...(isScreenVisible ? { isQueueVisible: false, isDescriptionVisible: false } : {})
    });
}

function toggleQueue() {
    const isQueueVisible = !state.isQueueVisible;

    Object.assign(state, {
        isQueueVisible,
        ...(isQueueVisible ? { isScreenVisible: false, isDescriptionVisible: false } : {})
    });

    if (isQueueVisible) resetNewItemCount();
}

function toggleInfo() {
    const isVisible = !state.isDescriptionVisible;

    Object.assign(state, {
        isDescriptionVisible: isVisible,
        ...(isVisible ? { isScreenVisible: false, isQueueVisible: false } : {})
    });
}

function handlePlay() {
    Object.assign(state, {
        isPlaying: true,
        isBuffering: false
    });
}

function handlePause() {
    Object.assign(state, {
        isPlaying: false,
        isBuffering: false
    });
}

function handleSeeking(currentTime: number) {
    youtube?.seekTo(currentTime, true);

    handlePlay();
}

function handleBuffering() {
    state.isBuffering = true;
}

function handleVideoEnd() {
    if (!isSingleVideo()) {
        goToNextQueueItem();
    }
}

function togglePlay() {
    if (currentVideo.value?.id) {
        Object.assign(state, {
            isPlaying: !state.isPlaying,
            isBuffering: false
        });
    }
}

async function getCurrentTime() {
    if (youtube) {
        return await youtube.getCurrentTime();
    }

    return null;
}

async function getLoadingProgress() {
    if (youtube) {
        return await youtube.getVideoLoadedFraction();
    }

    return null;
}

function handleWheelVolume({ deltaY }: WheelEvent) {
    const newVolume = state.volume + (deltaY < 0 ? 5 : -5);
    const inRange = newVolume >= 0 && newVolume <= 100;

    if (inRange) {
        setVolume(newVolume);
    }
}

function handleYoutubeIframeReady(playerInstance: YouTubePlayerInstance) {
    youtube = playerInstance;
}

function handleYoutubeIframeStateChange(playbackStateId: YoutubePlaybackState) {
    switch (playbackStateId) {
        case YoutubePlaybackState.UNSTARTED:
            // TODO: check if startup is still necessary
            if (!isStartup) {
                handlePlay();
            } else {
                isStartup = false;
            }
            break;
    }
}

onKeyStroke('m', toggleMute);
onKeyStroke('s', toggleScreen);
onKeyStroke(' ', togglePlay);

watch(
    () => state.volume,
    () => youtube?.setVolume(state.volume)
);

watch(
    () => state.isMuted,
    () => {
        if (state.isMuted) {
            youtubeVolume.value = state.volume;

            setVolume(0);
        } else {
            setVolume(youtubeVolume.value);
        }
    }
);

watch(
    () => state.isPlaying,
    () => {
        if (state.isPlaying) youtube?.playVideo();
        else youtube?.pauseVideo();
    }
);

watch(
    () => currentVideo.value?.id,
    () => {
        if (!currentVideo.value?.id) {
            youtube = null;

            Object.assign(state, omit(getInitialPlayerState(), 'isQueueVisible'));
        }
    }
);
</script>

<template>
    <div class="flex flex-col justify-end shadow bg-elevated" ref="playerWrapper">
        <div class="flex px-6 py-4">
            <div class="flex gap-2">
                <UButton :icon="state.isPlaying ? 'i-mdi-pause' : 'i-mdi-play'" />

                <UFieldGroup>
                    <UButton icon="i-mdi-skip-previous" />
                    <UButton icon="i-mdi-skip-next" />
                </UFieldGroup>

                <div
                    class="group flex gap-1 overflow-hidden transition-all w-8 hover:w-37 z-1"
                    @wheel="handleWheelVolume"
                >
                    <UButton
                        :icon="state.volume > 0 ? 'i-mdi-volume' : 'i-mdi-volume-off'"
                        @click="toggleMute"
                    />

                    <USlider
                        v-if="!isMobile()"
                        class="w-24 z-0 shrink-0"
                        :min="0"
                        :max="100"
                        v-model="state.volume"
                    />
                </div>
            </div>

            <div class="grow"></div>

            <div class="flex gap-2">
                <UButton icon="i-mdi-information" />

                <UButton icon="i-mdi-view-list" />

                <UButton icon="i-mdi-monitor" />

                <UButton
                    :icon="isFullscreen ? 'i-mdi-arrow-collapse' : 'i-mdi-arrow-expand'"
                    @click="toggleFullscreen"
                />
            </div>
        </div>
    </div>
</template>
