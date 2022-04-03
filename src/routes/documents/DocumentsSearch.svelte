<script>
    import { MagnifyingGlass, X } from "phosphor-svelte";
    import { createEventDispatcher, onMount } from 'svelte';
    import InputHints from "common/InputHints.svelte";
    import { SendHTTPrequest } from "services/api.js";

    const dispatch = createEventDispatcher();
    import Button from "common/Button.svelte";

    export let searching = false;
    export let search_text = "";
    export let hints = [];
    export let tags = [];
    export let selected_tags = [];
    let haveClickedHint;

    const handleStartSearchingDocuments = (e) => {
        dispatch('startSearchingDocuments', e);
    };
    const handleResetSearchingDocuments = (e) => {
        dispatch('resetSearchingDocuments', e);
    };

    function selectTag(tag){
        selected_tags.push(tag)
        tags.splice(tags.indexOf(tag), 1)
        selected_tags = selected_tags
        tags = tags
        handleStartSearchingDocuments();
        }
    
    function unselectTag(tag){
        selected_tags.splice(selected_tags.indexOf(tag), 1)
        tags.unshift(tag)
        tags = tags
        selected_tags = selected_tags
        handleStartSearchingDocuments();
    }

    async function getHints() {
        if(search_text.length > 0){
            const hintResponse = await SendHTTPrequest({
                endpoint: `/documents/autofill?search_text=${search_text}&results_for=search`,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (hintResponse.status === 200) {
                hints = hintResponse.data.autofill;
            } else {
                hints = [];
            }
        } else {
            hints = [];
        }
    }

    async function getTags() {
        const tagsResponse = await SendHTTPrequest({
            endpoint: '/tags/list',
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (tagsResponse.status === 200){
            tags = tagsResponse.data.tags 
        }
    }

    onMount(async () => {
        getTags()
    })

</script>

<form on:submit={(e)=> {e.preventDefault(); handleStartSearchingDocuments()}} class="my-1 flex">
    <span
        class="flex justify-center items-center
            {searching ? 'visible px-2 w-1/6' : 'invisible w-0'} transition-all"
        on:click={handleResetSearchingDocuments}
    >
        <Button
            classList="
            {searching ? 'visible' : 'invisible w-0'} dark:bg-gray-900 border-gray-600 font-bold py-3 flex justify-center items-center text-lg"
        >
            <span class="{searching ? 'visible' : 'invisible'}">
                <X />
            </span>
        </Button>
    </span>
    <input
        placeholder="Search"
        class="w-full dark:bg-gray-900 rounded font-bold border-gray-600 px-2 mx-2"
        on:keyup={getHints}
        on:focus={getHints}
        on:focusout={()=>{haveClickedHint()}}
        bind:value={search_text}
    />
    <span
        class="flex justify-center items-center w-1/6"
        on:click={handleStartSearchingDocuments}
    >
        <Button
            classList="dark:bg-gray-900 rounded font-bold border-gray-600 py-3 flex justify-center items-center text-lg"
        >
            <MagnifyingGlass />
        </Button>
    </span>
</form>
<span class="flex overflow-x-auto">
    {#each selected_tags as tag}
        <span class="dark:bg-gray-500 flex-none rounded-xl text-sm border-gray-600 font-bold py-2 px-2 mx-2 cursor-pointer" on:click={(e)=>{unselectTag(tag)}}>
            {tag.name}
        </span>
    {/each}
    {#each tags as tag}
        <span class="dark:bg-gray-900 flex-none rounded-xl text-sm border-gray-600 font-bold py-2 px-2 mx-2 cursor-pointer" on:click={(e)=>{selectTag(tag)}}>
            {tag.name}
        </span>
    {/each}
</span>
{#if hints.length > 0 }
    <span class="w-full">
        <InputHints bind:haveClickedHint bind:hints on:clickHint={(e)=>{search_text = e.detail.hint; hints=[]; handleStartSearchingDocuments();}} />
    </span>
{/if}
