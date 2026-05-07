<template>
    <div>
        <UCard variant="soft" :ui="{ body: 'flex items-center' }">
            <div class="flex items-center justify-center size-10">
                <USkeleton class="size-5" />
            </div>

            <div class="flex grow overflow-hidden gap-4">
                <USkeleton class="aspect-video h-28" />

                <div class="flex flex-col grow gap-1">
                    <USkeleton class="h-4 w-full" />
                    <USkeleton class="h-3 w-full" />
                    <USkeleton class="h-2 w-full" />
                </div>
            </div>
        </UCard>
    </div>
</template>
