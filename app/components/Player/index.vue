<script setup lang="ts">
import {
    useEventListener,
    useFullscreen,
    useIntervalFn,
    useThrottleFn,
    useTimeout
} from '@vueuse/core';
import { type YoutubePlayerOptions } from '~/services/youtube-player';

const playerStore = usePlayerStore();
const { currentVideo, previousVideo, nextVideo, isSingleVideo, isScreenVisible, volume } =
    storeToRefs(playerStore);
const { skipToNext, skipToPrevious } = playerStore;

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

interface PlayerState {
    isPlaying: boolean;
    isMuted: boolean;
    isQueueVisible: boolean;
    isDescriptionVisible: boolean;
    currentTime: number;
}

function getInitialPlayerState(): PlayerState {
    return {
        isPlaying: false,
        isMuted: false,
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
    isScreenVisible.value = !isScreenVisible.value;
}

function handleSeeking(currentTime: number) {
    state.currentTime = currentTime;

    youtubePlayer.value?.seekTo(currentTime);
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
    () => state.isPlaying,
    () => {
        if (state.isPlaying) {
            resumeTimeWatcher();
        } else {
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
</script>

<template>
    <div
        class="flex flex-col justify-end bg-elevated/70 overflow-hidden group"
        ref="playerWrapper"
        @mousemove="isFullscreen && startHideControlsTimerThrottled()"
        @mouseleave="isFullscreen && stopHideControlsTimer"
    >
        <YoutubePlayer
            v-if="currentVideo"
            ref="youtubePlayer"
            class="fixed left-0 right-0 z-51 transition-transform after:content-[''] after:absolute after:inset-0"
            :class="{
                'top-16 bottom-37': !isFullscreen,
                'top-0 bottom-0': isFullscreen,
                'translate-y-[150%]': !isScreenVisible && !isFullscreen && !isSingleVideo
            }"
            :videoId="currentVideo.id"
            :options="playerOptions"
            :volume="volume"
            v-model:playing="state.isPlaying"
            v-model:current-time="state.currentTime"
            @ready="isStartup = false"
            @ended="handleVideoEnd"
            @click="togglePlay"
        />

        <div
            class="bg-elevated shadow z-52 transition-transform"
            :class="{
                'translate-y-full': isFullscreen && !areControlsVisible && !state.isQueueVisible
            }"
        >
            <div class="ui-container flex flex-col gap-4 px-6 py-4 h-37 overflow-hidden4">
                <div class="h-10">
                    <p class="font-bold ellipsis leading-none shrink-0 mb-1">
                        {{ currentVideo?.title || 'No selected video.' }}
                    </p>
                    <p class="ellipsis leading-none shrink-0">
                        <NuxtLink
                            v-if="currentVideo"
                            class="text-sm opacity-70 hover:opacity-60"
                            :to="`/channel/${currentVideo?.channelId}`"
                        >
                            {{ currentVideo?.channelTitle }}
                        </NuxtLink>
                    </p>
                </div>

                <PlayerSeekbar
                    class="shrink-0"
                    :position="state.currentTime"
                    :duration="currentVideo?.duration || 0"
                    @update="handleSeeking"
                />

                <div class="flex">
                    <div class="flex items-center gap-2">
                        <UTooltip :text="state.isPlaying ? 'Pause' : 'Play'" :kbds="['shift', 'k']">
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
                            class="group flex gap-1 overflow-hidden transition-all w-8 z-1"
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
                                v-if="currentVideo && !isMobile()"
                                class="w-24 z-0 shrink-0"
                                :min="0"
                                :max="100"
                                v-model="volume"
                            />
                        </div>

                        <span v-if="currentVideo" class="class flex gap-1 text-sm leading-none">
                            <span>{{ formatTime(state.currentTime) }}</span>

                            <span>/</span>
                            <span>{{ formatTime(currentVideo.duration || 0) }}</span>
                        </span>
                    </div>

                    <div class="grow"></div>

                    <div class="flex gap-2">
                        <PlayerQueue v-if="!isSingleVideo" v-model:is-open="state.isQueueVisible">
                            <UTooltip text="Open queue" :kbds="['q']">
                                <UButton icon="i-mdi-view-list" />
                            </UTooltip>
                        </PlayerQueue>

                        <template v-if="currentVideo">
                            <PlaylistSelectorModal :video="currentVideo">
                                <UTooltip text="Save to playlist">
                                    <UButton icon="i-mdi-bookmark" />
                                </UTooltip>
                            </PlaylistSelectorModal>

                            <PlayerVideoDescription
                                v-if="currentVideo"
                                :title="currentVideo?.title"
                                :text="currentVideo.description"
                            >
                                <UTooltip text="Description">
                                    <UButton icon="i-mdi-information" />
                                </UTooltip>
                            </PlayerVideoDescription>

                            <UTooltip v-if="!isSingleVideo" text="Toggle screen" :kbds="['s']">
                                <UButton
                                    v-if="!isFullscreen"
                                    icon="i-mdi-monitor"
                                    @click="toggleScreen"
                                />
                            </UTooltip>

                            <UTooltip
                                :text="isFullscreen ? 'Exit full screen' : 'Full screen'"
                                :kbds="['f']"
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
