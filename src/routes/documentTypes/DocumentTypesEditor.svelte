<script>
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { SendHTTPrequest } from "../../services/api";
  import notificationStore from "../../components/NotificationStore.js";

  export let allDocumentTypes;
  export let currentDocumentType = null;

  async function createDocumentType(documentTypeData){
    const response = await SendHTTPrequest({
        endpoint: "/document_types",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: documentTypeData
      });
      if (response.status === 200) {
        notificationStore.set({
          message: "Added successfully",
          type: "SUCCESS",
        });
        allDocumentTypes.push({
        _id: { $oid: response.data.id.$oid },
        ...documentTypeData,
        });
        allDocumentTypes = allDocumentTypes;
      } else if (response.status > 400 && response.status < 500) {
        notificationStore.set({
          message: "Could not add document",
          type: "ERROR",
        });
      }
  }

  const {
    form,
    errors,
    state,
    handleChange,
    handleSubmit: handleCreateDocumentType
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
      title: yup.string().min(1).required(),
      description: yup.string(),
      fields: yup.array().of(
        yup.object().shape({
          name: yup.string().required(),
          value_type: yup.string().required(),
        })
      ),
    }),
    onSubmit: async (values) => {
      await createDocumentType(values);
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

<form on:submit={handleCreateDocumentType} class="grid gap-10 grid-cols-3 my-5">
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
  <small class="col-span-3 h-5">
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
    <div class="form-group">
      <div>
        <input
          name={`fields[${j}].name`}
          placeholder="name"
          class="w-full dark:bg-gray-900 font-bold px-2"
          on:change={handleChange}
          on:blur={handleChange}
          bind:value={$form.fields[j].name}
        />
        {#if $errors.fields[j].name}
          <small class="error">{$errors.fields[j].name}</small>
        {/if}
      </div>

      <div>
        <select
          id="title"
          name={`fields[${j}].value_type`}
          placeholder="value_type"
          class="w-full dark:bg-gray-900 font-bold px-2"
          on:change={handleChange}
          bind:value={$form.fields[j].value_type}
          >
          <option></option>
          <option>text</option>
          <option>number</option>
          <option>date</option>
        </select>
        {#if $errors.fields[j].value_type}
          <small class="error">{$errors.fields[j].value_type}</small>
        {/if}
      </div>

      {#if j === $form.fields.length - 1}
        <button type="button" on:click={add}>Add</button>
      {/if}
      {#if $form.fields.length !== 1}
        <button type="button" on:click={remove(j)}>Remove field</button>
      {/if}
    </div>
  {/each}

  <input
    type="submit"
    class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
    value="Add document type"
  />
</form>
