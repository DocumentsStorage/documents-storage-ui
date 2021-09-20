<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let index;
    export let classList = 'w-full dark:bg-gray-900 font-bold px-2 my-1';
    export let name = '';
    export let value = '';
    export let placeholder = '';
    export let type = 'text';

    const handleInput = (e) => {
        value = e.target.value;
        dispatch('changeValue', {value: e.target.value, index});
    };
</script>

<input {name} {type} {placeholder} {value} class={classList}  on:input={handleInput} />
