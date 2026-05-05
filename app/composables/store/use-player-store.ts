import { getVideo, getVideosFromIds } from '~/services/youtube';

interface PlayerState {
    isScreenVisible: boolean;
    volume: number;
    currentTime: number;
    queue: Video[];
    newItemCount: number;
    selectedItemId: string;
    video: Video | null;
}

function getInitialState(): PlayerState {
    return {
        isScreenVisible: false,
        volume: 100,
        newItemCount: 0,
        currentTime: 0,
        queue: [],
        selectedItemId: '',
        video: null
    };
}

export const usePlayerStore = defineStore(
    'player',
    () => {
        console.log('env', import.meta.env);
        const authStore = useAuthStore();
        const { id: userId } = storeToRefs(authStore);

        const { saveData, subscribeToData } = useFirebase();

        const toast = useToast();

        const state = reactive<PlayerState>(getInitialState());

        const currentUserId = computed(() => (import.meta.env ? 'dev' : userId.value));

        const queuePath = computed(() => `users/${currentUserId.value}/queue`);
        const currentIdPath = computed(() => `users/${currentUserId.value}/currentId`);

        function subscribeToQueue() {
            subscribeToData(queuePath.value, (queue = []) => {
                const { queue: currentQueue } = state;

                if (!isEqual(queue, currentQueue)) {
                    state.queue = queue;
                }
            });
        }

        function subscribeToCurrentQueueId() {
            subscribeToData(currentIdPath.value, (videoId = '') => {
                if (videoId !== state.selectedItemId) {
                    state.selectedItemId = videoId;
                }
            });
        }

        function setQueue(queue: Video[]) {
            state.queue = queue;

            saveData(queuePath.value, queue);
        }

        function isInQueue(videoId: string) {
            return state.queue.find(({ id: queueItemId }) => queueItemId === videoId);
        }

        const queueItems = (newItems: Video[]) => {
            const items = newItems.filter(({ id }) => !isInQueue(id));

            const { queue: currentQueue, newItemCount } = state;

            const queue = [...currentQueue, ...items];

            Object.assign(state, {
                queue,
                newItemCount: newItemCount + items.length
            });

            saveData(queuePath.value, queue);

            return items;
        };

        function queueItem(data: Video) {
            queueItems([data]);
        }

        function setSelectedItem(videoId: string) {
            state.selectedItemId = videoId;

            saveData(currentIdPath.value, videoId);
        }

        async function importVideos(ids: string[]) {
            try {
                const items = await getVideosFromIds(ids.filter((id) => !isInQueue(id)));

                queueItems(items);
            } catch (error) {
                captureError(error);

                toast.add({ title: 'Error queuing videos.' });
            }
        }

        const removeQueueItem = (targetId: string) => {
            setQueue(state.queue.filter(({ id }) => id !== targetId));

            if (targetId === state.selectedItemId) {
                saveData(currentIdPath.value, '');
            }
        };

        function resetNewItemCount() {
            state.newItemCount = 0;
        }

        function clearQueue() {
            state.queue = state.queue.filter(({ id }) => id === state.selectedItemId);

            // TODO: Prompt
        }

        function clearVideo() {
            state.video = null;
        }

        async function fetchVideo(videoId: string) {
            try {
                clearVideo();

                state.video = await getVideo(videoId);
            } catch (error) {
                captureError(error);

                toast.add({ title: 'Error fetching video.' });
            }
        }

        function goToNextQueueItem(next: boolean | undefined = true) {
            const { queue, selectedItemId } = state;
            const newIndex = queue.findIndex(({ id }) => id === selectedItemId) + (next ? 1 : -1);
            const { [newIndex]: { id = null } = {} } = queue;

            if (id) setSelectedItem(id);
        }

        return {
            ...toRefs(state),
            currentVideo: computed(() => {
                const { selectedItemId, video, queue } = state;

                return video || queue.find(({ id }) => id === selectedItemId);
            }),
            subscribeToQueue,
            subscribeToCurrentQueueId,
            setQueue,
            queueItems,
            queueItem,
            setSelectedItem,
            importVideos,
            removeQueueItem,
            clearQueue,
            resetNewItemCount,
            clearVideo,
            fetchVideo,
            goToNextQueueItem
        };
    },
    {
        persist: {
            storage: piniaPluginPersistedstate.localStorage()
        }
    }
);
