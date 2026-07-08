import { getVideo } from '~/services/youtube';

export function useVideo(videoId: MaybeRef<string>) {
    return useQuery({
        key: () => ['playlist', toValue(videoId)],
        query: () => getVideo(toValue(videoId))
    });
}
