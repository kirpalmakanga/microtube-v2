<script setup lang="ts">
const route = useRoute();

const channelId = computed<string>(() => route.params.channelId as string);

const tab = computed<string>(() => route.params.tab as string);

const { data, isPending, isLoading, error, refetch } = useChannel(channelId);

useAppTitle(computed(() => data.value?.title));
</script>

<template>
    <div class="flex flex-col grow">
        <ChannelLoader v-if="isPending || (error && isLoading)" />

        <Error v-else-if="error" @action="refetch()" />

        <template v-else-if="data">
            <ChannelHeader v-bind="data" />

            <ChannelTabs />

            <ChannelVideos v-if="!tab" />

            <ChannelPlaylists v-else-if="tab === 'playlists'" />

            <ChannelInfo class="p-6" v-else-if="tab === 'info'" :text="data.description" />
        </template>
    </div>
</template>
