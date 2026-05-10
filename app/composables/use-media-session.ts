type UseMediaSessionActions = Partial<Record<MediaSessionAction, MediaSessionActionHandler>>;

interface UseMediaSessionOptions {
    metadata?: MediaMetadataInit;
    actions?: UseMediaSessionActions;
}

function setMetaData(metadata: MediaMetadata | null) {
    navigator.mediaSession.metadata = metadata;
}

function setAction(action: MediaSessionAction, handler: MediaSessionActionHandler | null) {
    navigator.mediaSession.setActionHandler(action, handler);
}

export function useMediaSession(options: MaybeRef<UseMediaSessionOptions>) {
    const previousMetaData = ref<MediaMetadata | null>(navigator.mediaSession.metadata);

    function clear(_options: UseMediaSessionOptions) {
        const { actions } = _options;

        if (actions) {
            let action: keyof UseMediaSessionActions;

            for (action in actions) {
                setAction(action, null);
            }
        }

        setMetaData(previousMetaData.value);
    }

    function initMetadata() {
        const { metadata } = toValue(options);

        if (metadata) setMetaData(new MediaMetadata(metadata));
    }

    function initActions() {
        const { actions } = toValue(options);

        if (!actions) return;

        let action: keyof UseMediaSessionActions;

        for (action in actions) {
            const handler = actions[action];

            if (handler) {
                setAction(action, handler);
            }
        }
    }

    function init() {
        initMetadata();

        initActions();
    }

    if (isRef(options)) {
        watch(
            options,
            (_, previousOptions) => {
                if (previousOptions) clear(previousOptions);

                init();
            },
            { immediate: true }
        );
    } else {
        init();
    }

    onUnmounted(() => clear(toValue(options)));
}
