import { useIntervalFn } from '@vueuse/core';

interface UseAudioStreamOptions {
    volume?: Ref<number>;
    onEnded?: () => void;
}

interface UseAudioStreamReturn {
    currentTime: Ref<number>;
    duration: Ref<number>;
    isPlaying: Ref<boolean>;
    isReady: Ref<boolean>;
    isMuted: Ref<boolean>;
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    toggleMute: () => void;
}

interface AudioState {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isReady: boolean;
    isMuted: boolean;
}

function getDefaultState(): AudioState {
    return {
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        isReady: false,
        isMuted: false
    };
}

export function useAudioStream(
    videoId: MaybeRef<string | null>,
    options?: UseAudioStreamOptions
): UseAudioStreamReturn {
    let audio: HTMLAudioElement | null = null;

    const state = reactive<AudioState>(getDefaultState());

    function setVolume() {
        if (audio && options?.volume) audio.volume = options.volume.value;
    }

    function fetchPlaybackState() {
        if (audio) state.isPlaying = !audio.paused;
    }

    function setEvents() {
        if (audio) {
            Object.assign(audio, {
                ondurationchange: () => {
                    if (audio) {
                        state.duration = audio.duration;
                    }
                },
                onended: () => {
                    options?.onEnded?.();
                },
                onpause: fetchPlaybackState,
                onplay: fetchPlaybackState,
                onerror: (error) => {
                    console.error(error);
                }
            });
        }
    }

    function setSource() {
        const _videoId = toValue(videoId);

        if (audio && _videoId) {
            audio.src = `/api/stream?videoId=${_videoId}`;
        }
    }

    function init() {
        audio = new Audio();

        setEvents();
        setVolume();
    }

    function cleanup() {
        audio?.pause();

        Object.assign(state, getDefaultState());
    }

    function fetchCurrentTime() {
        if (audio) state.currentTime = audio.currentTime;
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
        () => toValue(videoId),
        () => {
            if (audio) setSource();
            else init();
        },
        { immediate: true }
    );

    watch(
        () => options?.volume,
        () => setVolume()
    );

    onUnmounted(cleanup);

    return {
        ...toRefs(state),
        isReady: computed(() => !!audio),
        play: async () => {
            await audio?.play();
        },
        pause: () => {
            audio?.pause();
        },
        seek: (time: number) => {
            audio?.fastSeek(time);
        },
        toggleMute: () => {
            if (audio) {
                audio.muted = !audio.muted;

                state.isMuted = audio.muted;
            }
        }
    };
}
