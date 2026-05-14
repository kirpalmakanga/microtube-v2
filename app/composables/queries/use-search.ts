import { query } from 'firebase/database';
import { searchVideos, type SearchVideosReturn } from '~/services/youtube';

export function useSearch(searchParams: MaybeRef<{ query: string; forMine: number }>) {
    return useInfiniteQuery<SearchVideosReturn, {}, string | null>({
        key: () => ['search'],
        query: ({ pageParam: pageToken }) => {
            return searchVideos({
                pageToken,
                ...toValue(searchParams)
            });
        },
        initialPageParam: null,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}

export function useClearSearchResults() {
    const queryCache = useQueryCache();

    return () => {
        const entry = queryCache.get(['search']);

        if (entry) queryCache.remove(entry);
    };
}
