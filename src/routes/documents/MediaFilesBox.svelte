<script>
    import { createEventDispatcher } from 'svelte';

    export let mediaThumbnailsList;
    export let mediaFilesList;
    export let deletedMediaIds;
    const dispatch = createEventDispatcher();

    function convertMedia(file) {
        dispatch('convertMedia', file);
    }

    function deleteFile(media_file_index, media_file_id) {
        if (media_file_id) {
            deletedMediaIds = [...deletedMediaIds, media_file_id];
        }
        URL.revokeObjectURL(mediaThumbnailsList[media_file_index]);
        mediaThumbnailsList.splice(media_file_index, 1);
        mediaThumbnailsList = mediaThumbnailsList;
        mediaFilesList.splice(media_file_index, 1);
        mediaFilesList = mediaFilesList;
    }

    async function mediaInputHandler(event) {
        for (const file of event.target.files) {
            convertMedia(file);
        }
    }

    async function dropHandler(event) {
        if (event.dataTransfer.items) {
            for (const item of event.dataTransfer.items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    convertMedia(file);
                }
            }
        }
    }
    
</script>

<div
    id="drop_zone"
    class="h-60 col-span-3 p-2 rounded items-center text-center bg-gray-500 border-2 border-dashed border-blue-400"
    on:dragover|preventDefault
    on:drop|preventDefault={dropHandler}
>
    <p class="text-lg">
        Add files <small>Images/PDF</small>
    </p>
    <div
        class="{mediaThumbnailsList.length === 0 &&
            'justify-center'} flex overflow-x-auto flex-nowrap mt-5"
    >
        {#if mediaThumbnailsList.length > 0}
            {#each mediaThumbnailsList as media, i}
                <div class="flex justify-end">
                    <img
                        class="h-32 rounded mx-2"
                        src={media.url}
                        alt="Thumbnail of document"
                    />
                    <div
                        on:click={() => {
                            deleteFile(i, media.id);
                        }}
                        class="absolute pr-3 pt-2"
                    >
                        <i
                            class="ph-x-circle text-xl rounded-full bg-red-600 cursor-pointer"
                        />
                    </div>
                </div>
            {/each}
        {:else}
            <div class="h-28 p-2 text-xl">
                <div class="my-2">Drop files here</div>
                Or
            </div>
        {/if}
    </div>
    <div class="flex justify-center rounded bg-gray-700 mt-2 py-1">
        <div class="absolute">Click here to add</div>
        <input
            on:change={mediaInputHandler}
            class="h-full w-full opacity-0"
            type="file"
            name="uploadedFile"
            id="uploadedFile"
            accept="image/*,pdf"
            multiple
        />
    </div>
</div>
