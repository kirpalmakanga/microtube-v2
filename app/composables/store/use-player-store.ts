import type { AvatarProps } from '@nuxt/ui';
import { getAllPlaylistItems, getVideo, getVideosFromIds } from '~/services/youtube';

interface PlayerStoreState {
    volume: number;
    video: Video | null;
    queue: Video[];
    selectedItemId: string | null;
}

function getInitialState(): PlayerStoreState {
    return {
        volume: 100,
        video: null,
        queue: [],
        selectedItemId: null
    };
}

export const usePlayerStore = defineStore(
    'player',
    () => {
        const { saveData } = useFirebase();

        const toast = useToast();

        const state = reactive<PlayerStoreState>(getInitialState());

        const selectedItemIndex = computed(() =>
            state.queue.findIndex(({ id }) => id === state.selectedItemId)
        );

        function saveQueueToDatabase() {
            return saveData('queue', state.queue);
        }

        async function setSelectedItem(videoId: string | null) {
            state.selectedItemId = videoId;

            await saveData('selectedItemId', videoId);
        }

        function isSelectedItem(videoId: string | null) {
            return videoId === state.selectedItemId;
        }

        function isInQueue(videoId: string) {
            return state.queue.find(({ id: queueItemId }) => queueItemId === videoId);
        }

        async function queueItems(items: Video[], notify?: boolean) {
            const newItems = items.filter(({ id }) => !isInQueue(id));

            state.queue = [...state.queue, ...newItems];

            if (notify) {
                toast.add({
                    title: `${newItems.length} new item(s) added to queue.`,
                    icon: 'i-mdi-playlist-check',
                    color: 'success'
                });
            }

            await saveQueueToDatabase();

            return newItems;
        }

        async function queueItem(data: Video) {
            const avatar: AvatarProps = {
                src: getThumbnails(data.thumbnails, 'default'),
                class: 'rounded-md aspect-video w-auto'
            };

            if (isInQueue(data.id)) {
                toast.add({
                    title: 'Already in queue.',
                    icon: 'i-mdi-information',
                    color: 'info'
                });

                return;
            }

            await queueItems([data]);

            toast.add({
                title: `Added to queue.`,
                color: 'success',
                avatar
            });
        }

        async function removeQueueItem(targetId: string) {
            state.queue = state.queue.filter(({ id }) => id !== targetId);

            await saveQueueToDatabase();

            if (targetId === state.selectedItemId) {
                await setSelectedItem(null);
            }
        }

        async function clearQueue() {
            state.queue = state.queue.filter(({ id }) => id === state.selectedItemId);

            await saveQueueToDatabase();
        }

        async function moveInQueue(direction: -1 | 1) {
            const { [selectedItemIndex.value + direction]: selectedItem } = state.queue;

            if (selectedItem) await setSelectedItem(selectedItem.id);
        }

        async function importVideos(ids: string[]) {
            try {
                const items = await getVideosFromIds(ids.filter((id) => !isInQueue(id)));

                await queueItems(items, true);
            } catch (error) {
                captureError(error);

                toast.add({
                    title: 'Could not import videos.',
                    icon: 'i-mdi-close-circle',
                    color: 'error'
                });
            }
        }

        function clearVideo() {
            state.video = null;
        }

        async function fetchVideo(videoId: string) {
            try {
                state.video = await getVideo(videoId);
            } catch (error) {
                captureError(error);

                toast.add({
                    title: 'Could not fetch video.',
                    icon: 'i-mdi-close-circle',
                    color: 'error'
                });
            }
        }

        async function queuePlaylist(playlistId: string, play?: boolean) {
            const toastId = `fetch-playlist-${playlistId}`;

            try {
                toast.add({
                    id: toastId,
                    title: 'Fetching playlist items...',
                    icon: 'svg-spinners-90-ring-with-bg',
                    progress: false
                });

                const items = await getAllPlaylistItems(playlistId, (items, totalItems) => {
                    toast.update(toastId, {
                        title: `Fetched ${items.length}/${totalItems} playlist items...`
                    });
                });

                const newItems = await queueItems(items);

                toast.update(toastId, {
                    title: `${newItems.length} new item(s) added to queue.`,
                    icon: 'i-mdi-playlist-check',
                    color: 'success',
                    progress: true
                });

                if (play && items.length) {
                    const [{ id } = {}] = items;

                    if (id) await setSelectedItem(id);
                }
            } catch (error) {
                captureError(error);

                toast.add({
                    title: 'Could not queue playlist.',
                    icon: 'i-mdi-close-circle',
                    color: 'error'
                });
            } finally {
                toast.remove(toastId);
            }
        }

        useFirebaseData<Video[]>('queue', (queue) => {
            if (!isEqual(queue, state.queue)) {
                state.queue = queue || [];
            }
        });

        useFirebaseData<string | null>('selectedItemId', (selectedId) => {
            if (!isSelectedItem(selectedId)) {
                state.selectedItemId = selectedId;
            }
        });

        return {
            ...toRefs(state),
            currentVideo: computed(() => {
                const { selectedItemId, video, queue } = state;

                return video || queue.find(({ id }) => id === selectedItemId);
            }),
            previousVideo: computed(() => state.queue[selectedItemIndex.value - 1]),
            nextVideo: computed(() => state.queue[selectedItemIndex.value + 1]),
            isSingleVideo: computed(() => !!state.video),
            isInQueue,
            queueItem,
            queuePlaylist,
            setSelectedItem,
            isSelectedItem,
            importVideos,
            removeQueueItem,
            clearQueue,
            clearVideo,
            fetchVideo,
            skipToPrevious: () => moveInQueue(-1),
            skipToNext: () => moveInQueue(1)
        };
    },
    {
        persist: {
            storage: piniaPluginPersistedstate.localStorage(),
            pick: ['volume', 'queue', 'selectedItemId']
        }
    }
);
