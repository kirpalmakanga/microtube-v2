<script setup lang="ts">
import { useFullscreen, useIntervalFn } from '@vueuse/core';
import { type YoutubePlayerOptions } from '~/services/youtube-player';

const playerStore = usePlayerStore();
const { currentVideo, previousVideo, nextVideo, newItemCount, isSingleVideo } =
    storeToRefs(playerStore);
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

const youtubePlayer = useTemplateRef('youtubePlayer');

const isStartup = ref<boolean>(true);

const youtubeVolume = ref<number>(100);

const playerOptions = computed<YoutubePlayerOptions>(() => ({
    playerVars: {
        enablejsapi: 1,
        autoplay: isStartup.value ? 0 : 1,
        controls: 0
    }
}));

function togglePlay() {
    if (currentVideo.value?.id) {
        Object.assign(state, {
            isPlaying: !state.isPlaying,
            isBuffering: false
        });
    }
}

function goToPreviousTrack() {
    moveInQueue(-1);
}

function goToNextTrack() {
    moveInQueue(1);
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

    youtubePlayer.value?.seekTo(currentTime);
}

function handleBuffering() {
    state.isBuffering = true;
}

function handleVideoEnd() {
    if (!isSingleVideo.value) {
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

function getCurrentThumbnail() {
    if (currentVideo.value) return getThumbnails(currentVideo.value?.thumbnails, 'default');
    return null;
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
        if (!youtubePlayer.value?.isPlayerReady) return;

        if (state.isPlaying) {
            resumeTimeWatcher();
        } else {
            pauseTimewatcher();
        }
    }
);

watch(
    () => currentVideo.value?.id,
    (currentVideoId, previousVideoId) => {
        if (!currentVideoId) {
            Object.assign(state, getInitialPlayerState());
        }

        if (currentVideoId && !previousVideoId) {
            togglePlay();
        }
    }
);

defineShortcuts({
    shift_k: togglePlay,
    shift_p: goToPreviousTrack,
    shift_n: goToNextTrack,
    m: toggleMute,
    s: toggleScreen,
    f: toggleFullscreen
});
</script>

<template>
    <div class="flex flex-col justify-end bg-elevated/70 overflow-hidden group" ref="playerWrapper">
        <YoutubePlayer
            v-if="currentVideo"
            ref="youtubePlayer"
            class="fixed left-0 right-0 z-51 transition-transform after:content-[''] after:absolute after:inset-0"
            :class="{
                'top-16 bottom-37': !isFullscreen,
                'top-0 bottom-0': isFullscreen,
                'translate-y-[150%]': !state.isScreenVisible && !isFullscreen && !isSingleVideo
            }"
            :videoId="currentVideo.id"
            :options="playerOptions"
            v-model:playing="state.isPlaying"
            @ready="isStartup = false"
            @buffering="handleBuffering"
            @ended="handleVideoEnd"
            @click="togglePlay"
        />

        <div
            class="flex flex-col gap-4 px-6 py-4 h-37 bg-elevated shadow z-52 overflow-hidden"
            :class="{
                'translate-y-full group-hover:translate-y-0 transition-transform': isFullscreen
            }"
        >
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
                            @click="togglePlay"
                        />
                    </UTooltip>

                    <UFieldGroup v-if="!isSingleVideo">
                        <UTooltip text="Previous" :kbds="['shift', 'p']">
                            <UButton icon="i-mdi-skip-previous" @click="moveInQueue(-1)" />
                        </UTooltip>
                        <UTooltip text="Next" :kbds="['shift', 'n']">
                            <UButton icon="i-mdi-skip-next" @click="moveInQueue(1)" />
                        </UTooltip>
                    </UFieldGroup>

                    <div
                        class="group flex gap-1 overflow-hidden transition-all w-8 hover:w-37 z-1"
                        @wheel="handleWheelVolume"
                    >
                        <UTooltip text="Mute" :kbds="['m']">
                            <UButton
                                :icon="state.volume > 0 ? 'i-mdi-volume' : 'i-mdi-volume-off'"
                                @click="toggleMute"
                            />
                        </UTooltip>

                        <USlider
                            v-if="!isMobile()"
                            class="w-24 z-0 shrink-0"
                            :min="0"
                            :max="100"
                            v-model="state.volume"
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
                    <PlayerQueue v-if="!isSingleVideo">
                        <div class="relative">
                            <UTooltip text="Open queue" :kbds="['q']">
                                <UButton
                                    icon="i-mdi-view-list"
                                    @click="newItemCount && resetNewItemCount()"
                                />
                            </UTooltip>

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
                                :icon="isFullscreen ? 'i-mdi-arrow-collapse' : 'i-mdi-arrow-expand'"
                                @click="toggleFullscreen"
                            />
                        </UTooltip>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
