<script>
    import AccountsList from "./AccountsList.svelte";
    import AccountForm from "./AccountForm.svelte";
    import { sessionInfo } from "services/route-guard.js";
    import ExportFiles from "./ExportFiles.svelte";
    import ImportFiles from "./ImportFiles.svelte";

    export let rank = "";
    export let currentAccount = null;
    export let allAccounts = [];

    sessionInfo.subscribe((value) => {
        rank = value.rank;
    });
</script>

<div class="w-full mx-5 xl:mx-0 lg:w-1/2">
    <h1 class="mt-7">Export</h1>
    <ExportFiles {rank} />
    <h1 class="mt-10">Import</h1>
    <ImportFiles {rank} />
    {#if rank === "admin"}
        <h1 class="mt-24">Manage Accounts</h1>
        <div class="grid sm:grid-cols-4 gap-10">
            <div class="col-span-2">
                <AccountsList bind:currentAccount bind:allAccounts />
            </div>
            <div class="col-span-2">
                <AccountForm bind:currentAccount bind:allAccounts />
            </div>
        </div>
    {/if}
</div>
