<script>
    import { SendHTTPrequest } from "services/api.js";
    import { onMount } from "svelte";
    import Button from "common/Button.svelte";
    import DocumentsSearch from "./DocumentsSearch.svelte";
    import { CaretLeft, CaretRight, SortAscending, SortDescending } from "phosphor-svelte";

    export let allDefinedFields = [];
    export let allDocuments = [];
    export let totalDocumentsCount = 0;
    export let perPage = 7;
    export let currentPage = 0;
    export let currentDocument;
    export let search_text = "";
    export let selected_tags = [];
    export let searching = false;
    export let order_ascending = true;
    export let order_by = "creation_date";
    
    $: order_by, order_ascending, loadSortedDocuments();
    
    function setupDocuments(loaded) {
        var documents = loaded.documents;
        documents = documents.map((document) => {
            document.media_files = document.media_files.map(
                (uuid) => uuid["$uuid"]
            );
            return document;
        });
        allDefinedFields = loaded.defined_fields;
        allDocuments = documents;
    }

    function getOrderedFiltered(){
        var sel = ""
        selected_tags.map((v)=>{sel += "&tag_ids=" + v._id.$oid })
        return `&order_by=${order_by}&order=${order_ascending ? '+1' : '-1'}${sel}`
    }

    async function loadSortedDocuments(skip=0, limit=perPage){
        const query = getOrderedFiltered()
        if(searching){
            const loaded = await loadSearchDocuments(skip, limit, query);
            if(loaded){
                totalDocumentsCount = loaded.total;
                currentPage = 0;
                setupDocuments(loaded);
            }
        } else {
            const loaded = await loadListDocuments(skip, limit, query);
            if(loaded){
                totalDocumentsCount = loaded.total;
                currentPage = 0;
                setupDocuments(loaded);
            }
        }
    }

    async function loadListDocuments(skip, limit, order=getOrderedFiltered()) {
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

    async function loadSearchDocuments(skip, limit, order=getOrderedFiltered()) {
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
        if (search_text.length > 0 || selected_tags.length > 0 ) {
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

<div class="rounded-md shadow-lg pt-5">
        {#if allDocuments}
            <DocumentsSearch 
                bind:searching 
                bind:search_text
                bind:selected_tags
                on:resetSearchingDocuments={()=>{resetSearchingDocuments();}} 
                on:startSearchingDocuments={()=>{startSearchingDocuments();}}
            />
            <div class="flex mt-5">
                <div class="w-3/5 text-sm">
                    <Button classList="w-2/3" size="sm" on:click={(e)=>{ order_ascending = !order_ascending;}}>
                            {#if order_ascending}
                            <div class="flex justify-between items-center w-full">
                                <p>Sorted Ascending</p>
                                <SortAscending />
                            </div>
                            {:else}
                            <div class="flex justify-between items-center w-full">
                                <p>Sorted Descending</p>
                                <SortDescending />
                            </div>
                            {/if}
                    </Button>
                </div>
                <div class="w-2/5 flex justify-end text-sm">
                    <select
                        name="documentType"
                        class="dark:bg-gray-900 w-full font-bold py-1"
                        bind:value={order_by}
                    >
                        <option value="creation_date" selected>Creation date</option>
                        <option value="modification_date">Modification date</option>
                        {#if allDefinedFields.lenght > 0 }
                            {#each allDefinedFields as field}
                                <option value={field}>{field}</option>
                            {/each}
                        {/if}
                    </select>
                </div>
            </div>
            <ul class="mt-5">
            {#if allDocuments.length > 0}
                {#each allDocuments.filter((v, i)=> !v?.is_new ) as document}
                    <li class="flex h-16 bg-gray-200 dark:bg-gray-600 rounded mt-5 p-2 { document === currentDocument && 'bg-gray-400 dark:bg-gray-400' }">
                        <!-- Stacked -->
                        <div class="w-full ml-2">
                            <p>{document.title.length > 20
                                ? document.title.slice(0, 20) +
                                  "..."
                                : document.title}</p>
                            <small
                                >{document.description.length > 25
                                    ? document.description.slice(0, 25) +
                                      "..."
                                    : document.description}</small
                            >
                        </div>
                        <div class="mr-5 flex justify-end">
                            <span
                                class="flex items-center pl-5 dark:text-white text-black cursor-pointer"
                                on:click={() => {
                                    currentDocument = document;
                                }}
                            >
                                Select
                            </span>
                        </div>
                    </li>
                {/each}
                {#if allDocuments.filter((v, i)=> v?.is_new).length > 0}
                    <br/>
                    <h2 class="text-center text-xl my-2">New Documents</h2>
                    <hr/>
                    {#each allDocuments.filter((v, i)=> v?.is_new ) as document}
                        <li class="flex h-16 bg-gray-200 dark:bg-gray-600 rounded mt-5 p-2 { document === currentDocument && 'bg-gray-400 dark:bg-gray-400' }">
                            <!-- Stacked -->
                            <div class="w-full ml-2">
                                <p>{document.title.length > 20
                                    ? document.title.slice(0, 20) +
                                    "..."
                                    : document.title}</p>
                                <small
                                    >{document.description.length > 25
                                        ? document.description.slice(0, 25) +
                                        "..."
                                        : document.description}</small
                                >
                            </div>
                            <div class="mr-5 flex justify-end">
                                <span
                                    class="flex items-center pl-5 dark:text-white text-black cursor-pointer"
                                    on:click={() => {
                                        currentDocument = document;
                                    }}
                                >
                                    Select
                                </span>
                            </div>
                        </li>
                    {/each}
                {/if}
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
        </ul>
        {/if}

</div>


