<script>
    import { FileMinus, Minus, Plus, X } from "phosphor-svelte";
    import { createForm } from "svelte-forms-lib";
    import * as yup from "yup";
    import { SendHTTPrequest } from "services/api.js";
    import notificationStore from "components/NotificationStore.js";
    import Input from "common/Input.svelte";
    import MediaFilesBox from "./MediaFilesBox.svelte";
    import generatePdfThumbnails from "pdf-thumbnails-generator";
    import { onMount } from "svelte";
    import ActionsModal from "components/ActionsModal.svelte";
    import Button from "common/Button.svelte";
    import InputHints from "common/InputHints.svelte";

    export let allDocuments;
    export let documentTypesList = [];
    export let allTags = [];
    export let currentDocumentType = "";
    export let currentDocument = null;
    export let editTitle = false;
    export let hint = {index: null, hints: []}

    export let mediaThumbnailsList = [];
    export let mediaFilesList = [];
    export let deletedMediaIds = [];
    let haveClickedHint

    export let modalConfig = {
        show: false,
        title: "",
        message: "",
        cancelAction: "",
        proceedAction: "",
    };

    $: currentDocumentType;
    $: currentDocument, loadDocument();

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

    async function getHints(search_text, index) {
        if(search_text.length > 0){
            const response = await SendHTTPrequest({
            endpoint: `/documents/autofill?search_text=${search_text}&results_for=field`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            });
            if (response.status === 200) {
                hint = {
                    index,
                    hints: response.data.autofill
                }
            } else {
                hint = {index: null, hints: []}
            }
        } else {
            hint = {index: null, hints: []}
        }
    }

    function toggleEditTitle(){
        if (editTitle) {
            $form.title = ""
        }
        editTitle = !editTitle
    }

    function resetForm() {
        $form.title = "";
        $form.description = "";
        $form.tags = [];
        $form.fields = [
            {
                name: "",
                value: "",
                valueType: "text",
            },
        ];
        
        $errors.title = "";
        $errors.description = "";
        $errors.fields = [{}];

        for (const mediaBlob of mediaThumbnailsList) {
            URL.revokeObjectURL(mediaBlob);
        }
        currentDocumentType = "";
        mediaFilesList = [];
        mediaThumbnailsList = [];
        const top_of_document = document.getElementById('top_of_document')
        if(top_of_document){
            top_of_document.focus();
            window.scrollTo({
                left: top_of_document.getBoundingClientRect().left + window.scrollX,
                top: top_of_document.getBoundingClientRect().top + window.scrollY,
                behavior: "smooth"
            });
        }
    }


    onMount(async () => {
        let result = await SendHTTPrequest({
            endpoint: "/document_types",
            method: "GET",
        });
        documentTypesList = result.data;

        result = await SendHTTPrequest({
            endpoint: "/tags/list",
            method: "GET",
        });
        allTags = result.data.tags;
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
        let file = event.detail ? event.detail : event;
        const blob = new Blob([file], { type: file.type });
        mediaFilesList = [...mediaFilesList, { file }];
        console.log(mediaFilesList)
        await createThumbnail(blob);
    }

    async function loadMediaFiles(media_files) {
        return Promise.all(
            await media_files.map(async (media_id) => {
                const result = await SendHTTPrequest({
                    endpoint: `/media/${media_id}`,
                    timeout: 50000,
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
                $form.tags = currentDocument.tags.map((tag)=> tag['$oid']);
                $form.fields = [];
                for (
                    let index = 0;
                    index < currentDocument.fields.length;
                    index++
                ) {
                    let element = currentDocument.fields[index];
                    if (!element.valueType) {
                        element = {
                            ...element,
                            valueType: parseFieldTypeToHTMLType(element.value),
                        };
                    }
                    if (
                        typeof element.value === "object" ||
                        element.valueType === "date"
                    ) {
                        if (element.value["$date"]) {
                            element.value = new Date(element.value["$date"])
                                .toISOString()
                                .split("T")[0];
                        } else {
                            element.value = new Date(element.value)
                                .toISOString()
                                .split("T")[0];
                        }
                    }
                    $form.fields.push({
                        name: element.name,
                        value: element.value,
                        valueType: element.valueType,
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
                    timeout: 50000,
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

        let updatedMediaIDs = mediaThumbnailsList.map((file) => file.id);
        updatedMediaIDs = updatedMediaIDs.filter((id) => id !== undefined);

        updatedMediaIDs = [...updatedMediaIDs, ...newMediaFilesIDs];

        data = {
            ...data,
            media_files: updatedMediaIDs,
        };

        const response = await SendHTTPrequest({
            endpoint: `/documents/${data._id.$oid}`,
            timeout: 50000,
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
            const index = allDocuments.findIndex(
                (document) => document._id.$oid === currentDocument._id.$oid
            );
            data.fields = data.fields.map((field) => {
                if (!field.valueType) {
                    field = {
                        ...field,
                        valueType: parseFieldTypeToHTMLType(field.value),
                    };
                }
                if (field.valueType === "date") {
                    field.value = new Date(field.value);
                }
                return field;
            });
            data.tags = data.tags.map((id)=> {return {"$oid": id}})
            data.title = response.data.title;
            $form.title = data.title;
            allDocuments[index] = data;
            allDocuments = allDocuments;
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
            timeout: 50000,
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
            data.fields = data.fields.map((field) => {
                if (!field.valueType) {
                    field = {
                        ...field,
                        valueType: parseFieldTypeToHTMLType(field.value),
                    };
                }
                if (field.valueType === "date") {
                    field.value = new Date(field.value);
                }
                return field;
            });
            data.tags = data.tags.map((id)=> {return {"$oid": id}})
            allDocuments.push({
                ...data,
                _id: { $oid: response.data.id.$oid },
                title: response.data.title,
                is_new: true
            });
            allDocuments = allDocuments;
            currentDocument = null;
            resetForm();
        } else if (response.status > 400 && response.status < 500) {
            notificationStore.set({
                message: "Could not add document.",
                type: "ERROR",
            });
        }
    }

    export const  deleteDocument = async() => {
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
            currentDocument = null;
            resetForm();
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
            callback: deleteDocument
        };
    }

    function changeDocumentType(event) {
        if (event.target.value === "") {
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
            tags: [],
            fields: [
                {
                    name: "",
                    value: "",
                    valueType: "text",
                },
            ],
        },
        validationSchema: yup.object().shape({
            title: yup.string().nullable(),
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
                    _id: { $oid: currentDocument._id.$oid },
                    ...values,
                });
            }
        },
    });

    export const addField = () => {
        $form.fields = $form.fields.concat({ name: "", value: "" });
        $errors.fields = $errors.fields.concat({ name: "", value: "" });
    };

    export const removeField = (i) => {
        $form.fields = $form.fields.filter((u, j) => j !== i);
        $errors.fields = $errors.fields.filter((u, j) => j !== i);
    };

    export const addTag = (tagId) => {
        $form.tags = $form.tags.concat(tagId);
    };

    export const removeTag = (i) => {
        $form.tags = $form.tags.filter((u, j) => j !== i);
    };
</script>

<form
    on:submit={handleDocumentSubmit}
    class="grid gap-5 grid-cols-3 my-5 relative"
>
    <div class="w-full col-span-3 flex items-center justify-between" id="top_of_document">
        {#if currentDocument || editTitle}
        <div>
            <input
                id="title"
                name="title"
                placeholder="Document title"
                class="w-full dark:bg-gray-900 font-bold px-2 py-1"
                on:change={handleChange}
                bind:value={$form.title}
            />
        </div>
        {/if}
        <div class="w-full flex justify-between text-left pl-4">
            <p class="dark:text-gray-500 text-center">
                {#if currentDocument}
                    Updating Document
                {:else}
                    New Document, unsaved
                    <span on:click={()=>{toggleEditTitle()}}>
                        <Button classList="mx-5" size="sm">
                            {#if !editTitle}
                                Add custom title
                            {:else}
                                Remove custom title
                            {/if}
                        </Button>
                    </span>
                {/if}
            </p>
            <span class="cursor-pointer">
                {#if currentDocument}
                    <span on:click={() => {
                        currentDocument = null;
                        resetForm();
                    }}>
                        <X />
                    </span>
                {/if}
            </span>
        </div>
    </div>
    <small class="col-span-3 h-1 text-red-300">
        {#if $errors.title}
            {$errors.title}
        {/if}
    </small>

    <div class="h-3 col-span-3">
        <span
            class="flex justify-end items-center cursor-pointer dark:text-white text-right hover:text-red-500"
            on:click={() => {
                startDeleteDocument();
            }}
        >
            {#if currentDocument}
                <FileMinus />
                Delete Document
            {/if}
        </span>
    </div>
    <div class="col-span-3">
        <textarea
            rows="5"
            id="description"
            name="description"
            placeholder="Description"
            class="w-full dark:bg-gray-900 font-bold px-3 py-1 h-16"
            on:change={handleChange}
            bind:value={$form.description}
        />
    </div>
    <div class="col-span-3 flex flex-wrap">
        {#if $form.tags.length > 0}
            {#each $form.tags as tagId, j}
                    <span class="flex bg-gray-100 dark:bg-gray-500 rounded-full mx-2 my-1">
                        <p class="px-2 rounded-full">
                            {allTags.find((tag) => tag._id["$oid"] === tagId)
                                .name}
                        </p>
                        <span
                            on:click={()=>{removeTag(j)}}
                            class="pr-2 py-1 flex items-center cursor-pointer"
                            ><X />
                        </span>
                    </span>
            {/each}
        {/if}
    </div>

    <select
        on:change={(e) => {
            addTag(e.target.value);
        }}
        class="dark:bg-gray-900 font-bold px-2 py-1 mb-2 col-start-3"
    >
        <option value="" selected>Add tag</option>
        {#each allTags as newTag}
            {#if !$form.tags.includes(newTag._id["$oid"])}
                <option value={newTag._id["$oid"]}>{newTag.name}</option>
            {/if}
        {/each}
    </select>
    <MediaFilesBox
        bind:mediaThumbnailsList
        bind:mediaFilesList
        bind:deletedMediaIds
        on:convertMedia={(file) => {
            mediaConverter(file);
        }}
    />
    <hr class="col-span-3 my-5" />
    <select
        name="documentType"
        class="dark:bg-gray-900 font-bold px-2 py-1 col-span-3"
        bind:value={currentDocumentType}
        on:change={(e)=>{changeDocumentType(e)}}
    >
        <option value="" selected>Not selected Document Type</option>
        {#each documentTypesList as documentType}
            <option value={documentType.title}>{documentType.title}</option>
        {/each}
    </select>
    {#each $form.fields as field, j}
        <div class="col-span-3 mt-5 flex">
            <div class="w-4/5 flex-none">
                <div>
                    <input
                        name={`fields[${j}].name`}
                        placeholder="Field name"
                        class="w-2/3 dark:bg-gray-900 font-bold px-2 my-1"
                        on:change={handleChange}
                        on:blur={handleChange}
                        bind:value={$form.fields[j].name}
                    />
                </div>
                <small class="h-4 inline-block text-red-300">
                    {#if $errors.fields[j]?.name}
                        {$errors.fields[j]?.name}
                    {/if}
                </small>

                <div>
                    <Input
                        index={j}
                        name={`fields[${j}].value`}
                        value={field.value}
                        type={field.valueType}
                        placeholder={field.name + " value"}
                        on:change={handleChange}
                        on:blur={handleChange}
                        on:changeValue={InputChangeValue}
                        on:focus={()=>{field.valueType === "text" && getHints(field.value, j)}}
                        on:keyup={()=>{field.valueType === "text" && getHints(field.value, j)}}
                        on:focusout={()=>{haveClickedHint()}}
                    />
                    {#if hint.index === j}
                        {#if hint.hints.length > 0}
                            <span class="w-full">
                                <InputHints
                                    bind:haveClickedHint
                                    bind:hints={hint.hints}
                                    on:updateSearchText={(e)=>{field.value=e.detail.hint}}
                                />
                            </span>
                        {/if}
                    {/if}
                </div>
                <small class="h-4 inline-block text-red-300">
                    {#if $errors.fields[j]?.value}
                        {$errors.fields[j]?.value}
                    {/if}
                </small>
            </div>
            <div class="sm:w-1/5 ml-5 sm:m-0 flex-none">
                <div class="h-24 flex flex-wrap content-center justify-end">
                    {#if $form.fields.length !== 1}
                        <span
                            on:click={()=>{removeField(j)}}
                            class="bg-gray-200 dark:bg-gray-600 active:border-yello-500 hover:border-yellow-400 hover:bg-yellow-500 duration-100 rounded-full px-3 sm:px-4 py-1 flex items-center border cursor-pointer"
                            ><Minus /></span
                        >
                    {/if}
                </div>
            </div>
        </div>
        <div class="col-span-3">
            <div class="flex justify-center">
                {#if j === $form.fields.length - 1}
                    <span
                        on:click={()=>{addField()}}
                        class="bg-gray-200 dark:bg-gray-600 active:border-green-500 hover:border-green-400 hover:bg-green-500 duration-100 rounded-full px-6 py-2 flex items-center border cursor-pointer"
                        ><Plus /></span
                    >
                {/if}
            </div>
        </div>
    {/each}
    <div class="col-span-3 flex justify-end mt-5">
        <div class="fixed bottom-4 mr-3">
            <input
                type="submit"
                class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white hover:text-green-400 duration-200 rounded-lg shadow-md py-2 px-10 cursor-pointer"
                value={currentDocument ? "Update Document" : "Add Document"}
            />
        </div>
    </div>
</form>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />
