<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let classList = "";
    export let size = "md";

    const handleClick = (e) => {
        dispatch('click', e);
    };
</script>
<button type="button" 
class="{classList} rounded dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white text-black 
{size == 'sm' && 'py-1 px-3'} {size == 'md' && 'py-2 px-5'} {size == 'lg' && 'py-3 px-7'}"
on:click={handleClick}>
    <span class="flex items-center w-full">
        <slot></slot>        
    </span>
</button>
