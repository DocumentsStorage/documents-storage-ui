<script>
    import { SendHTTPrequest } from "services/api.js";
    import { onMount } from "svelte";

    export let allDocuments;
    export let currentDocument;

    onMount(async () => {
        const response = await SendHTTPrequest({
            endpoint: "/documents",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        allDocuments = response.data.map((document) => {
            document.media_files = document.media_files?.map(
                (uuid) => uuid["$uuid"]
            );
            return document;
        });
    });
</script>

<div class="rounded-md shadow-lg">
    <ul class="mt-5">
        {#if allDocuments}
            {#if allDocuments.length > 0}
                {#each allDocuments as documentType}
                    <li class="dark:bg-gray-600 rounded mt-5 p-2 flex">
                        <!-- Stacked -->
                        <div class="w-1/3 ml-2">
                            <p>{documentType.title}</p>
                            <small
                                >{documentType.description.length > 15
                                    ? documentType.description.slice(0, 15) +
                                      "..."
                                    : documentType.description}</small
                            >
                        </div>
                        <div class="w-full mr-5 flex justify-end">
                            <span
                                class="flex items-center pl-5 dark:text-white text-black"
                                on:click={() => {
                                    currentDocument = documentType;
                                }}
                            >
                                Select
                            </span>
                        </div>
                    </li>
                {/each}
            {:else}
                <p class="flex w-full justify-center text-xl py-64">
                    No Documents
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
