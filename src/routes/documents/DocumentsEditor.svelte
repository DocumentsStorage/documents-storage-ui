<script>
    import { createForm } from "svelte-forms-lib";
    import * as yup from "yup";
    import { SendHTTPrequest } from "../../services/api";
    import notificationStore from "../../components/NotificationStore.js";
    import Button from "../../common/Button.svelte";

    export let allDocument;
    export let currentDocument = null;
    export let imagesList = []; 

    function resetForm() {
        $form.title = null;
        $form.description = null;
        $form.fields = [
            {
                name: "",
                value: "",
            },
        ];
        currentDocument = null;
    }

    $: currentDocument, loadDocument();

    function loadDocument() {
        if (currentDocument?.fields?.length > 0) {
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

    async function uploadFile(file){
        var data = new FormData()
        data.append('media_file',file,file.name)
        const response = await SendHTTPrequest({
            endpoint: "/media",
            method: "POST",
            data: data
        });
    }

    async function deleteFile(media_file_id){
        const response = await SendHTTPrequest({
            endpoint: `/media?media_file_id=${media_file_id}`,
            method: "DELETE",
        });
    }

    function dropHandler(event) {
        if (event.dataTransfer.items) {
            for (var i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === "file") {
                    var file = event.dataTransfer.items[i].getAsFile();
                    // TODO: Detect media file type, add pdf thumbnail generator
                    var blob = new Blob([file], { type: "image/jpeg" });
                    const url = URL.createObjectURL(blob);
                    imagesList = [...imagesList, url];
                }
            }
        } else {
            for (var i = 0; i < event.dataTransfer.files.length; i++) {
                console.log(
                    "... file[" +
                        i +
                        "].name = " +
                        event.dataTransfer.files[i].name
                );
            }
        }
    }

    async function updateDocument(documentData) {
        // TODO: Upload media files
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
            allDocument.push({
                _id: { $oid: response.data.id.$oid },
                ...documentData,
            });
            allDocument = allDocument;
        } else if (response.status > 400 && response.status < 500) {
            notificationStore.set({
                message: "Could not update document.",
                type: "ERROR",
            });
        }
    }

    async function createDocument(documentData) {
        // TODO: Upload media files

        const response = await SendHTTPrequest({
            endpoint: "/documents",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            data: documentData,
        });
        if (response.status === 200) {
            notificationStore.set({
                message: "Added successfully.",
                type: "SUCCESS",
            });
            allDocument.push({
                _id: { $oid: response.data.id.$oid },
                ...documentData,
            });
            allDocument = allDocument;
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
                    value: yup
                        .string()
                        .required("Value for field is required"),
                })
            ),
        }),
        onSubmit: async (values) => {
            if (!currentDocument) {
                await createDocument(values);
            } else {
                await updateDocument({
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

    <div
        id="drop_zone"
        class="h-48 col-span-3 p-2 rounded items-center bg-gray-500 text-center"
        on:dragover|preventDefault
        on:drop|preventDefault={dropHandler}
    >
        <p class="text-lg">
            Drag and drop one or more files (.jpg .jpeg .png .pdf)
        </p>
        <div
            class="{imagesList.length === 0 &&
                'justify-center'} flex overflow-x-auto flex-nowrap mt-5"
        >
            {#if imagesList.length > 0}
                {#each imagesList as imageURL}
                    <img
                        class="h-32 rounded mx-2"
                        src={imageURL}
                        alt={imageURL}
                    />
                {/each}
            {:else}
                <div
                    class="h-28 rounded text-xl px-5 bg-gray-400 flex items-center justify-center"
                >
                    Drop here
                    <i class="ph-file-plus ml-3" />
                </div>
            {/if}
        </div>
    </div>

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
                <select
                    name={`fields[${j}].value`}
                    class="w-full dark:bg-gray-900 font-bold px-2 my-1"
                    on:change={handleChange}
                    bind:value={$form.fields[j].value}
                >
                    <option>text</option>
                    <option>number</option>
                    <option>date</option>
                </select>
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
