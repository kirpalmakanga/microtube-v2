<template>
    <div>
        <UCard variant="soft" :ui="{ body: 'flex items-center' }">
            <USkeleton class="self center size-4 mr-4" />

            <div class="flex grow gap-4">
                <USkeleton class="aspect-video h-14 md:h-28" />

                <div class="flex flex-col grow gap-1">
                    <USkeleton class="h-4 w-full" />
                    <USkeleton class="h-3 w-full" />
                    <USkeleton class="h-2 w-full" />
                </div>
            </div>
        </UCard>
    </div>
</template>
