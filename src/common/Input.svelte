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
    
    const handleKeyUp = (e) => {
        value = e.target.value;
        dispatch('keyup', e);
    };
</script>

<input {name} {type} {placeholder} {value} step="any" class={classList} 
    on:input={handleInput} on:keyup={handleKeyUp} 
    on:focus={(e)=>{dispatch('focus', e)}}
    on:focusout={(e)=>{dispatch('focusout', e)}}
    />
