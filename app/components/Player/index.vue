<script setup lang="ts">
import { onKeyStroke, useFullscreen } from '@vueuse/core';
import { YoutubePlaybackState, type YouTubePlayerInstance } from '~/services/youtube-player';

const playerStore = usePlayerStore();
const { currentVideo, video, newItemCount } = storeToRefs(playerStore);
const { resetNewItemCount, moveInQueue } = playerStore;

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

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
        moveInQueue(1);
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

            Object.assign(state, getInitialPlayerState());
        }
    }
);
</script>

<template>
    <div class="flex flex-col justify-end bg-elevated/70" ref="playerWrapper">
        <PlayerScreen
            class="fixed left-0 right-0 transition-opacity z-51"
            :class="{
                'top-16 bottom-16': !isFullscreen,
                'top-0 bottom-0': isFullscreen,
                invisible: !state.isScreenVisible,
                visible: state.isScreenVisible
            }"
            :videoId="currentVideo?.id"
            @ready="handleYoutubeIframeReady"
            @ended="handleVideoEnd"
            @buffering="handleBuffering"
            @playing="handlePlay"
            @paused="handlePause"
            @click="togglePlay"
        />

        <div class="flex px-6 py-4 h-16 bg-elevated shadow z-52">
            <div class="flex gap-2">
                <UButton
                    :icon="state.isPlaying ? 'i-mdi-pause' : 'i-mdi-play'"
                    @click="togglePlay"
                />

                <UFieldGroup>
                    <UButton icon="i-mdi-skip-previous" @click="moveInQueue(-1)" />
                    <UButton icon="i-mdi-skip-next" @click="moveInQueue(1)" />
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
                <PlayerQueue>
                    <div class="relative">
                        <UButton
                            icon="i-mdi-view-list"
                            @click="newItemCount && resetNewItemCount()"
                        />

                        <UBadge
                            v-if="newItemCount"
                            class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2"
                            color="error"
                            size="sm"
                        >
                            {{ newItemCount }}
                        </UBadge>
                    </div>
                </PlayerQueue>

                <template v-if="currentVideo">
                    <PlaylistSelectorModal :video="currentVideo">
                        <UButton icon="i-mdi-bookmark" />
                    </PlaylistSelectorModal>

                    <PlayerVideoDescription
                        v-if="currentVideo"
                        :title="currentVideo?.title"
                        :text="currentVideo.description"
                    >
                        <UButton icon="i-mdi-information" />
                    </PlayerVideoDescription>

                    <UButton icon="i-mdi-monitor" @click="toggleScreen" />

                    <UButton
                        :icon="isFullscreen ? 'i-mdi-arrow-collapse' : 'i-mdi-arrow-expand'"
                        @click="toggleFullscreen"
                    />
                </template>
            </div>
        </div>
    </div>
</template>
