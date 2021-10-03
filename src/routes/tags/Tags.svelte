<script>
    import { SendHTTPrequest } from "services/api.js";
    import { onMount } from "svelte";
    import notificationStore from "components/NotificationStore.js";
    import ActionsModal from "components/ActionsModal.svelte";

    export let allTags = null;
    export let tagToDelete = null;
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
            endpoint: "/tags/list",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        allTags = response.data.tags;
    });

    async function updateTagAPI(tag) {
        const query = tag._id["$oid"] + `?name=${tag.name}`;
        const response = await SendHTTPrequest({
            endpoint: `/tags/${query}`,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status === 200) {
            notificationStore.set({
                message: "Updated successfully.",
                type: "SUCCESS",
            });
        }
    }

    function changeTagName(tag_id) {
        if (tag_id) {
            const tag = allTags.find((tag) => tag._id["$oid"] === tag_id);
            updateTagAPI(tag);
        } else {
            addTagAPI();
        }
    }

    async function deleteTagAPI() {
        modalConfig.show = false;
        const response = await SendHTTPrequest({
            endpoint: `/tags/${tagToDelete}`,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status === 200) {
            notificationStore.set({
                message: "Tag has been deleted",
                type: "SUCCESS",
            });
            allTags = allTags.filter((tag) => tag._id.$oid !== tagToDelete);
            allTags = allTags;
        } else if (response.status === 404) {
            notificationStore.set({
                message: "Not found tag",
                type: "ERROR",
            });
        }
        tagToDelete = null;
    }

    function startDeleteTag(tag_name) {
        modalConfig = {
            show: true,
            title: `Delete ${tag_name} tag`,
            message:
                "This action is irreversible. This Tag will be deleted, also it will be deleted from all documents with this tag.",
            cancelAction: "Cancel",
            proceedAction: "Delete",
            callback: deleteTagAPI,
        };
    }

    async function addTagAPI() {
        const name = allTags[allTags.length - 1].name;
        const response = await SendHTTPrequest({
            endpoint: `/tags`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            data: { name },
        });
        if (response.status === 201) {
            notificationStore.set({
                message: "Updated successfully.",
                type: "SUCCESS",
            });
            allTags[allTags.length - 1] = {
                ...allTags[allTags.length - 1],
                _id: response.data.id,
            };
            allTags = allTags;
        }
    }

    function startAddingTag() {
        allTags.push({ name: "" });
        allTags = allTags;
    }
</script>

<div class="w-full sm:w-1/2 xl:w-1/3 rounded-md shadow-lg">
    <ul class="mt-5 py-3">
        {#if allTags}
            {#if allTags.length > 0}
                {#each allTags as tag}
                    <li
                        class="dark:bg-gray-600 rounded my-5 p-2 flex items-center"
                    >
                        <!-- Inline -->
                        <div class="w-2/3 ml-2">
                            <input
                                class="dark:bg-gray-900 w-full font-bold px-2 my-1"
                                on:change={() => changeTagName(tag._id?.$oid)}
                                bind:value={tag.name}
                            />
                        </div>
                        <div class="w-1/3 mx-2 flex">
                            <span
                                class="flex items-center pl-5 dark:text-white text-black hover:text-red-500 cursor-pointer"
                                on:click={() => {
                                    if (tag._id) {
                                        tagToDelete = tag._id["$oid"];
                                        startDeleteTag(tag.name);
                                    } else {
                                        allTags.pop();
                                        allTags = allTags;
                                    }
                                }}
                                ><i class="ph-file-minus mx-2" />
                                {tag._id ? "Delete" : "Cancel"}</span
                            >
                        </div>
                    </li>
                {/each}
            {:else}
                <p class="flex w-full justify-center text-xl py-64">No Tags</p>
            {/if}
        {/if}
    </ul>
    <div class="flex my-5 justify-center">
        {#if allTags}
            {#if allTags[allTags.length - 1]?._id || allTags.length == 0}
                <span
                    on:click={startAddingTag}
                    class="bg-gray-600 active:border-green-500 hover:border-green-400 hover:bg-green-500 duration-100 rounded-full px-6 py-2 flex items-center border cursor-pointer"
                    ><i class="ph-plus text-lg" /></span
                >
            {/if}
        {/if}
    </div>
</div>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />
