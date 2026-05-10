<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const router = useRouter();
const route = useRoute();

const items: TabsItem[] = [
    { label: 'Videos', value: '' },
    { label: 'Playlists', value: 'playlists' },
    { label: 'Info', value: 'info' }
];

const active = computed<string>({
    get() {
        return route.params.tab as string;
    },
    set(tab) {
        router.push(`/channel/${route.params.channelId}${tab ? `/${tab}` : ''}`);
    }
});
</script>

<template>
    <UTabs v-model="active" :content="false" :items="items" variant="link" />
</template>
