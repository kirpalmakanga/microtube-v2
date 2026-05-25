<script setup lang="ts">
import {
    useEventListener,
    useFullscreen,
    useIntervalFn,
    useThrottleFn,
    useTimeout
} from '@vueuse/core';
import { type YoutubePlayerOptions } from '~/services/youtube-player';

const route = useRoute();

const playerStore = usePlayerStore();
const { currentVideo, previousVideo, nextVideo, isSingleVideo, volume } = storeToRefs(playerStore);
const { skipToNext, skipToPrevious, queueItem } = playerStore;

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

interface PlayerState {
    isBuffering: boolean;
    isPlaying: boolean;
    isMuted: boolean;
    isScreenVisible: boolean;
    isQueueVisible: boolean;
    isDescriptionVisible: boolean;
    currentTime: number;
}

function getInitialPlayerState(): PlayerState {
    return {
        isBuffering: false,
        isPlaying: false,
        isMuted: false,
        isScreenVisible: false,
        isQueueVisible: false,
        isDescriptionVisible: false,
        currentTime: 0
    };
}

const state = reactive<PlayerState>(getInitialPlayerState());

const youtubePlayer = useTemplateRef('youtubePlayer');

const isStartup = ref<boolean>(true);

const volumeBeforeMuting = ref<number>(100);

const playerOptions = computed<YoutubePlayerOptions>(() => ({
    playerVars: {
        enablejsapi: 1,
        autoplay: isStartup.value ? 0 : 1,
        controls: 0
    }
}));

function togglePlay() {
    state.isPlaying = !state.isPlaying;
}

function toggleMute() {
    state.isMuted = !state.isMuted;

    if (state.isMuted) {
        volumeBeforeMuting.value = volume.value;

        volume.value = 0;
    } else {
        volume.value = volumeBeforeMuting.value;
    }
}

function toggleScreen() {
    state.isScreenVisible = !state.isScreenVisible;
}

let wasPreviouslyPlaying = false;

function handleStartSeeking() {
    wasPreviouslyPlaying = state.isPlaying;

    if (state.isPlaying) state.isPlaying = false;
}

function handleEndSeeking() {
    youtubePlayer.value?.seekTo(state.currentTime);

    if (wasPreviouslyPlaying) state.isBuffering = true;

    state.isPlaying = wasPreviouslyPlaying;
}

function handleVideoEnd() {
    if (!isSingleVideo.value && nextVideo.value) {
        skipToNext();
    }
}

function handleWheelVolume({ deltaY }: WheelEvent) {
    volume.value = limitNumberWithinRange(volume.value + (deltaY < 0 ? 5 : -5), 0, 100);
}

function getVolumeIcon() {
    if (state.isMuted) return 'i-mdi-volume-off';

    if (volume.value <= 25) return 'i-mdi-volume-low';

    if (volume.value <= 50) return 'i-mdi-volume-medium';

    return 'i-mdi-volume';
}

function fetchCurrentTime() {
    state.currentTime = youtubePlayer.value?.getCurrentTime() || 0;
}

const { pause: pauseTimewatcher, resume: resumeTimeWatcher } = useIntervalFn(
    fetchCurrentTime,
    100,
    {
        immediate: false,
        immediateCallback: true
    }
);

watch(
    () => [state.isPlaying, state.isBuffering],
    () => {
        if (state.isPlaying && !state.isBuffering) {
            resumeTimeWatcher();
        } else if (!state.isPlaying || state.isBuffering) {
            pauseTimewatcher();
        }
    }
);

watch(
    () => currentVideo.value?.id,
    () => {
        Object.assign(state, getInitialPlayerState());
    }
);

defineShortcuts({
    shift_k: togglePlay,
    shift_p: skipToPrevious,
    shift_n: skipToNext,
    m: toggleMute,
    s: toggleScreen,
    f: toggleFullscreen
});

const {
    start: startHideControlsTimer,
    stop: stopHideControlsTimer,
    isPending: areControlsVisible
} = useTimeout(5000, { immediate: false, controls: true });

const startHideControlsTimerThrottled = useThrottleFn(startHideControlsTimer, 100);

watch(
    () => [isFullscreen.value, state.isQueueVisible],
    () => {
        if (isFullscreen.value) {
            startHideControlsTimer();
        } else {
            stopHideControlsTimer();
        }
    }
);

useEventListener(document, 'mouseleave', () => {
    if (isFullscreen.value) {
        stopHideControlsTimer();
    }
});

watch(
    () => route.name,
    () => {
        if (state.isScreenVisible) state.isScreenVisible = false;
    }
);
</script>

<template>
    <div
        class="flex flex-col justify-end bg-elevated/70 group"
        ref="playerWrapper"
        @mousemove="isFullscreen && startHideControlsTimerThrottled()"
        @mouseleave="isFullscreen && stopHideControlsTimer"
    >
        <YoutubePlayer
            v-if="currentVideo"
            ref="youtubePlayer"
            class="fixed left-0 right-0 transition-transform after:content-[''] z-51 after:absolute after:inset-0"
            :class="{
                'top-16 bottom-29': !isFullscreen,
                'top-0 bottom-0': isFullscreen,
                'translate-y-full': !state.isScreenVisible && !isFullscreen && !isSingleVideo
            }"
            :videoId="currentVideo.id"
            :options="playerOptions"
            :volume="volume"
            v-model:playing="state.isPlaying"
            @buffering-start="state.isBuffering = true"
            @buffering-end="state.isBuffering = false"
            @ready="isStartup = false"
            @ended="handleVideoEnd"
            @click="togglePlay"
        />

        <div
            class="relative bg-elevated shadow transition-transform z-52"
            :class="{
                'translate-y-full': isFullscreen && !areControlsVisible && !state.isQueueVisible
            }"
        >
            <div class="absolute left-0 right-0 top-0">
                <PlayerSeekbar
                    v-if="currentVideo"
                    class="grow"
                    :duration="currentVideo.duration"
                    v-model:position="state.currentTime"
                    @start="handleStartSeeking()"
                    @end="handleEndSeeking()"
                />
            </div>

            <div class="ui-container flex flex-col gap-4 px-4 md:px-6 py-4 h-29 overflow-hidden">
                <div class="flex items-center gap-2">
                    <Img
                        v-if="currentVideo"
                        class="h-10 aspect-video rounded-md"
                        :src="getThumbnails(currentVideo.thumbnails, 'default')"
                    />

                    <div class="h-10 grow overflow-hidden">
                        <p class="font-bold ellipsis leading-none shrink-0 mb-1">
                            {{ currentVideo?.title || 'No selected video.' }}
                        </p>
                        <p class="ellipsis leading-none shrink-0">
                            <NuxtLink
                                v-if="currentVideo"
                                class="text-sm opacity-70 hover:opacity-60"
                                :to="`/channel/${currentVideo?.channelId}`"
                                @click="isFullscreen && toggleFullscreen()"
                            >
                                {{ currentVideo?.channelTitle }}
                            </NuxtLink>
                        </p>
                    </div>

                    <div
                        v-if="currentVideo"
                        class="flex items-center gap-1 text-sm leading-none font-mono"
                    >
                        <span class="w-17 text-right">
                            {{ formatTime(state.currentTime) }}
                        </span>
                        <span>/</span>
                        <span>
                            {{ formatTime(currentVideo.duration || 0) }}
                        </span>
                    </div>
                </div>

                <div class="flex">
                    <div class="flex items-center gap-2">
                        <UTooltip
                            :text="state.isPlaying ? 'Pause' : 'Play'"
                            :kbds="['shift', 'k']"
                            :disabled="isMobile()"
                        >
                            <UButton
                                :icon="state.isPlaying ? 'i-mdi-pause' : 'i-mdi-play'"
                                :disabled="!currentVideo"
                                @click="togglePlay"
                            />
                        </UTooltip>

                        <UFieldGroup v-if="!isSingleVideo">
                            <PlayerVideoPreview
                                text="Previous"
                                :kbds="['shift', 'p']"
                                :video="previousVideo"
                            >
                                <UButton
                                    icon="i-mdi-skip-previous"
                                    @click="skipToPrevious"
                                    :disabled="!previousVideo"
                                />
                            </PlayerVideoPreview>
                            <PlayerVideoPreview
                                text="Next"
                                :kbds="['shift', 'n']"
                                :video="nextVideo"
                            >
                                <UButton
                                    icon="i-mdi-skip-next"
                                    @click="skipToNext"
                                    :disabled="!nextVideo"
                                />
                            </PlayerVideoPreview>
                        </UFieldGroup>

                        <div
                            v-if="!isMobile()"
                            class="flex gap-1 overflow-hidden transition-all w-8 z-1"
                            :class="{ 'hover:w-37': !!currentVideo }"
                            @wheel="handleWheelVolume"
                        >
                            <UTooltip text="Mute" :kbds="['m']">
                                <UButton
                                    :icon="getVolumeIcon()"
                                    :disabled="!currentVideo"
                                    @click="toggleMute"
                                />
                            </UTooltip>

                            <USlider
                                v-if="currentVideo"
                                class="w-24 z-0 shrink-0"
                                :min="0"
                                :max="100"
                                v-model="volume"
                            />
                        </div>
                    </div>

                    <div class="grow"></div>

                    <div class="flex gap-2">
                        <PlayerQueue v-if="!isSingleVideo" v-model:is-open="state.isQueueVisible">
                            <UTooltip text="Open queue" :kbds="['q']" :disabled="isMobile()">
                                <UButton icon="i-mdi-view-list" />
                            </UTooltip>
                        </PlayerQueue>

                        <UTooltip
                            v-if="currentVideo && isSingleVideo"
                            text="Add to queue"
                            :disabled="isMobile()"
                            @click="queueItem(currentVideo)"
                        >
                            <UButton icon="i-mdi-plus-circle" />
                        </UTooltip>

                        <template v-if="currentVideo">
                            <PlaylistSelectorModal :video="currentVideo">
                                <UTooltip text="Save to playlist" :disabled="isMobile()">
                                    <UButton icon="i-mdi-bookmark" />
                                </UTooltip>
                            </PlaylistSelectorModal>

                            <PlayerVideoDescription
                                v-if="currentVideo"
                                :title="currentVideo?.title"
                                :text="currentVideo.description"
                            >
                                <UTooltip text="Description" :disabled="isMobile()">
                                    <UButton icon="i-mdi-information" />
                                </UTooltip>
                            </PlayerVideoDescription>

                            <UTooltip
                                v-if="!isSingleVideo"
                                text="Toggle screen"
                                :kbds="['s']"
                                :disabled="isMobile()"
                            >
                                <UButton
                                    v-if="!isFullscreen"
                                    icon="i-mdi-monitor"
                                    @click="toggleScreen"
                                />
                            </UTooltip>

                            <UTooltip
                                :text="isFullscreen ? 'Exit full screen' : 'Full screen'"
                                :kbds="['f']"
                                :disabled="isMobile()"
                            >
                                <UButton
                                    :icon="
                                        isFullscreen ? 'i-mdi-arrow-collapse' : 'i-mdi-arrow-expand'
                                    "
                                    @click="toggleFullscreen"
                                />
                            </UTooltip>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
