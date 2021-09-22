<script>
    import { Link } from 'svelte-routing';
    import Button from 'common/Button.svelte';

    import DocumentsEditor from './DocumentsEditor.svelte';
    import DocumentsList from './DocumentsList.svelte';

    export let currentDocument = null;
    export let allDocuments = null;
</script>

<div class="w-full mx-5 xl:mx-0 xl:w-1/2">
    <div class="flex items-center mt-5">
        <h1 class="text-2xl mr-5">Documents</h1>
        <Link to="/document-types"><Button>Document types</Button></Link>
    </div>
    <div class="grid sm:grid-cols-4 gap-5 sm:gap-20 md:gap-10">
        <div class="col-span-2">
            <DocumentsList bind:currentDocument bind:allDocuments />
        </div>
        <div class="col-span-2">
            <DocumentsEditor bind:currentDocument bind:allDocuments />
        </div>
    </div>
</div>
