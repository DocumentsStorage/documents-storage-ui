<script>
    import { SendHTTPrequest } from 'services/api.js';
    import { onMount } from 'svelte';

    export let allAccounts = [];
    export let currentAccount = null;


    onMount(async () => {
        const response = await SendHTTPrequest({
            endpoint: '/accounts/list?limit=20',
            method: 'GET'
        });
        if (response.status === 200) {
            allAccounts = response.data;
        }
    });
</script>

<div class="w-full rounded-md shadow-lg">
    <h1 class="text-xl">Accounts</h1>
    <ul class="mt-5">
        {#each allAccounts as account}
            <li class="dark:bg-gray-600 rounded mt-5 p-2 flex items-center">
                <!-- Stacked -->
                <div class="w-24 ml-2">
                    <p>{account.username}</p>
                    <small>{account.rank}</small>
                </div>
                <!-- Inline -->
                <div class="w-full flex justify-end mr-5">
                    <span
                        class="flex items-center pl-5 dark:text-white text-black"
                        on:click={() => {
                            currentAccount = account;
                        }}
                    >Select
                        </span
                    >
                </div>
            </li>
        {/each}
    </ul>
</div>

<style>
    span {
        cursor: pointer;
        transition-duration: 0.2s;
    }
</style>
