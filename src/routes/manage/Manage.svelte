<script>
    import AccountsList from './manage-accounts/AccountsList.svelte';
    import AccountForm from './manage-accounts/AccountForm.svelte';
    export let currentAccount = null;
    export let allAccounts = [];

</script>

<div>
    <h1 class="text-2xl">Manage</h1>
    <div class="grid grid-flow-row md:grid-flow-col gap-10">
        <AccountsList bind:currentAccount={currentAccount} bind:allAccounts={allAccounts}/>
        <AccountForm bind:currentAccount={currentAccount} bind:allAccounts={allAccounts}/>
    </div>
</div>
