import { useClipboard } from '@vueuse/core';

export function useCopy() {
    const toast = useToast();
    const { copy } = useClipboard();

    return async (text: string, message?: string) => {
        await copy(text);

        toast.add({ title: message || 'Copied to clipboard.' });
    };
}
