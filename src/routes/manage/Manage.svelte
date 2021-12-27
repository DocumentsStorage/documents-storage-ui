<script>
    import AccountsList from "./AccountsList.svelte";
    import AccountForm from "./AccountForm.svelte";
    import { sessionInfo } from "services/route-guard.js";
    import Button from "common/Button.svelte";
    import { SendHTTPrequest } from "services/api.js";
    import notificationStore from "components/NotificationStore.js";

    export let rank = "";
    export let currentAccount = null;
    export let allAccounts = [];
    export let includeMediaInExport = true;

    sessionInfo.subscribe((value) => {
        rank = value.rank;
    });

    async function startExportAccounts() {
        const response = await SendHTTPrequest({
            endpoint: "/export/accounts",
            method: "POST",
        });
        if(response.status === 200){
            notificationStore.set({
          		message: "Successfully started exporting accounts, You will be notified after process will end.",
          		type: 'SUCCESS'
        	})
        } else {
            notificationStore.set({
          		message: "Couldn't start exporting accounts, try again later.",
          		type: 'ERROR'
        	})
        }
    }

    async function startExportDocuments() {
        console.log(includeMediaInExport)
        const response = await SendHTTPrequest({
            endpoint: `/export/documents?include_media=${includeMediaInExport}`,
            method: "POST",
        });
        if(response.status === 200){
            notificationStore.set({
          		message: "Successfully started exporting documents, You will be notified after process will end.",
          		type: 'SUCCESS'
        	})
        } else {
            notificationStore.set({
          		message: "Couldn't start exporting documents, try again later.",
          		type: 'ERROR'
        	})
        }
    }
</script>

<div class="w-full mx-5 xl:mx-0 lg:w-1/2">
    <h1 class="mt-5">Export</h1>
    <div class="my-5">
        <span on:click={() => startExportDocuments()} class="my-2">
            <Button>Export Documents</Button>
        </span> <br/>
        <label class="my-5 inline-flex items-baseline cursor-pointer">
            <input class="mx-2 checked:bg-blue-700" type="checkbox" bind:checked={includeMediaInExport} /> 
            <p> Include media files</p>
        </label>
    </div>
    {#if rank === "admin"}
        <div class="my-5">
            <span on:click={() => startExportAccounts()}>
                <Button>Export Accounts</Button>
            </span>
        </div>
        <h1 class="mt-5">Manage Accounts</h1>
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
