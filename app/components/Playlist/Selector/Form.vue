<script setup lang="ts">
interface FormProps {
    onSubmit: (data: PlaylistData) => void;
}

const privacyOptions: DropDownOption<string>[] = [
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
    { label: 'Unlisted', value: 'unlisted' }
];

const [state, setState] = createStore({
    title: '',
    privacyStatus: 'public'
});

const setValue = (key: string, value: unknown) => setState({ [key]: value });

const handlePrivacyStatusChange = (value: string) => {
    setValue('privacyStatus', value);
};

const handleInput: JSX.EventHandler<HTMLInputElement, Event> = ({
    currentTarget: { name, value }
}) => {
    setValue(name, value);
};

const handleSubmit = preventDefault(() => state.title && onSubmit(state as PlaylistData));
</script>

<template>
    <form class="flex flex-col z-1 gap-4" onSubmit="{handleSubmit}">
        <fieldset class="flex flex-col gap-4">
            <label>New playlist</label>

            <div class="flex flex-col">
                <label class="text-sm mb-1" for="playlist-title">Title</label>

                <input
                    id="playlist-title"
                    class="h-8 flex-grow transition-colors bg-primary-800 hover:bg-primary-700 focus:(outline-none bg-primary-600) px-2 rounded"
                    name="title"
                    value="{state.title}"
                    placeholder="Title"
                    onChange="{handleInput}"
                    onKeyPress="{stopPropagation()}"
                />
            </div>

            <div class="flex flex-col">
                <label class="text-sm mb-1">Privacy</label>

                <DropDown
                    currentValue="{state.privacyStatus}"
                    options="{privacyOptions}"
                    onSelect="{handlePrivacyStatusChange}"
                />
            </div>
        </fieldset>

        <div class="flex justify-end">
            <Button
                class="flex items-center justify-center gap-2 px-4 py-1 bg-violet-500 hover:bg-violet-400 transition-colors text-light-50 font-montserrat rounded shadow"
                type="submit"
                title="Create"
                disabled="{!state.title}"
            />
        </div>
    </form>
</template>
