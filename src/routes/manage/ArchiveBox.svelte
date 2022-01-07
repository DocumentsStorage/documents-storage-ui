<script>
        import { ArchiveBox, X } from 'phosphor-svelte';
    
        import { createEventDispatcher } from 'svelte';
    
        export let fileSet = false;
        const dispatch = createEventDispatcher();
    
        function convertFile(file) {
            dispatch('convertFile', file);
            fileSet=true;
        }
    
        function deleteFile() {
            dispatch('deleteFile');
            fileSet=false;
        }
    
        async function mediaInputHandler(event) {
            for (const file of event.target.files) {
                convertFile(file);
            }
        }
    
        async function dropHandler(event) {
            if (event.dataTransfer.items) {
                for (const item of event.dataTransfer.items) {
                    if (item.kind === 'file') {
                        const file = item.getAsFile();
                        convertFile(file);
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
            Set file <small> tar.gz</small>
        </p>
        <div
            class="{!fileSet &&'justify-center'} mt-5 w-full"
        >
            {#if fileSet}
                <div class="flex justify-center">
                    <div class="flex justify-center mx-2">
                        <div class="relative">                            
                            <ArchiveBox class="bg-gray-400 text-xl w-24 h-24 rounded">
                            </ArchiveBox>
                            <div
                                on:click={() => {
                                    deleteFile();
                                }}
                                class="absolute top-0 right-0 p-2 cursor-pointer"
                            >
                                <X class="bg-gray-600 text-xl rounded duration-100 hover:text-red-400 hover:bg-red-100"/>
                            </div>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="h-28 p-2 text-xl">
                    <div class="my-2">Drop archive file here</div>
                    Or
                </div>
            {/if}
        </div>
        <div class="flex justify-center rounded bg-gray-300 dark:bg-gray-800 mt-2 py-1">
            <div class="absolute">Click here to set</div>
            <input
                on:change={mediaInputHandler}
                class="h-full w-full opacity-0"
                type="file"
                name="uploadedFile"
                id="uploadedFile"
                accept="application/tar+gzip"
            />
        </div>
    </div>
    