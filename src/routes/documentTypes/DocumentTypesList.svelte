<script>
    import { SendHTTPrequest } from 'services/api.js';
    import { onMount } from 'svelte';

    export let allDocumentTypes;
    export let currentDocumentType;

    onMount(async () => {
        const response = await SendHTTPrequest({
            endpoint: '/document_types',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        allDocumentTypes = response.data;
    });
</script>

<div class="rounded-md shadow-lg">
    <ul class="mt-5">
        {#if allDocumentTypes}
            {#if allDocumentTypes.length > 0}
                {#each allDocumentTypes as documentType}
                    <li
                        class="dark:bg-gray-600 rounded mt-5 p-2 flex items-center"
                    >
                        <!-- Stacked -->
                        <div class="w-2/3 ml-2">
                            <p>{documentType.title}</p>
                            <small
                                >{documentType.description.length > 15
                                    ? documentType.description.slice(0, 15) +
                                      '...'
                                    : documentType.description}</small
                            >
                        </div>
                        <!-- Inline -->
                        <div class="w-1/3 mr-5 flex justify-end">
                            <span
                                class="flex items-center pl-5 dark:text-white text-black"
                                on:click={() => {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    currentDocumentType = documentType;
                                }}
                                >Select
                            </span>
                        </div>
                    </li>
                {/each}
            {:else}
                <p class="flex w-full justify-center text-xl py-64">
                    No Document Types
                </p>
            {/if}
        {/if}
    </ul>
</div>

<style>
    span {
        cursor: pointer;
        transition-duration: 0.2s;
    }
</style>
