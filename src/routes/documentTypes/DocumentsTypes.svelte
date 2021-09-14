<script>
    import DocumentTypesEditor from "./DocumentTypesEditor.svelte";
    import DocumentTypesList from "./DocumentTypesList.svelte";

    export let currentDocumentType = null;
    export let allDocumentTypes = [];
</script>

<div>
    <h1 class="text-2xl">Document Types</h1>
    <div class="grid grid-flow-row md:grid-flow-col gap-10">
        <DocumentTypesList bind:currentDocumentType bind:allDocumentTypes />
        <DocumentTypesEditor bind:currentDocumentType bind:allDocumentTypes />
    </div>
</div>
