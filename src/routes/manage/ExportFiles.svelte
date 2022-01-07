<script>
    import notificationStore from "components/NotificationStore.js";
    import { SendHTTPrequest } from "services/api.js";
    import Button from "common/Button.svelte";

    export let rank = 'user';
    export let includeMediaInExport = true;

    async function startExportAccounts() {
        const response = await SendHTTPrequest({
            endpoint: "/export/accounts",
            method: "POST",
        });
        if (response.status === 200) {
            notificationStore.set({
                message:
                    "Successfully started exporting accounts, You will be notified after process will end.",
                type: "SUCCESS",
            });
        } else {
            notificationStore.set({
                message: "Couldn't start exporting accounts, try again later.",
                type: "ERROR",
            });
        }
    }

    async function startExportDocuments() {
        const response = await SendHTTPrequest({
            endpoint: `/export/documents?include_media=${includeMediaInExport}`,
            method: "POST",
        });
        if (response.status === 200) {
            notificationStore.set({
                message:
                    "Successfully started exporting documents, You will be notified after process will end.",
                type: "SUCCESS",
            });
        } else {
            notificationStore.set({
                message: "Couldn't start exporting documents, try again later.",
                type: "ERROR",
            });
        }
    }
</script>
{#if rank === 'admin'}
    <div class="my-5">
        <span on:click={() => startExportAccounts()}>
            <Button>Export Accounts</Button>
        </span>
    </div>
{/if}
<div class="my-5">
    <span on:click={() => startExportDocuments()} class="my-2">
        <Button>Export Documents</Button>
    </span> <br />
    <label class="my-5 inline-flex items-baseline cursor-pointer">
        <input
            class="mx-2 checked:bg-blue-700"
            type="checkbox"
            bind:checked={includeMediaInExport}
        />
        <p>Include media files</p>
    </label>
</div>
