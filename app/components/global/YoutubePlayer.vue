<script setup lang="ts">
import {
    createYoutubePlayer,
    PLAYBACK_STATES,
    type YouTubePlayerInstance,
    type YoutubePlayerOptions
} from '~/services/youtube-player';

interface NewOptions {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
}

const props = defineProps<{
    videoId: string;
    options: YoutubePlayerOptions;
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
const internalPlayer = ref<YouTubePlayerInstance | null>(null);
let isStartup: boolean = true;

async function createPlayer() {
    if (internalPlayer.value) {
        captureError(new Error('Youtube: player already initialized'));

        return;
    }

    const { ENDED, PLAYING, PAUSED, BUFFERING, UNSTARTED } = PLAYBACK_STATES;

    try {
        internalPlayer.value = await createYoutubePlayer(containerId, {
            ...props.options,
            videoId: props.videoId,
            events: {
                onReady: () => internalPlayer.value && emit('ready', internalPlayer.value),
                onError: captureError,
                onStateChange({ data }: { [key: string]: any }) {
                    switch (data) {
                        case UNSTARTED:
                            if (!isStartup) {
                                internalPlayer.value?.playVideo();
                            } else {
                                isStartup = false;
                            }

                            emit('unstarted');
                            break;

                        case ENDED:
                            emit('ended');
                            break;

                        case PLAYING:
                            emit('playing');
                            break;

                        case PAUSED:
                            emit('paused');
                            break;

                        case BUFFERING:
                            emit('buffering');
                            break;

                        default:
                            return;
                    }
                }
            }
        });
    } catch (error: unknown) {
        captureError(error);
    }
}

function destroyPlayer() {
    internalPlayer.value?.destroy();
}

async function resetPlayer() {
    destroyPlayer();

    createPlayer();
}

async function updateVideo() {
    if (!internalPlayer.value) return;

    const { videoId, options } = props;

    if (!videoId) {
        internalPlayer.value.stopVideo();

        return;
    }

    const newOpts: NewOptions = { videoId };
    let autoplay = false;

    if ('playerVars' in options) {
        const { playerVars = {} } = options;

        autoplay = playerVars.autoplay === 1;

        if ('start' in playerVars) {
            newOpts.startSeconds = playerVars.start;
        }
        if ('end' in playerVars) {
            newOpts.endSeconds = playerVars.end;
        }
    }

    if (autoplay) {
        internalPlayer.value.loadVideoById(newOpts);
    } else {
        internalPlayer.value.cueVideoById(newOpts);
    }
}

watch(() => props.options, resetPlayer, { deep: true });

watch(() => props.videoId, updateVideo);

onMounted(createPlayer);

onBeforeUnmount(destroyPlayer);
</script>

<template>
    <div>
        <div :id="containerId" class="h-full w-full"></div>
    </div>
</template>
