<script>
    import { createEventDispatcher } from 'svelte';
    import { CaretRight } from "phosphor-svelte";
    const dispatch = createEventDispatcher();

    export let hints = [];
    export let clickedHint = false;

    const handleUpdateSearchText = (hint) => {
        clickedHint=true;
        dispatch('updateSearchText', {hint});
    };

    export const haveClickedHint = () => {
        setTimeout(() => {
            hints=[];
        }, 100);
    }


</script>
<ul class="absolute w-56 dark:bg-gray-800 px-4 py-3 rounded border-r-2 border-l-2 border-b-2 border-gray-200 dark:border-gray-600">
{#each hints as hint}
    <li class="flex justify-between px-3 py-3 mt-1 rounded bg-gray-100 dark:bg-gray-700 cursor-pointer" on:click={()=>{handleUpdateSearchText(hint)}}>
    <small>
        {hint.length > 25
            ? hint.slice(0, 25) +
            "..."
            : hint}
    </small>
    <span class="items-center">
        <CaretRight />
    </span>
    </li>
{/each}
</ul>