<script setup lang="ts">
import {
    createYoutubePlayer,
    PLAYBACK_STATES,
    type YouTubePlayerInstance,
    type YoutubePlayerOptions
} from '~/services/youtube-player';

const props = defineProps<{
    videoId: string;
    options?: YoutubePlayerOptions;
}>();

const emit = defineEmits<{
    ready: [youtubePlayer: YouTubePlayerInstance];
    unstarted: [e: void];
    buffering: [e: void];
    playing: [e: void];
    paused: [e: void];
    ended: [e: void];
}>();

const containerId = 'youtube-player';
const youtubePlayer = ref<YouTubePlayerInstance | null>(null);
const isPlayerReady = ref<boolean>(false);
const isPlaying = defineModel<boolean>('playing', { default: false });

let isStartup: boolean = true;

const { ENDED, PLAYING, PAUSED, BUFFERING, UNSTARTED } = PLAYBACK_STATES;

function onStateChange({ data }: { [key: string]: any }) {
    switch (data) {
        case UNSTARTED:
            if (!isStartup) {
                youtubePlayer.value?.playVideo();
            } else {
                isStartup = false;
            }

            emit('unstarted');
            break;

        case ENDED:
            emit('ended');
            break;

        case PLAYING:
            isPlaying.value = true;

            emit('playing');
            break;

        case PAUSED:
            isPlaying.value = false;

            emit('paused');
            break;

        case BUFFERING:
            emit('buffering');
            break;

        default:
            return;
    }
}

function onReady() {
    if (youtubePlayer.value) {
        emit('ready', youtubePlayer.value);

        isPlayerReady.value = true;
    }
}

async function createPlayer() {
    if (youtubePlayer.value) {
        captureError(new Error('Youtube: player already initialized'));

        return;
    }

    try {
        youtubePlayer.value = await createYoutubePlayer(containerId, {
            ...props.options,
            videoId: props.videoId,
            events: {
                onReady,
                onStateChange,
                onError: captureError
            }
        });
    } catch (error: unknown) {
        captureError(error);
    }
}

function destroyPlayer() {
    youtubePlayer.value?.destroy();
}

async function updateVideo() {
    if (!youtubePlayer.value) return;

    const { videoId } = props;

    if (videoId) {
        youtubePlayer.value.loadVideoById({ videoId });

        return;
    }

    youtubePlayer.value.stopVideo();
}

watch(isPlaying, () => {
    if (isPlaying.value) youtubePlayer.value?.playVideo();
    else youtubePlayer.value?.pauseVideo();
});

watch(() => props.videoId, updateVideo);

onMounted(createPlayer);

onBeforeUnmount(destroyPlayer);

export interface YoutubePlayerExposed {
    isPlayerReady: Ref<boolean>;
    setVolume: (volume: number) => void;
    getCurrentTime: () => number | undefined;
    seekTo: (time: number) => void;
}

defineExpose<YoutubePlayerExposed>({
    isPlayerReady,
    setVolume: (volume: number) => {
        youtubePlayer.value?.setVolume(volume);
    },
    getCurrentTime: () => {
        return youtubePlayer.value?.getCurrentTime();
    },
    seekTo: (time: number) => {
        youtubePlayer.value?.seekTo(time, true);
    }
});
</script>

<template>
    <div class="bg-black">
        <div class="h-full w-full">
            <div :id="containerId" class="h-full w-full"></div>
        </div>

        <Transition name="fade">
            <div
                v-if="!isPlayerReady"
                class="bg-inherit absolute inset-0 flex flex-col items-center justify-center gap-2"
            >
                <UIcon class="size-12" name="i-svg-spinners-90-ring-with-bg" />
                <p>Initializing player</p>
            </div>
        </Transition>
    </div>
</template>
