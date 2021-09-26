<script>
    import { SendHTTPrequest } from "services/api.js";
    import { onMount } from "svelte";
    import Button from "common/Button.svelte";

    export let allDocuments;
    export let totalDocumentsCount = 0;
    export let perPage = 7;
    export let currentPage = 0;
    export let currentDocument;
    export let search_text = "";
    export let searching = false;

    function setupDocuments(documents) {
        documents = documents.map((document) => {
            document.media_files = document.media_files?.map(
                (uuid) => uuid["$uuid"]
            );
            return document;
        });
        allDocuments = documents;
    }

    async function loadListDocuments(skip, limit) {
        const response = await SendHTTPrequest({
            endpoint: `/documents?skip=${skip}&limit=${limit}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status !== 200) {
            allDocuments = [];
        } else {
            return response.data;
        }
    }

    async function loadSearchDocuments(skip, limit) {
        let query = "";
        for (const word of search_text.split(" ")) {
            query += `&search_text=${word}`;
        }

        const response = await SendHTTPrequest({
            endpoint: `/documents/search?skip=${skip}&limit=${limit}${query}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status !== 200) {
            allDocuments = [];
        } else {
            return response.data;
        }
    }

    async function resetSearchingDocuments() {
        searching = false;
        search_text = "";
        const loaded = await loadListDocuments(0, perPage);
        if (loaded) {
            totalDocumentsCount = loaded.total;
            setupDocuments(loaded.documents);
        }
    }

    async function startSearchingDocuments() {
        if (search_text.length > 0) {
            searching = true;
            const loaded = await loadSearchDocuments(0, perPage);
            if (loaded) {
                totalDocumentsCount = loaded.total;
                setupDocuments(loaded.documents);
            }
        }
    }

    async function prevPage() {
        if (currentPage > 0) {
            let loaded;
            if (searching) {
                loaded = await loadSearchDocuments(
                    (currentPage - 1) * perPage,
                    perPage
                );
            } else {
                loaded = await loadListDocuments(
                    (currentPage - 1) * perPage,
                    perPage
                );
            }
            if (loaded) {
                setupDocuments(loaded.documents);
                currentPage--;
            }
        }
    }

    async function nextPage() {
        if (currentPage < totalDocumentsCount / perPage - 1) {
            let loaded;
            if (searching) {
                loaded = await loadSearchDocuments(
                    (currentPage + 1) * perPage,
                    perPage
                );
            } else {
                loaded = await loadListDocuments(
                    (currentPage + 1) * perPage,
                    perPage
                );
            }
            if (loaded) {
                setupDocuments(loaded.documents);
                currentPage++;
            }
        }
    }

    onMount(async () => {
        const loaded = await loadListDocuments(0, perPage);
        if (loaded) {
            totalDocumentsCount = loaded.total;
            setupDocuments(loaded.documents);
        }
    });
</script>

<div class="rounded-md shadow-lg">
    <ul class="mt-5">
        {#if allDocuments}
            <form on:submit={(e)=> {e.preventDefault(); startSearchingDocuments()}} class="my-1 flex">
                <span
                    class="
                        {searching ? 'visible px-2' : 'invisible w-1'} flex justify-center items-center w-1/6"

                    on:click={resetSearchingDocuments}
                >
                    <Button
                        class="dark:bg-gray-900 rounded font-bold border-gray-600 px-2 py-3 mx-2 flex justify-center items-center text-lg"
                    >
                        <i class="{searching ? 'visible' : 'invisible'} ph-x" />
                    </Button>
                </span>
                <input
                    placeholder="Search"
                    class="w-full dark:bg-gray-900 rounded font-bold border-gray-600 px-2 mx-2"
                    bind:value={search_text}
                />
                <span
                    class="flex justify-center items-center w-1/6"
                    on:click={startSearchingDocuments}
                >
                    <Button
                        class="dark:bg-gray-900 rounded font-bold border-gray-600 px-2 py-3 mx-2 flex justify-center items-center text-lg"
                    >
                        <i class="ph-magnifying-glass" />
                    </Button>
                </span>
            </form>
            {#if allDocuments.length > 0}
                {#each allDocuments as documentType}
                    <li class="dark:bg-gray-600 rounded mt-5 p-2 flex">
                        <!-- Stacked -->
                        <div class="w-3/4 ml-2">
                            <p>{documentType.title}</p>
                            <small
                                >{documentType.description.length > 30
                                    ? documentType.description.slice(0, 30) +
                                      "..."
                                    : documentType.description}</small
                            >
                        </div>
                        <div class="w-full mr-5 flex justify-end">
                            <span
                                class="flex items-center pl-5 dark:text-white text-black"
                                on:click={() => {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    currentDocument = documentType;
                                }}
                            >
                                Select
                            </span>
                        </div>
                    </li>
                {/each}
                <div class="flex justify-between py-5 px-2">
                    <small>
                        Total: {totalDocumentsCount}, Page: {currentPage + 1} / {Math.ceil(
                            totalDocumentsCount / perPage
                        )}
                    </small>
                    <div>
                        <span
                            class="rounded mx-1 px-4 py-2 bg-gray-900"
                            on:click={prevPage}
                            ><i class="ph-caret-left" /></span
                        >
                        <span
                            class="rounded mx-1 px-4 py-2 bg-gray-900"
                            on:click={nextPage}
                            ><i class="ph-caret-right" /></span
                        >
                    </div>
                </div>
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
