<script>
    import ActionsModal from '../../components/ActionsModal.svelte';
    import notificationStore from '../../components/NotificationStore.js';
    import { SendHTTPrequest } from '../../services/api';
    import { onMount } from 'svelte';
  
    export let allDocumentTypes;
    export let currentDocumentType;
    export let modalConfig = {
        show: false,
        title: '',
        message: '',
        cancelAction: '',
        proceedAction: '',
        callback: null
    };
    
    onMount(async () => {
        const response = await SendHTTPrequest({
          endpoint: '/document_types',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        allDocumentTypes = response.data;
	});

    async function deleteDocumentType() {
        modalConfig.show = false;
        const response = await SendHTTPrequest({
            endpoint: `/document_types/${currentDocumentType._id.$oid}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            notificationStore.set({
                message: 'Document type has been deleted',
                type: 'SUCCESS'
            });
            allDocumentTypes = allDocumentTypes.filter((documentType) => documentType._id.$oid !== currentDocumentType._id.$oid);
        } else if (response.status === 404) {
            notificationStore.set({
                message: 'Not found document type',
                type: 'ERROR'
            });
        }
    }

    function startDeleteDocumentType() {
        modalConfig = {
            show: true,
            title: `Delete ${currentDocumentType.title} document type`,
            message:
                'This action is irreversible. Document type will be deleted, documents build with this type will persist.',
            cancelAction: 'Cancel',
            proceedAction: 'Delete',
            callback: deleteDocumentType
        };
    }
</script>

<div class="rounded-md shadow-lg">
    <ul class="mt-5">
        {#each allDocumentTypes as documentType}
            <li class="dark:bg-gray-600 rounded mt-5 p-2 flex items-center">
                <!-- Stacked -->
                <div class="w-1/3 ml-2">
                    <p>{documentType.title}</p>
                    <small>{documentType.description.length > 15 ? documentType.description.slice(0,15) + '...' : documentType.description}</small>
                </div>
                <!-- Inline -->
                <div class="mx-5 flex">
                    <span
                        class="flex items-center pl-5 dark:text-white text-black hover:text-red-500"
                        on:click={() => {
                            currentDocumentType = documentType;
                            // TODO:
                            startDeleteDocumentType();
                        }}
                        ><i class="ph-file-minus mx-2" />
                        Delete</span
                    >

                    <span
                        class="flex items-center pl-5 dark:text-white text-black"
                        on:click={() => {
                            currentDocumentType = documentType;
                        }}
                    >
                    <i class="ph-pencil-simple mx-2" />Update
                        </span
                    >
                </div>
            </li>
        {/each}
    </ul>
</div>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />

<style>
    span {
        cursor: pointer;
        transition-duration: 0.2s;
    }
</style>