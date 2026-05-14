import { getAllPlaylistItems, getVideo, getVideosFromIds } from '~/services/youtube';

interface PlayerStoreState {
    isScreenVisible: boolean;
    volume: number;
    video: Video | null;
    queue: Video[];
    selectedItemId: string | null;
}

function getInitialState(): PlayerStoreState {
    return {
        isScreenVisible: false,
        volume: 100,
        video: null,
        queue: [],
        selectedItemId: null
    };
}

export const usePlayerStore = defineStore(
    'player',
    () => {
        const authStore = useAuthStore();
        const { id: userId } = storeToRefs(authStore);

        const { saveData } = useFirebase();

        const toast = useToast();

        const state = reactive<PlayerStoreState>(getInitialState());

        const selectedItemIndex = computed(() =>
            state.queue.findIndex(({ id }) => id === state.selectedItemId)
        );

        const currentUserId = computed(() => (import.meta.env.DEV ? 'dev' : userId.value));
        const queuePath = computed(() => `users/${currentUserId.value}/queue`);
        const selectedItemIdPath = computed(() => `users/${currentUserId.value}/selectedItemId`);

        function saveQueueToDatabase() {
            return saveData(queuePath.value, state.queue);
        }

        async function setSelectedItem(videoId: string | null) {
            state.selectedItemId = videoId;

            await saveData(selectedItemIdPath.value, videoId);
        }

        function isInQueue(videoId: string) {
            return state.queue.find(({ id: queueItemId }) => queueItemId === videoId);
        }

        async function queueItems(items: Video[]) {
            const newItems = items.filter(({ id }) => !isInQueue(id));

            state.queue = [...state.queue, ...newItems];

            toast.add({
                title: `${newItems.length} new item(s) added to queue.`,
                color: 'success'
            });

            await saveQueueToDatabase();

            return items;
        }

        function queueItem(data: Video) {
            return queueItems([data]);
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

                await queueItems(items);
            } catch (error) {
                captureError(error);

                toast.add({ title: 'Error queuing videos.', color: 'error' });
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

                toast.add({ title: 'Error fetching video.', color: 'error' });
            }
        }

        async function queuePlaylist(playlistId: string, play?: boolean) {
            const toastId = `fetch-playlist-${playlistId}`;

            try {
                toast.add({
                    id: toastId,
                    title: 'Fetching playlist items...',
                    color: 'info',
                    icon: 'svg-spinners-90-ring-with-bg',
                    progress: false
                });

                const items = await getAllPlaylistItems(playlistId, (items, totalItems) => {
                    toast.update(toastId, {
                        title: `Fetched ${items.length}/${totalItems} playlist items...`
                    });
                });

                await queueItems(items);

                if (play && items.length) {
                    const [{ id } = {}] = items;

                    if (id) await setSelectedItem(id);
                }
            } catch (error) {
                captureError(error);

                toast.add({ title: 'Error queueing playlist items.', color: 'error' });
            } finally {
                toast.remove(toastId);
            }
        }

        useFirebaseData<Video[]>(queuePath.value, (queue) => {
            if (!isEqual(queue, state.queue)) {
                state.queue = queue || [];
            }
        });

        useFirebaseData<string | null>(selectedItemIdPath, (videoId) => {
            if (videoId !== state.selectedItemId) {
                state.selectedItemId = videoId;
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
            queueItems,
            queueItem,
            queuePlaylist,
            setSelectedItem,
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
