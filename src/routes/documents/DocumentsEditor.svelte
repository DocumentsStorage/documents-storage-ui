<script>
    import { createForm } from "svelte-forms-lib";
    import * as yup from "yup";
    import { SendHTTPrequest } from "../../services/api";
    import notificationStore from "../../components/NotificationStore.js";
    import Button from "../../common/Button.svelte";
    import MediaFilesBox from "./MediaFilesBox.svelte";
    import generatePdfThumbnails from "pdf-thumbnails-generator";

    export let allDocuments;
    export let currentDocument = null;
    export let mediaThumbnailsList = [];
    export let mediaFilesList = [];

    function resetForm() {
        $form.title = null;
        $form.description = null;
        $form.fields = [
            {
                name: "xxx",
                value: "",
            },
        ];
        for (const mediaBlob of mediaThumbnailsList) {
            URL.revokeObjectURL(mediaBlob);
        }
        mediaFilesList = [];
        mediaThumbnailsList = [];
    }

    $: currentDocument, loadDocument();

    async function createThumbnailPDF(blob) {
        try {
            const thumbnails = await generatePdfThumbnails(blob, 120);
            return thumbnails[0];
        } catch (err) {
            // console.error(err);
        }
    }

    async function createThumbnail(blob) {
        if (blob.type === "application/pdf") {
            const temp_url = URL.createObjectURL(blob);
            const thumbnail = await createThumbnailPDF(temp_url);
            const base64Response = await fetch(thumbnail.thumbnail);
            blob = await base64Response.blob();
        }
        const url = URL.createObjectURL(blob);
        mediaThumbnailsList = [...mediaThumbnailsList, url];
    }

    async function mediaConverter(event) {
        let file;
        event.detail ? (file = event.detail) : (file = event);
        var blob = new Blob([file], { type: file.type });
        mediaFilesList = [...mediaFilesList, file];
        await createThumbnail(blob);
    }

    async function loadMediaFiles(media_files) {
        return Promise.all(
            await media_files.map(async (media_id) => {
                const result = await SendHTTPrequest({
                    endpoint: `/media/${media_id}`,
                    method: "GET",
                });
                return result.data;
            })
        );
    }

    async function loadDocument() {
        resetForm();
        if (currentDocument) {
            const blob_urls = await loadMediaFiles(currentDocument.media_files);
            mediaFilesList = blob_urls;
            for await (const blob_url of blob_urls) {
                const response = await fetch(blob_url);
                const data = await response.blob();
                const blob = new Blob([data], {
                    type: response.headers.get("content-type"),
                });
                createThumbnail(blob);
            }
            if (currentDocument.fields.length > 0) {
                $form.title = currentDocument.title;
                $form.description = currentDocument.description;
                $form.fields = [];
                for (
                    let index = 0;
                    index < currentDocument.fields.length;
                    index++
                ) {
                    const element = currentDocument.fields[index];
                    $form.fields.push({
                        name: element.name,
                        value: element.value,
                    });
                }
            }
        }
    }

    async function uploadFilesAPI() {
        var data = new FormData();
        for (var i = 0; i < mediaFilesList.length; i++) {
            var file = mediaFilesList[i];
            data.append("media_files", file, file.name);
        }
        const response = await SendHTTPrequest({
            endpoint: "/media",
            method: "POST",
            data: data,
        });
        if (response.status === 200) {
            return response.data.ids;
        }
    }

    async function updateDocumentAPI(documentData) {
        const mediaFilesIDs = await uploadFilesAPI();
        const response = await SendHTTPrequest({
            endpoint: "/documents",
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            data: documentData,
        });
        if (response.status === 200) {
            notificationStore.set({
                message: "Updated successfully.",
                type: "SUCCESS",
            });
            allDocuments.push({
                _id: { $oid: response.data.id.$oid },
                ...documentData,
            });
            allDocuments = allDocuments;
        } else if (response.status > 400 && response.status < 500) {
            notificationStore.set({
                message: "Could not update document.",
                type: "ERROR",
            });
        }
    }

    async function createDocumentAPI(documentData) {
        const mediaFilesIDs = await uploadFilesAPI();
        const response = await SendHTTPrequest({
            endpoint: "/documents",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            data: { ...documentData, media_files: mediaFilesIDs },
        });
        if (response.status === 200) {
            notificationStore.set({
                message: "Added successfully.",
                type: "SUCCESS",
            });
            allDocuments.push({
                _id: { $oid: response.data.id.$oid },
                ...documentData,
                media_files: mediaFilesIDs,
            });
            allDocuments = allDocuments;
        } else if (response.status > 400 && response.status < 500) {
            notificationStore.set({
                message: "Could not add document.",
                type: "ERROR",
            });
        }
    }

    const {
        form,
        errors,
        state,
        handleChange,
        handleSubmit: handleDocumentSubmit,
    } = createForm({
        initialValues: {
            title: "",
            description: "",
            fields: [
                {
                    name: "",
                    value: "",
                },
            ],
        },
        validationSchema: yup.object().shape({
            title: yup.string().min(1).required("Title field is required"),
            description: yup.string(),
            fields: yup.array().of(
                yup.object().shape({
                    name: yup.string().required("Name of field is required"),
                    value: yup.string().required("Value for field is required"),
                })
            ),
        }),
        onSubmit: async (values) => {
            if (!currentDocument) {
                await createDocumentAPI(values);
            } else {
                await updateDocumentAPI({
                    id: currentDocument._id.$oid,
                    ...values,
                });
            }
        },
    });

    export const add = () => {
        $form.fields = $form.fields.concat({ name: "", value: "" });
        $errors.fields = $errors.fields.concat({ name: "", value: "" });
    };

    export const remove = (i) => () => {
        $form.fields = $form.fields.filter((u, j) => j !== i);
        $errors.fields = $errors.fields.filter((u, j) => j !== i);
    };
</script>

<form on:submit={handleDocumentSubmit} class="grid gap-7 grid-cols-3 my-5">
    <div class="w-full col-span-3 flex justify-between">
        <h1 class="text-2xl">
            {#if currentDocument}
                Update document
            {:else}
                Add document
            {/if}
        </h1>
        {#if currentDocument}
            <i
                on:click={() => {
                    currentDocument = null;
                    resetForm();
                }}
                class="ph-x"
            />
        {/if}
    </div>

    <!-- TODO: Add document type selector -->

    <div class="col-span-3">
        <label class="my-2" for="title">Title</label>
        <input
            id="title"
            name="title"
            class="w-full dark:bg-gray-900 font-bold px-2"
            on:change={handleChange}
            bind:value={$form.title}
        />
    </div>
    <small class="col-span-3 h-3">
        {#if $errors.title}
            {$errors.title}
        {/if}
    </small>

    <div class="col-span-3">
        <label class="my-2" for="description">Description</label>
        <input
            id="description"
            name="description"
            class="w-full dark:bg-gray-900 font-bold px-2"
            on:change={handleChange}
            bind:value={$form.description}
        />
    </div>
    <small class="col-span-3 h-5">
        {#if $errors.description}
            {$errors.description}
        {/if}
    </small>

    <MediaFilesBox
        bind:mediaThumbnailsList
        bind:mediaFilesList
        on:convertMedia={(file) => {
            mediaConverter(file);
        }}
    />

    <h1 class="text-2xl col-span-3">Fields</h1>

    {#each $form.fields as field, j}
        <div class="col-span-3 mt-5">
            <div>
                <input
                    name={`fields[${j}].name`}
                    placeholder="Field name"
                    class="w-full dark:bg-gray-900 font-bold px-2 my-1"
                    on:change={handleChange}
                    on:blur={handleChange}
                    bind:value={$form.fields[j].name}
                />
            </div>
            <small class="h-4 inline-block">
                {#if $errors.fields[j]?.name}
                    {$errors.fields[j]?.name}
                {/if}
            </small>

            <div class="col-span-3">
                <input
                    name={`fields[${j}].value`}
                    placeholder="Field value"
                    class="w-full dark:bg-gray-900 font-bold px-2 my-1"
                    on:change={handleChange}
                    on:blur={handleChange}
                    bind:value={$form.fields[j].value}
                />
            </div>
            <small class="h-4 inline-block">
                {#if $errors.fields[j]?.value}
                    {$errors.fields[j]?.value}
                {/if}
            </small>
        </div>

        {#if j === $form.fields.length - 1}
            <span on:click={add}><Button>Add Field</Button></span>
        {/if}
        {#if $form.fields.length !== 1}
            <span on:click={remove(j)}><Button>Remove field</Button></span>
        {/if}
    {/each}

    <input
        type="submit"
        class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
        value={currentDocument ? "Update" : "Add"}
    />
</form>
