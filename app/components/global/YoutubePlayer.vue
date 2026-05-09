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
const isPlaying = defineModel<boolean>('playing', { default: false });

const { ENDED, PLAYING, PAUSED, BUFFERING, UNSTARTED } = PLAYBACK_STATES;

function onStateChange({ data }: { [key: string]: any }) {
    switch (data) {
        case UNSTARTED:
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

async function resetPlayer() {
    destroyPlayer();

    createPlayer();
}

async function updateVideo() {
    if (!youtubePlayer.value) return;

    const { videoId, options } = props;

    if (!videoId) {
        youtubePlayer.value.stopVideo();

        return;
    }

    if (options?.playerVars?.autoplay) {
        youtubePlayer.value.loadVideoById({ videoId });
    } else {
        youtubePlayer.value.cueVideoById({ videoId });
    }
}

watch(() => props.videoId, updateVideo);

watch(isPlaying, () => {
    if (isPlaying.value) youtubePlayer.value?.playVideo();
    else youtubePlayer.value?.pauseVideo();
});

onMounted(createPlayer);

onBeforeUnmount(destroyPlayer);

defineExpose(youtubePlayer);
</script>

<template>
    <div>
        <div :id="containerId" class="h-full w-full"></div>
    </div>
</template>
