<script>
    import ActionsModal from "../../components/ActionsModal.svelte";
    import notificationStore from "../../components/NotificationStore.js";
    import { SendHTTPrequest } from "../../services/api";
    import { onMount } from "svelte";

    export let allDocuments;
    export let currentDocument;
    export let modalConfig = {
        show: false,
        title: "",
        message: "",
        cancelAction: "",
        proceedAction: "",
        callback: null,
    };

    onMount(async () => {
        const response = await SendHTTPrequest({
            endpoint: "/documents",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        allDocuments = response.data.map((document)=> {
            document.media_files = document.media_files?.map((uuid) => uuid["$uuid"]);
            return document
        })
    });

    async function deleteDocument() {
        modalConfig.show = false;
        const response = await SendHTTPrequest({
            endpoint: `/documents/${currentDocument._id.$oid}`,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status === 200) {
            notificationStore.set({
                message: `Document type has been deleted`,
                type: "SUCCESS",
            });
            allDocuments = allDocuments.filter(
                (documentType) =>
                    documentType._id.$oid !== currentDocument._id.$oid
            );
        } else if (response.status === 404) {
            notificationStore.set({
                message: `Not found document`,
                type: "ERROR",
            });
        }
    }

    function startDeleteDocument() {
        modalConfig = {
            show: true,
            title: `Delete ${currentDocument.title} document`,
            message:
                "This action is irreversible. Document will be deleted with all uploaded media files.",
            cancelAction: "Cancel",
            proceedAction: "Delete",
            callback: deleteDocument,
        };
    }
</script>

<div class="rounded-md shadow-lg">
    <ul class="mt-5">
        {#if allDocuments.length > 0}
            {#each allDocuments as documentType}
                <li class="dark:bg-gray-600 rounded mt-5 p-2 flex items-center">
                    <!-- Stacked -->
                    <div class="w-1/3 ml-2">
                        <p>{documentType.title}</p>
                        <small
                            >{documentType.description.length > 15
                                ? documentType.description.slice(0, 15) + "..."
                                : documentType.description}</small
                        >
                    </div>
                    <!-- Inline -->
                    <div class="mx-5 flex">
                        <span
                            class="flex items-center pl-5 dark:text-white text-black hover:text-red-500"
                            on:click={() => {
                                currentDocument = documentType;
                                startDeleteDocument();
                            }}
                            ><i class="ph-file-minus mx-2" />
                            Delete</span
                        >

                        <span
                            class="flex items-center pl-5 dark:text-white text-black"
                            on:click={() => {
                                currentDocument = documentType;
                            }}
                        >
                            Select
                        </span>
                    </div>
                </li>
            {/each}
        {/if}
    </ul>
</div>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />

<style>
    span {
        cursor: pointer;
        transition-duration: 0.2s;
    }
</style>
