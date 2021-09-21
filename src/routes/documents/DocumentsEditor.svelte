<script>
    import { createForm } from "svelte-forms-lib";
    import * as yup from "yup";
    import { SendHTTPrequest } from "services/api.js";
    import notificationStore from "components/NotificationStore.js";
    import Button from "common/Button.svelte";
    import Input from "common/Input.svelte";
    import MediaFilesBox from "./MediaFilesBox.svelte";
    import generatePdfThumbnails from "pdf-thumbnails-generator";
    import { onMount } from "svelte";
    import ActionsModal from 'components/ActionsModal.svelte';

    export let allDocuments;
    export let documentTypesList = [];
    export let currentDocumentType = "";
    export let currentDocument = null;
    export let mediaThumbnailsList = [];
    export let mediaFilesList = [];
    export let deletedMediaIds = [];
    export let modalConfig = {
        show: false,
        title: "",
        message: "",
        cancelAction: "",
        proceedAction: "",
        callback: null,
    };

    $: currentDocumentType;

    function parseFieldTypeToHTMLType(value) {
        const type = typeof value;
        switch (type) {
            case "string":
                return "text";
            // Currently only object saved in db is date object
            case "object":
                return "date";
            case "number":
                return "number";
        }
    }

    function InputChangeValue(e) {
        $form.fields[e.detail.index].value = e.detail.value;
    }

    function resetForm() {
        $form.title = null;
        $form.description = "";
        $form.fields = [
            {
                name: "",
                value: "",
                valueType: "text",
            },
        ];
        for (const mediaBlob of mediaThumbnailsList) {
            URL.revokeObjectURL(mediaBlob);
        }
        currentDocumentType = "";
        mediaFilesList = [];
        mediaThumbnailsList = [];
    }

    $: currentDocument, loadDocument();

    onMount(async () => {
        const result = await SendHTTPrequest({
            endpoint: "/document_types",
            method: "GET",
        });
        documentTypesList = result.data;
    });

    async function createThumbnailPDF(blob) {
        try {
            const thumbnails = await generatePdfThumbnails(blob, 120);
            return thumbnails[0];
        } catch (err) {
            console.log(err);
        }
    }

    async function createThumbnail(blob, id) {
        if (blob.type === "application/pdf") {
            const temp_url = URL.createObjectURL(blob);
            const thumbnail = await createThumbnailPDF(temp_url);
            const base64Response = await fetch(thumbnail.thumbnail);
            blob = await base64Response.blob();
        }
        const url = URL.createObjectURL(blob);
        mediaThumbnailsList = [...mediaThumbnailsList, { url, id }];
    }

    async function mediaConverter(event) {
        let file;
        event.detail ? (file = event.detail) : (file = event);
        const blob = new Blob([file], { type: file.type });
        mediaFilesList = [...mediaFilesList, { file }];
        await createThumbnail(blob);
    }

    async function loadMediaFiles(media_files) {
        return Promise.all(
            await media_files.map(async (media_id) => {
                const result = await SendHTTPrequest({
                    endpoint: `/media/${media_id}`,
                    method: "GET",
                });
                return { file: result.data, id: media_id };
            })
        );
    }

    async function loadDocument() {
        resetForm();
        if (currentDocument) {
            const medias = await loadMediaFiles(currentDocument.media_files);
            mediaFilesList = medias;
            for await (const media of medias) {
                const response = await fetch(media.file);
                const data = await response.blob();
                const blob = new Blob([data], {
                    type: response.headers.get("content-type"),
                });
                createThumbnail(blob, media.id);
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
                    const valueType = parseFieldTypeToHTMLType(element.value);
                    if (typeof element.value === "object") {
                        element.value = new Date(element.value["$date"])
                            .toISOString()
                            .split("T")[0];
                    }
                    $form.fields.push({
                        name: element.name,
                        value: element.value,
                        valueType,
                    });
                }
            }
        }
    }

    async function uploadFilesAPI() {
        if (mediaFilesList.length > 0) {
            const data = new FormData();
            for (let i = 0; i < mediaFilesList.length; i++) {
                if (!mediaFilesList[i].id) {
                    const file = mediaFilesList[i].file;
                    data.append("media_files", file, file.name);
                }
            }
            if (data.getAll("media_files").length > 0) {
                const response = await SendHTTPrequest({
                    endpoint: "/media",
                    method: "POST",
                    data,
                });
                if (response.status === 201) {
                    return response.data.ids;
                }
            } else {
                return [];
            }
        }
        return [];
    }

    async function deleteFilesAPI() {
        if (deletedMediaIds.length > 0) {
            let query = "/media?";
            for (let index = 0; index < deletedMediaIds.length; index++) {
                const id = deletedMediaIds[index];
                if (index != 0) {
                    query += "&";
                }
                query += "media_files_ids=" + id;
            }
            const response = await SendHTTPrequest({
                endpoint: query,
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                data: deletedMediaIds,
            });
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async function updateDocumentAPI(documentData) {
        let data = { ...documentData };

        // Delete files
        await deleteFilesAPI();

        // Add new files
        const newMediaFilesIDs = await uploadFilesAPI();

        let updatedMediaIDs = mediaThumbnailsList.map(file=> file.id)
        updatedMediaIDs = updatedMediaIDs.filter((id) => id !== undefined)

        updatedMediaIDs = [...updatedMediaIDs, ...newMediaFilesIDs];

        data = {
            ...data,
            media_files: updatedMediaIDs
        };

        const response = await SendHTTPrequest({
            endpoint: `/documents/${data._id.$oid}`,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            data,
        });
        if (response.status === 200) {
            notificationStore.set({
                message: "Updated successfully.",
                type: "SUCCESS",
            });
            const index = allDocuments.findIndex((document) => document._id.$oid === currentDocument._id.$oid)
            allDocuments[index] = data
            allDocuments = allDocuments
        } else if (response.status > 400 && response.status < 500) {
            notificationStore.set({
                message: "Could not update document.",
                type: "ERROR",
            });
        }
    }

    async function createDocumentAPI(documentData) {
        let data = { ...documentData };
        const mediaFilesIDs = await uploadFilesAPI();
        if (mediaFilesIDs !== null) {
            data = { ...data, media_files: mediaFilesIDs };
        }
        const response = await SendHTTPrequest({
            endpoint: "/documents",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            data,
        });
        if (response.status === 201) {
            notificationStore.set({
                message: "Added successfully.",
                type: "SUCCESS",
            });
            // documentData.fields = documentData.fields.map((field) => {
            //     const valueType = parseFieldTypeToHTMLType(field.value);
            //     if (typeof field.value === "object") {
            //         field.value = new Date(field.value["$date"])
            //             .toISOString()
            //             .split("T")[0];
            //     }
            //     field.valueType = valueType;
            //     return field;
            // });
            allDocuments.push({
                _id: { $oid: response.data.id.$oid },
                ...documentData,
                media_files: mediaFilesIDs,
            });
            allDocuments = allDocuments;
            currentDocument = null
            resetForm()
        } else if (response.status > 400 && response.status < 500) {
            notificationStore.set({
                message: "Could not add document.",
                type: "ERROR",
            });
        }
    }

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
                message: "Document has been deleted",
                type: "SUCCESS",
            });
            allDocuments = allDocuments.filter(
                (documentType) =>
                    documentType._id.$oid !== currentDocument._id.$oid
            );
            currentDocument = null
            resetForm()
        } else if (response.status === 404) {
            notificationStore.set({
                message: "Not found document",
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

    function changeDocumentType(event) {
        if (event.target.value === "none") {
            $form.fields = [
                {
                    name: "",
                    value: "",
                    valueType: "text",
                },
            ];
        } else {
            const documentType = documentTypesList.find(
                (documentType) => documentType.title == event.target.value
            );
            const fields = documentType.fields.map((field) => {
                return {
                    name: field.name,
                    value: "",
                    valueType: field.value_type,
                };
            });
            $form.fields = fields;
        }
    }

    const {
        form,
        errors,
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
                    valueType: "text",
                },
            ],
        },
        validationSchema: yup.object().shape({
            title: yup.string().min(1).required("Title field is required"),
            description: yup.string().nullable(),
            fields: yup.array().of(
                yup.object().shape({
                    name: yup.string().required("Name of field is required"),
                    value: yup.string().required("Value for field is required"),
                })
            ),
        }),
        onSubmit: async (values) => {
            values.fields = values.fields.map((field) => {
                if (field.valueType === "date") {
                    const date = new Date(field.value);
                    field.value = date.toISOString();
                }
                return field;
            });
            if (!currentDocument) {
                await createDocumentAPI(values);
            } else {
                await updateDocumentAPI({
                    _id: {$oid: currentDocument._id.$oid},
                    ...values,
                });
            }
        },
    });

    export const addField = () => {
        $form.fields = $form.fields.concat({ name: "", value: "" });
        $errors.fields = $errors.fields.concat({ name: "", value: "" });
    };

    export const removeField = (i) => () => {
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
                class="ph-x mr-2"
            />
        {/if}
    </div>
    <label class="my-2" for="documentType">Document Type</label>
    <select
        name="documentType"
        bind:value={currentDocumentType}
        on:change={changeDocumentType}
        class="dark:bg-gray-900 font-bold px-2 my-1"
    >
        <option value="none" />
        {#each documentTypesList as documentType}
            <option value={documentType.title}>{documentType.title}</option>
        {/each}
    </select>
    {#if currentDocument}
        <span
            class="flex items-center pl-5 dark:text-white text-black hover:text-red-500 cursor-pointer"
            on:click={() => {
                startDeleteDocument();
            }}
            ><i class="ph-file-minus mx-2" />
            Delete</span
        >
    {/if}
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
        bind:deletedMediaIds
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
                <Input
                    index={j}
                    name={`fields[${j}].value`}
                    value={field.value}
                    type={field.valueType}
                    placeholder={field.name + " value"}
                    on:change={handleChange}
                    on:blur={handleChange}
                    on:changeValue={InputChangeValue}
                />
            </div>
            <small class="h-4 inline-block">
                {#if $errors.fields[j]?.value}
                    {$errors.fields[j]?.value}
                {/if}
            </small>
        </div>

        {#if j === $form.fields.length - 1}
            <span on:click={addField}><Button>Add Field</Button></span>
        {/if}
        {#if $form.fields.length !== 1}
            <span on:click={removeField(j)}><Button>Remove field</Button></span>
        {/if}
    {/each}

    <input
        type="submit"
        class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
        value={currentDocument ? "Update" : "Add"}
    />
</form>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />

