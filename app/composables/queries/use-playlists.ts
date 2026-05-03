import {
    createPlaylist,
    // getPlaylist,
    getPlaylists,
    getPlaylistItems,
    addPlaylistItem,
    // getUserPlaylists,
    removePlaylistItem
} from '~/services/youtube';

export function usePlaylists(channelId?: MaybeRef<string>) {
    return useInfiniteQuery({
        key: () => ['playlists', toValue(channelId) || 'mine'],
        query: ({ pageParam: pageToken }) => {
            return getPlaylists({
                ...(pageToken ? { pageToken } : {}),
                ...(toValue(channelId) ? { channelId: toValue(channelId) } : { mine: true })
            });
        },
        initialPageParam: undefined,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}

// export function usePlaylist(playlistId: MaybeRef<string>) {
//     return useQuery({
//         key: () => ['playlist', toValue(playlistId)],
//         query: () => getPlaylist(toValue(playlistId))
//     });
// }

// export function useUpdatePlaylist(playlistId: MaybeRef<string>) {
//     const queryCache = useQueryCache();
//     const authStore = useAuthStore();

//     return useMutation({
//         mutation: async ({
//             cover,
//             ...playlistData
//         }: {
//             name: string;
//             description: string;
//             cover?: string;
//         }) => {
//             await updatePlaylist(toValue(playlistId), playlistData);

//             if (cover && cover.startsWith('data:image')) {
//                 await updatePlaylistCover(toValue(playlistId), cover);
//             }
//         },
//         onSuccess: () => {
//             queryCache.invalidateQueries({
//                 key: ['playlist', playlistId]
//             });

//             queryCache.invalidateQueries({
//                 key: ['playlists', authStore.userId]
//             });
//         }
//     });
// }

// export function usePlaylistItems(playlistId: MaybeRef<string>) {
//     const { data: playlist } = usePlaylist(playlistId);

//     /** TODO: load saved tracks (playlistId === 'saved') */

//     return useInfiniteQuery({
//         key: () => ['playlistItems', toValue(playlistId)],
//         query: ({ pageParam: offset }) => getPlaylistItems(toValue(playlistId), offset),
//         initialPageParam: 0,
//         getNextPageParam: (_, pages) => {
//             const { totalItemCount } = playlist?.value || {};

//             if (!totalItemCount) {
//                 return 0;
//             }

//             const currentItemCount = pages.flat().length;

//             return currentItemCount < totalItemCount ? currentItemCount : null;
//         }
//     });
// }

// export function useToggleSavePlaylistItem(playlistId: MaybeRef<string>) {
//     const queryCache = useQueryCache();

//     return useMutation({
//         mutation: (trackId: string) => toggleSaveItem(trackId),
//         onSuccess: () => {
//             queryCache.invalidateQueries({
//                 key: ['playlistItems', playlistId]
//             });
//         }
//     });
// }

// export function useAddPlaylistItem() {
//     const router = useRouter();
//     const queryCache = useQueryCache();
//     const authStore = useAuthStore();

//     return useMutation({
//         mutation: async ({ playlistId, trackId }: { playlistId?: string; trackId: string }) => {
//             if (!playlistId) {
//                 const { id: playlistId } = await createPlaylist(authStore.userId, 'New playlist');

//                 await addPlaylistItem(playlistId, trackId);

//                 return { playlistId, isNewPlaylist: true };
//             } else {
//                 await addPlaylistItem(playlistId, trackId);

//                 return { playlistId };
//             }
//         },
//         onSuccess: ({ playlistId, isNewPlaylist }) => {
//             queryCache.invalidateQueries({
//                 key: ['playlistItems', playlistId]
//             });

//             queryCache.invalidateQueries({
//                 key: ['playlist', playlistId]
//             });

//             queryCache.invalidateQueries({
//                 key: ['playlists', authStore.userId]
//             });

//             if (isNewPlaylist) {
//                 router.push(`/playlist/${playlistId}`);
//             }
//         }
//     });
// }

// export function useRemovePlaylistItem(playlistId: MaybeRef<string>) {
//     const authStore = useAuthStore();
//     const queryCache = useQueryCache();

//     return useMutation({
//         mutation: async (trackId: string) => {
//             await removePlaylistItem(toValue(playlistId), trackId);

//             return trackId;
//         },
//         onSuccess: () => {
//             queryCache.invalidateQueries({
//                 key: ['playlistItems', playlistId]
//             });

//             queryCache.invalidateQueries({
//                 key: ['playlist', playlistId]
//             });

//             queryCache.invalidateQueries({
//                 key: ['playlists', authStore.userId]
//             });
//         }
//     });
// }
