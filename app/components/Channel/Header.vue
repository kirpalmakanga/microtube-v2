<script setup lang="ts">
const props = defineProps<{
    title: string;
    description: string;
    thumbnails: Thumbnails;
    subscriptionId?: string;
}>();

const route = useRoute();

const channelId = computed<string>(() => route.params.channelId as string);

const { mutate: subscribeToChannel } = useSubscribeToChannel();

const { mutate: unsubscribeFromChannel } = useUnsubscribeFromChannel();

const isUnsubscribePromptOpen = ref<boolean>(false);

function toggleSubscription() {
    if (props.subscriptionId) isUnsubscribePromptOpen.value = true;
    else subscribeToChannel({ channelId: channelId.value });
}
</script>

<template>
    <LayoutPageHeader>
        <template #thumbnail>
            <Img
                class="size-28 rounded-md bg-slate-900 shrink-0"
                :src="getThumbnails(thumbnails, 'medium') || getThumbnails(thumbnails, 'default')"
            />
        </template>

        <template #content>
            <h1 class="text-lg font-bold leading-none ellipsis">{{ title }}</h1>
            <p class="text-sm opacity-70 leading-none ellipsis">
                {{ description }}
            </p>

            <UButton class="self-start justify-self-end" @click="toggleSubscription">
                {{ subscriptionId ? 'Unsubscribe' : 'Subscribe' }}
            </UButton>
        </template>
    </LayoutPageHeader>

    <Prompt
        v-if="subscriptionId"
        :is-open="isUnsubscribePromptOpen"
        :title="`Unsubscribe from channel &quot;${title}&quot; ?`"
        confirm-text="Remove"
        @confirm="unsubscribeFromChannel({ channelId, subscriptionId })"
        @close="isUnsubscribePromptOpen = false"
    />
</template>
