<script>
    import AccountsList from './AccountsList.svelte';
    import AccountForm from './AccountForm.svelte';
    export let currentAccount = null;
    export let allAccounts = [];
    
</script>

<div class="w-full mx-5 xl:mx-0 lg:w-1/2">
    <h1 class="text-2xl mt-5">Manage Accounts</h1>
    <div class="grid sm:grid-cols-4 gap-10">
        <div class="col-span-2">
            <AccountsList bind:currentAccount={currentAccount} bind:allAccounts={allAccounts}/>
        </div>
        <div class="col-span-2">
            <AccountForm bind:currentAccount={currentAccount} bind:allAccounts={allAccounts}/>
        </div>
    </div>
</div>
