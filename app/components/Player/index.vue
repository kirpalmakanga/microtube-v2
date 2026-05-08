<script setup lang="ts">
import { onKeyStroke, useFullscreen } from '@vueuse/core';
import { type YouTubePlayerInstance, type YoutubePlayerOptions } from '~/services/youtube-player';

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
    currentTime: number;
}

function getInitialPlayerState(): PlayerState {
    return {
        isPlaying: false,
        isBuffering: false,
        isMuted: false,
        isQueueVisible: false,
        isScreenVisible: false,
        isDescriptionVisible: false,
        volume: 100,
        currentTime: 0
    };
}

const state = reactive<PlayerState>(getInitialPlayerState());

const youtubePlayer = useTemplateRef<YouTubePlayerInstance>('youtubePlayer');

let youtubeVolume = ref<number>(100);

let currentTimeWatcher: ReturnType<typeof setInterval> | null = null;

const playerOptions: YoutubePlayerOptions = {
    playerVars: {
        modestbranding: 1,
        iv_load_policy: 3,
        controls: 0,
        autoplay: 1
    }
};

function isSingleVideo() {
    return !!video.value?.id;
}

function togglePlay() {
    if (currentVideo.value?.id) {
        Object.assign(state, {
            isPlaying: !state.isPlaying,
            isBuffering: false
        });
    }
}

function setVolume(volume: number) {
    state.volume = volume;

    youtubePlayer.value?.setVolume(state.volume);
}

function toggleMute() {
    state.isMuted = !state.isMuted;

    if (state.isMuted) {
        youtubeVolume.value = state.volume;

        setVolume(0);
    } else {
        setVolume(youtubeVolume.value);
    }
}

function toggleScreen() {
    const isScreenVisible = !state.isScreenVisible;

    Object.assign(state, {
        isScreenVisible,
        ...(isScreenVisible ? { isQueueVisible: false, isDescriptionVisible: false } : {})
    });
}

function fetchCurrentTime() {
    state.currentTime = youtubePlayer.value?.getCurrentTime() || 0;
}

function handleSeeking(currentTime: number) {
    state.currentTime = currentTime;

    youtubePlayer.value?.seekTo(currentTime, true);
}

function handleBuffering() {
    state.isBuffering = true;
}

function handleVideoEnd() {
    if (!isSingleVideo()) {
        moveInQueue(1);
    }
}

function handleWheelVolume({ deltaY }: WheelEvent) {
    const newVolume = state.volume + (deltaY < 0 ? 5 : -5);
    const inRange = newVolume >= 0 && newVolume <= 100;

    if (inRange) {
        setVolume(newVolume);
    }
}

onKeyStroke('m', toggleMute);
onKeyStroke('s', toggleScreen);
onKeyStroke(' ', togglePlay);

watch(
    () => state.isPlaying,
    () => {
        if (state.isPlaying && youtubePlayer.value) {
            currentTimeWatcher = setInterval(fetchCurrentTime, 200);
        } else if (currentTimeWatcher) {
            clearInterval(currentTimeWatcher);

            currentTimeWatcher = null;
        }
    }
);

watch(
    () => currentVideo.value?.id,
    () => {
        if (!currentVideo.value?.id) {
            Object.assign(state, getInitialPlayerState());
        }
    }
);
</script>

<template>
    <div class="flex flex-col justify-end bg-elevated/70 overflow-hidden" ref="playerWrapper">
        <YoutubePlayer
            v-if="currentVideo"
            ref="youtubePlayer"
            class="fixed left-0 right-0 transition-opacity z-51"
            :class="{
                'top-16 bottom-34': !isFullscreen,
                'top-0 bottom-0': isFullscreen,
                invisible: !state.isScreenVisible,
                visible: state.isScreenVisible
            }"
            :videoId="currentVideo.id"
            :options="playerOptions"
            v-model:playing="state.isPlaying"
            @buffering="handleBuffering"
            @ended="handleVideoEnd"
            @click="togglePlay"
        />

        <div class="flex flex-col gap-4 px-6 py-4 h-34 bg-elevated shadow z-52 overflow-hidden">
            <p class="ellipsis">{{ currentVideo?.title }}</p>

            <div class="flex items-center gap-4">
                <PlayerSeekbar
                    :position="state.currentTime"
                    :duration="currentVideo?.duration || 0"
                    @update="handleSeeking"
                />
            </div>

            <div class="flex">
                <div class="flex items-center gap-2">
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

                    <span class="class flex gap-1 text-sm leading-none">
                        <span>{{ formatTime(state.currentTime) }}</span>

                        <span>/</span>
                        <span>{{ formatTime(currentVideo?.duration || 0) }}</span>
                    </span>
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
    </div>
</template>
