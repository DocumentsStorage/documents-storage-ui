<script>
    import notificationStore from "components/NotificationStore.js";
    import ArchiveBox from "./ArchiveBox.svelte";
    import { SendHTTPrequest } from "services/api.js";
    import Button from "common/Button.svelte";

    export let rank = "user";
    export let documentsArchiveSet = false;
    export let accountsArchiveSet = false;
    export let importAccountsFile = null;
    export let importDocumentsFile = null;
    export let includeMediaInImport = true;
    export let includeDocumentsInImport = true;
    export let overwriteDocuments = false;

    async function fileDocumentsDeleter() {
        importDocumentsFile = null;
    }

    async function fileDocumentsConverter(event) {
        let file = event.detail ? event.detail : event;
        importDocumentsFile = file;
    }

    async function fileAccountsDeleter() {
        importAccountsFile = null;
    }

    async function fileAccountsConverter(event) {
        let file = event.detail ? event.detail : event;
        importAccountsFile = file;
    }

    async function uploadFileAPI(file, fileType = "documents") {
        const data = new FormData();
        data.append("archive_file", file);

        let url = "";
        if (fileType === "documents") {
            url = `/import/documents?import_images=${includeMediaInImport}&import_documents=${includeDocumentsInImport}&import_overwrite=${overwriteDocuments}`;
        } else if (fileType === "accounts") {
            url = "/import/accounts";
        }
        if (data.getAll("archive_file").length > 0) {
            const response = await SendHTTPrequest({
                endpoint: url,
                method: "POST",
                data,
            });
            if (response.status === 201) {
                notificationStore.set({
                    message:
                        fileType === "documents"
                            ? "Sent files to import documents, check notifications for more information"
                            : "Sent files to import accounts, check notifications for more information",
                    type: "SUCCESS",
                });
            } else {
                notificationStore.set({
                    message:
                        fileType === "documents"
                            ? "Could not start importing documents"
                            : "Could not start importing accounts",
                    type: "ERROR",
                });
            }
            accountsArchiveSet = false;
            documentsArchiveSet = false;
            importAccountsFile = null;
            importDocumentsFile = null;
        }
    }
</script>

<div class="my-5">
    <ArchiveBox
        fileName="Documents"
        bind:fileSet={documentsArchiveSet}
        on:deleteFile={(file) => {
            fileDocumentsDeleter(file);
        }}
        on:convertFile={(file) => {
            fileDocumentsConverter(file);
        }}
    />
    <div>
        <label class="inline-flex items-baseline cursor-pointer">
            <input
                class="mx-2 checked:bg-blue-700"
                type="checkbox"
                bind:checked={includeDocumentsInImport}
            />
            <p>Include documents</p>
        </label>
        <label class="my-5 inline-flex items-baseline cursor-pointer">
            <input
                class="mx-2 checked:bg-blue-700"
                type="checkbox"
                bind:checked={includeMediaInImport}
            />
            <p>Include media files</p>
        </label>
        <label class="my-5 inline-flex items-baseline cursor-pointer">
            <input
                class="mx-2 checked:bg-blue-700"
                type="checkbox"
                bind:checked={overwriteDocuments}
            />
            <p>Allow overwrite documents</p>
        </label> <br />
        <span on:click={() => uploadFileAPI(importDocumentsFile)} class="my-2">
            <Button disabled={!importDocumentsFile}>Import Documents</Button>
        </span>
    </div>
    {#if rank === "admin"}
        <div class="mt-10">
            <ArchiveBox
                bind:fileSet={accountsArchiveSet}
                fileName="Accounts"
                on:deleteFile={(file) => {
                    fileAccountsDeleter(file);
                }}
                on:convertFile={(file) => {
                    fileAccountsConverter(file);
                }}
            />
        </div>
        <div class="mt-7">
            <span on:click={() => uploadFileAPI(importAccountsFile, "accounts")} class="my-2">
                <Button disabled={!importAccountsFile}>Import Accounts</Button>
            </span> <br />
        </div>
    {/if}
</div>
