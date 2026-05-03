<template>
    <div
        class="flex items-center w-full bg-gray-900 hover:bg-gray-800 transition-colors no-highlights"
    >
        <div class="flex items-center justify-center size-10">
            <USkeleton class="size-5" />
        </div>

        <div class="flex grow overflow-hidden p-4 gap-4 cursor-pointer">
            <USkeleton class="aspect-video h-28" />

            <div class="flex flex-col grow"><USkeleton class="h-4 w-full" /></div>
        </div>
    </div>
</template>
