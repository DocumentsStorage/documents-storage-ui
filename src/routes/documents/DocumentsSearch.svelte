<script>
    import { MagnifyingGlass, X } from "phosphor-svelte";
    import { createEventDispatcher } from 'svelte';
    import InputHints from "common/InputHints.svelte";
    import { SendHTTPrequest } from "services/api.js";

    const dispatch = createEventDispatcher();
    import Button from "common/Button.svelte";

    export let searching = false;
    export let search_text = "";
    export let hints = [];
    let haveClickedHint

    const handleStartSearchingDocuments = (e) => {
        dispatch('startSearchingDocuments', e);
    };
    const handleResetSearchingDocuments = (e) => {
        dispatch('resetSearchingDocuments', e);
    };

    async function getHints() {
        if(search_text.length > 0){
            const response = await SendHTTPrequest({
            endpoint: `/documents/autofill?search_text=${search_text}&results_for=search`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            });
            if (response.status === 200) {
                hints = response.data.autofill;
            } else {
                hints = [];
            }
        } else {
            hints = [];
        }
    }
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
{#if hints.length > 0 }
    <span class="w-full">
        <InputHints bind:haveClickedHint bind:hints on:updateSearchText={(e)=>{search_text=e.detail.hint; hints=[]; handleStartSearchingDocuments();}} />
    </span>
{/if}
