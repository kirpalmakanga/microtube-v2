<script setup lang="ts">
import type { YouTubePlayerInstance, YoutubePlayerOptions } from '~/services/youtube-player';

const playerOptions: YoutubePlayerOptions = {
    playerVars: {
        modestbranding: 1,
        iv_load_policy: 3,
        controls: 0,
        autoplay: 1
    }
};

defineProps<{ videoId?: string }>();

defineEmits<{
    ready: [youtubePlayer: YouTubePlayerInstance];
    buffering: [e: void];
    playing: [e: void];
    paused: [e: void];
    ended: [e: void];
}>();
</script>

<template>
    <div class="flex bg-accented">
        <YoutubePlayer
            v-if="videoId"
            class="relative grow after:content-[''] after:absolute after:inset-0"
            :video-id="videoId"
            :options="playerOptions"
            @ready="$emit('ready', $event)"
            @ended="$emit('ended')"
            @buffering="$emit('buffering')"
            @playing="$emit('playing')"
            @paused="$emit('paused')"
        />
        <Placeholder v-else icon="i-mdi-monitor-off" text="No video." />
    </div>
</template>
