<script>
    import AccountsList from "./AccountsList.svelte";
    import AccountForm from "./AccountForm.svelte";
    import { sessionInfo } from "services/route-guard.js";
    import Button from "common/Button.svelte";
    import { SendHTTPrequest } from "services/api.js";
    import notificationStore from "components/NotificationStore.js";
    import ArchiveBox from "./ArchiveBox.svelte";

    export let rank = "";
    export let currentAccount = null;
    export let allAccounts = [];
    export let importFile = null;
    export let includeMediaInExport = true;
    export let includeMediaInImport = true;
    export let includeDocumentsInImport = true;
    export let includeAccountsInImport = true;

    sessionInfo.subscribe((value) => {
        rank = value.rank;
    });

    async function fileDeleter(){
        importFile = null;
    }

    async function fileConverter(event) {
        let file = event.detail ? event.detail : event;
        const blob = new Blob([file], { type: file.type });
        importFile = file;
    }

    async function uploadFileAPI() {
        if (importFile) {
            const data = new FormData();
            data.append("archive_file", importFile);
            if (data.getAll("archive_file").length > 0) {
                const response = await SendHTTPrequest({
                    endpoint: `/import/documents?import_images=${includeMediaInImport}&import_documents=${includeDocumentsInImport}`,
                    method: "POST",
                    data,
                });
                if (response.status === 200) {
                    notificationStore.set({
                        message: "Imported files successfully",
                        type: "SUCCESS",
                    });
                    importFile=null;
                } else if (response.status === 422 ){
                    notificationStore.set({
                        message: "Could not import files, there might be some duplicates in data.",
                        type: "ERROR",
                    });
                } else {
                    notificationStore.set({
                        message: "Could not import files.",
                        type: "ERROR",
                    });
                }
            } else {
                return [];
            }
        }
    }


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
    {#if rank === "admin"}
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

        <h1 class="mt-5">Import</h1>
        <ArchiveBox
            on:deleteFile={(file) => {
                fileDeleter(file);
            }}
            on:convertFile={(file) => {
                fileConverter(file);
            }}
        />
        <div class="my-5">
            <span on:click={() => uploadFileAPI()} class="my-2">
                <Button disabled={!importFile}>Import Documents</Button>
            </span> <br/>
            <label class="my-5 inline-flex items-baseline cursor-pointer">
                <input class="mx-2 checked:bg-blue-700" type="checkbox" bind:checked={includeDocumentsInImport} /> 
                <p>Include documents</p>
            </label>
            <label class="my-5 inline-flex items-baseline cursor-pointer">
                <input class="mx-2 checked:bg-blue-700" type="checkbox" bind:checked={includeMediaInImport} /> 
                <p>Include media files</p>
            </label>
        </div>
    {/if}
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
