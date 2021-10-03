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
        console.log('Schedule deletion', media_file_id);
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
    class="h-60 col-span-3 p-2 rounded items-center text-center dark:bg-gray-900 border-2 border-solid border-opacity-50 border-blue-800"
    on:dragover|preventDefault
    on:drop|preventDefault={dropHandler}
>
    <p class="text-lg">
        Add files <small>Images/PDF</small>
    </p>
    <div
        class="{mediaThumbnailsList.length === 0 &&
            'justify-center'} mt-5 w-full"
    >
        {#if mediaThumbnailsList.length > 0}
            <div class="flex overflow-x-auto">
                {#each mediaThumbnailsList as media, i}
                <div class="flex-none mx-2">
                    <div class="relative">
                        <img
                            class="h-24 rounded"
                            src={media.url}
                            alt="Thumbnail of document"
                        />
                        <div
                            on:click={() => {
                                deleteFile(i, media.id);
                            }}
                            class="absolute top-0 right-0 p-2 cursor-pointer"
                        >
                            <i class="ph-x text-xl rounded bg-gray-600 duration-100 hover:text-red-400 hover:bg-red-100" />
                        </div>
                        {#if mediaFilesList[i].file.length > 0}
                        <a
                            target="_blank"
                            href={mediaFilesList[i].file}
                            class="absolute visited:text-green-400 bottom-0 right-0 pr-2 cursor-pointer"
                        >
                            <i class="ph-download-simple text-xl rounded bg-gray-600 duration-100 hover:text-green-400 hover:bg-green-100" />
                        </a>
                        {/if}
                    </div>
                </div>
                {/each}
            </div>
        {:else}
            <div class="h-28 p-2 text-xl">
                <div class="my-2">Drop files here</div>
                Or
            </div>
        {/if}
    </div>
    <div class="flex justify-center rounded dark:bg-gray-800 mt-2 py-1">
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
