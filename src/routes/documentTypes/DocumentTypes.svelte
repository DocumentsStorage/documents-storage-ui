<script>
    import DocumentTypesEditor from './DocumentTypesEditor.svelte';
    import DocumentTypesList from './DocumentTypesList.svelte';

    export let currentDocumentType = null;
    export let allDocumentTypes = null;
</script>

<div class="w-full mx-5 xl:mx-0 lg:w-1/2">

    <h1 class="mt-5">Document Types</h1>
    <div class="grid sm:grid-cols-4 gap-10">
        <div class="col-span-2">
            <DocumentTypesList bind:currentDocumentType bind:allDocumentTypes />
        </div>
        <div class="col-span-2">
            <DocumentTypesEditor bind:currentDocumentType bind:allDocumentTypes />
        </div>
    </div>
</div>
