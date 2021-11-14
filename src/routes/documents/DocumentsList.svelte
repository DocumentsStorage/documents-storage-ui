<script>
    import { SendHTTPrequest } from "services/api.js";
    import { onMount } from "svelte";
    import Button from "common/Button.svelte";
    import { CaretLeft, CaretRight, MagnifyingGlass, X, SortAscending, SortDescending } from "phosphor-svelte";

    export let allDefinedFields;
    export let allDocuments;
    export let totalDocumentsCount = 0;
    export let perPage = 7;
    export let currentPage = 0;
    export let currentDocument;
    export let search_text = "";
    export let searching = false;
    export let order_ascending = true;
    export let order_by = "creation_date";
    
    $: order_by, order_ascending, loadSortedDocuments();
    
    function setupDocuments(loaded) {
        var documents = loaded.documents;
        documents = documents.map((document) => {
            document.media_files = document.media_files?.map(
                (uuid) => uuid["$uuid"]
            );
            return document;
        });
        allDefinedFields = loaded.defined_fields;
        allDocuments = documents;
    }

    function getOrderBy(){
        return `&order_by=${order_by}&order=${order_ascending ? '+1' : '-1'}`
    }

    async function loadSortedDocuments(skip=0, limit=perPage){
        const query = getOrderBy()
        if(searching){
            const loaded = await loadSearchDocuments(skip, limit, query);
            totalDocumentsCount = loaded.total;
            currentPage = 0;
            setupDocuments(loaded);
        } else {
            const loaded = await loadListDocuments(skip, limit, query);
            totalDocumentsCount = loaded.total;
            currentPage = 0;
            setupDocuments(loaded);
        }
    }

    async function loadListDocuments(skip, limit, order=getOrderBy()) {
        const response = await SendHTTPrequest({
            endpoint: `/documents?skip=${skip}&limit=${limit + order}`,
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

    async function loadSearchDocuments(skip, limit, order=getOrderBy()) {
        let query = "";
        for (const word of search_text.split(" ")) {
            query += `&search_text=${word}`;
        }

        const response = await SendHTTPrequest({
            endpoint: `/documents?skip=${skip}&limit=${limit + query + order}`,
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
            setupDocuments(loaded);
        }
    }

    async function startSearchingDocuments() {
        if (search_text.length > 0) {
            searching = true;
            const loaded = await loadSearchDocuments(0, perPage);
            if (loaded) {
                totalDocumentsCount = loaded.total;
                setupDocuments(loaded);
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
                if(loaded.documents.length > 0){
                    totalDocumentsCount = loaded.total;
                    setupDocuments(loaded);
                    currentPage--;
                }
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
                if(loaded.documents.length > 0){
                    totalDocumentsCount = loaded.total;
                    setupDocuments(loaded);
                    currentPage++;
                }
            }
        }
    }

    onMount(async () => {
        const loaded = await loadListDocuments(0, perPage);
        if (loaded) {
            totalDocumentsCount = loaded.total;
            setupDocuments(loaded);
        }
    });
</script>

<div class="rounded-md shadow-lg">
    <ul class="mt-5">
        {#if allDocuments}
            <form on:submit={(e)=> {e.preventDefault(); startSearchingDocuments()}} class="my-1 flex">
                <span
                    class="flex justify-center items-center
                        {searching ? 'visible px-2 w-1/6' : 'invisible w-0'} transition-all"

                    on:click={resetSearchingDocuments}
                >
                    <Button
                        class="
                        {searching ? 'visible px-2' : 'invisible w-0'} dark:bg-gray-900 border-gray-600 font-bold px-2 py-3 mx-2 flex justify-center items-center text-lg"
                    >
                        <span class="{searching ? 'visible' : 'invisible'}">
                            <X />
                        </span>
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
                        <MagnifyingGlass />
                    </Button>
                </span>
            </form>
            <div class="flex mt-5">
                <div class="w-1/2">
                    <Button classList="w-44" on:click={(e)=>{ order_ascending = !order_ascending;}}>
                            {#if order_ascending}
                            <div class="flex justify-between items-center text-lg w-full">
                                <p>Sorted Ascending</p>
                                <SortAscending />
                            </div>
                            {:else}
                            <div class="flex justify-between items-center text-lg w-full">
                                <p>Sorted Descending</p>
                                <SortDescending />
                            </div>
                            {/if}
                    </Button>
                </div>
                <div class="w-1/2 flex justify-center">
                    <select
                        name="documentType"
                        class="dark:bg-gray-900 font-bold px-2 py-1 col-span-3"
                        bind:value={order_by}
                    >
                        <option value="creation_date" selected>Creation date</option>
                        <option value="modification_date">Modification date</option>
                        {#each allDefinedFields as field}
                            <option value={field}>{field}</option>
                        {/each}
                    </select>
                </div>
            </div>
            {#if allDocuments.length > 0}
                {#each allDocuments as documentType}
                    <li class="flex h-16 bg-gray-200 dark:bg-gray-600 rounded mt-5 p-2">
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
                                class="flex items-center pl-5 dark:text-white text-black cursor-pointer"
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
                    <div class="flex">
                        <Button
                            classList="rounded mx-1 px-4 py-2 bg-gray-200 dark:bg-gray-900"
                            on:click={prevPage}
                            ><CaretLeft /></Button>
                        <Button
                            classList="rounded mx-1 px-4 py-2 bg-gray-200 dark:bg-gray-900"
                            on:click={nextPage}
                            ><CaretRight /></Button>
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


