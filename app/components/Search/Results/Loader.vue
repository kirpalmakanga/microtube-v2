<template>
    <div class="p-6">
        <UCard variant="soft" :ui="{ body: 'flex items-center' }">
            <div class="flex grow overflow-hidden p-4 gap-4 cursor-pointer">
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
