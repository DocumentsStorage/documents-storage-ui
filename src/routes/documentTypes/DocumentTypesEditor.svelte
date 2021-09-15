<script>
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { SendHTTPrequest } from "../../services/api";
  import notificationStore from "../../components/NotificationStore.js";
  import Button from "../../common/Button.svelte";

  export let allDocumentTypes;
  export let currentDocumentType = null;

  function resetForm() {
    $form.title = null;
    $form.description= null;
    $form.fields  = [{
      "name": "",
      "value_type": ""
    }];
    currentDocumentType = null;
  }

  $: currentDocumentType, loadDocumentType();

  function loadDocumentType() {
    if (currentDocumentType?.fields?.length > 0) {
      $form.title = currentDocumentType.title;
      $form.description = currentDocumentType.description;
      $form.fields = [];
      for (let index = 0; index < currentDocumentType.fields.length; index++) {
        const element = currentDocumentType.fields[index];
        $form.fields.push({
          name: element.name,
          value_type: element.value_type,
        });
      }
    }
  }

  async function updateDocumentType(documentTypeData) {
    const response = await SendHTTPrequest({
      endpoint: "/document_types",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: documentTypeData,
    });
    if (response.status === 200) {
      notificationStore.set({
        message: "Updated successfully.",
        type: "SUCCESS",
      });
      allDocumentTypes.push({
        _id: { $oid: response.data.id.$oid },
        ...documentTypeData,
      });
      allDocumentTypes = allDocumentTypes;
    } else if (response.status > 400 && response.status < 500) {
      notificationStore.set({
        message: "Could not update document type.",
        type: "ERROR",
      });
    }
  }

  async function createDocumentType(documentTypeData) {
    const response = await SendHTTPrequest({
      endpoint: "/document_types",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: documentTypeData,
    });
    if (response.status === 200) {
      notificationStore.set({
        message: "Added successfully.",
        type: "SUCCESS",
      });
      allDocumentTypes.push({
        _id: { $oid: response.data.id.$oid },
        ...documentTypeData,
      });
      allDocumentTypes = allDocumentTypes;
    } else if (response.status > 400 && response.status < 500) {
      notificationStore.set({
        message: "Could not add document type.",
        type: "ERROR",
      });
    }
  }

  const {
    form,
    errors,
    state,
    handleChange,
    handleSubmit: handleDocumentTypeSubmit,
  } = createForm({
    initialValues: {
      title: "",
      description: "",
      fields: [
        {
          name: "",
          value_type: "",
        },
      ],
    },
    validationSchema: yup.object().shape({
      title: yup.string().min(1).required("Title field is required"),
      description: yup.string(),
      fields: yup.array().of(
        yup.object().shape({
          name: yup.string().required("Name of field is required"),
          value_type: yup.string().required("Value type for field is required"),
        })
      ),
    }),
    onSubmit: async (values) => {
      if(!currentDocumentType){
        await createDocumentType(values);
      } else {
        await updateDocumentType({id: currentDocumentType._id.$oid, ...values,})
      }
    },
  });

  export const add = () => {
    $form.fields = $form.fields.concat({ name: "", value_type: "" });
    $errors.fields = $errors.fields.concat({ name: "", value_type: "" });
  };

  export const remove = (i) => () => {
    $form.fields = $form.fields.filter((u, j) => j !== i);
    $errors.fields = $errors.fields.filter((u, j) => j !== i);
  };
</script>

<form on:submit={handleDocumentTypeSubmit} class="grid gap-7 grid-cols-3 my-5">
  <div class="w-full col-span-3 flex justify-between">
    <h1 class="text-2xl">
      {#if currentDocumentType}
        Update document type
      {:else}
        Add document Type
      {/if}
    </h1>
    {#if currentDocumentType}
      <i
        on:click={() => {
          resetForm();
        }}
        class="ph-x"
      />
    {/if}
  </div>
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

  <h1 class="text-2xl">Fields</h1>

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
          name={`fields[${j}].value_type`}
          class="w-full dark:bg-gray-900 font-bold px-2 my-1"
          on:change={handleChange}
          bind:value={$form.fields[j].value_type}
        >
          <option>text</option>
          <option>number</option>
          <option>date</option>
        </select>
      </div>
      <small class="h-4 inline-block">
        {#if $errors.fields[j]?.value_type}
          {$errors.fields[j]?.value_type}
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
    value={currentDocumentType ? "Update" : "Add"}
  />
</form>
