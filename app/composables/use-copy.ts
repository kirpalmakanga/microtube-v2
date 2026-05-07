import { useClipboard } from '@vueuse/core';

export function useCopy() {
    const toast = useToast();
    const { copy } = useClipboard();

    return (text: string, message?: string) => {
        copy(text);

        toast.add({ title: message || 'Copied to clipboard.' });
    };
}
