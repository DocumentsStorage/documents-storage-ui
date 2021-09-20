<script>
	import { Link } from 'svelte-routing';
	import Button from 'common/Button.svelte';

    import DocumentsEditor from './DocumentsEditor.svelte';
    import DocumentsList from './DocumentsList.svelte';

    export let currentDocument = null;
    export let allDocuments = [];
</script>

<div>
    <h1 class="text-2xl">Documents</h1>
    <Link to="/document-types"><Button>Document types</Button></Link>
    <div class="grid grid-flow-row md:grid-flow-col gap-10">
        <DocumentsList bind:currentDocument bind:allDocuments />
        <DocumentsEditor bind:currentDocument bind:allDocuments />
    </div>
</div>
