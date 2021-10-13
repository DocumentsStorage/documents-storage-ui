<script>
  import { createForm } from 'svelte-forms-lib';
  import * as yup from 'yup';
  import { SendHTTPrequest } from 'services/api.js';
  import notificationStore from 'components/NotificationStore.js';
  import ActionsModal from 'components/ActionsModal.svelte';
import { FileMinus, Minus, Plus, X } from 'phosphor-svelte';

  export let allDocumentTypes;
  export let currentDocumentType = null;
  export let modalConfig = {
        show: false,
        title: '',
        message: '',
        cancelAction: '',
        proceedAction: '',
        callback: null
    };
    

  function resetForm() {
    currentDocumentType = null;
    $form.title = '';
    $form.fields = [{ name: '', value_type: '' }];
    $form.description = '';
  }

  $: currentDocumentType, loadDocumentType();

  async function deleteDocumentTypeAPI() {
    modalConfig.show = false;
    const response = await SendHTTPrequest({
      endpoint: `/document_types/${currentDocumentType._id.$oid}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200) {
      notificationStore.set({
        message: 'Document type has been deleted',
        type: 'SUCCESS'
      });
      allDocumentTypes = allDocumentTypes.filter(
        (documentType) => documentType._id.$oid !== currentDocumentType._id.$oid
      );
    } else if (response.status === 404) {
      notificationStore.set({
        message: 'Not found document type',
        type: 'ERROR'
      });
    }
  }

  function startDeleteDocumentType() {
    modalConfig = {
      show: true,
      title: `Delete ${currentDocumentType.title} document type`,
      message:
        'This action is irreversible. Document type will be deleted, documents build with this type will persist.',
      cancelAction: 'Cancel',
      proceedAction: 'Delete',
      callback: deleteDocumentTypeAPI
    };
  }

  function loadDocumentType() {
    if (currentDocumentType?.fields?.length > 0) {
      $form.title = currentDocumentType.title;
      $form.description = currentDocumentType.description;
      $form.fields = [];
      for (let index = 0; index < currentDocumentType.fields.length; index++) {
        const element = currentDocumentType.fields[index];
        $form.fields.push({
          name: element.name,
          value_type: element.value_type
        });
      }
    }
  }

  async function updateDocumentType(documentTypeData) {
    const response = await SendHTTPrequest({
      endpoint: `/document_types/${currentDocumentType._id.$oid}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      data: documentTypeData
    });
    if (response.status === 200) {
      notificationStore.set({
        message: 'Updated successfully.',
        type: 'SUCCESS'
      });
      const index = allDocumentTypes.findIndex((documentType) => documentType._id.$oid === currentDocumentType._id.$oid);
      allDocumentTypes[index] = documentTypeData;
      allDocumentTypes = allDocumentTypes;
    } else if (response.status > 400 && response.status < 500) {
      notificationStore.set({
        message: 'Could not update document type.',
        type: 'ERROR'
      });
    }
  }

  async function createDocumentType(documentTypeData) {
    const response = await SendHTTPrequest({
      endpoint: '/document_types',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: documentTypeData
    });
    if (response.status === 201) {
      notificationStore.set({
        message: 'Added successfully.',
        type: 'SUCCESS'
      });
      allDocumentTypes.push({
        _id: { $oid: response.data.id.$oid },
        ...documentTypeData
      });
      allDocumentTypes = allDocumentTypes;
    } else if (response.status > 400 && response.status < 500) {
      notificationStore.set({
        message: 'Could not add document type.',
        type: 'ERROR'
      });
    }
  }

  const {
    form,
    errors,
    handleChange,
    handleSubmit: handleDocumentTypeSubmit
  } = createForm({
    initialValues: {
      title: '',
      description: '',
      fields: [
        {
          name: '',
          value_type: ''
        }
      ]
    },
    validationSchema: yup.object().shape({
      title: yup.string().min(1).required('Title field is required'),
      description: yup.string(),
      fields: yup.array().of(
        yup.object().shape({
          name: yup.string().required('Name of field is required'),
          value_type: yup.string().required('Value type for field is required')
        })
      )
    }),
    onSubmit: async (values) => {
      if (!currentDocumentType) {
        await createDocumentType(values);
      } else {
        await updateDocumentType({
          id: currentDocumentType._id.$oid,
          ...values
        });
      }
    }
  });

  export const addField = () => {
    $form.fields = $form.fields.concat({ name: '', value_type: '' });
    $errors.fields = $errors.fields.concat({ name: '', value_type: '' });
  };

  export const removeField = (i) => () => {
    $form.fields = $form.fields.filter((u, j) => j !== i);
    $errors.fields = $errors.fields.filter((u, j) => j !== i);
  };
</script>

<form on:submit={handleDocumentTypeSubmit} class="grid gap-7 grid-cols-3 my-5">
  <div class="col-span-3 flex justify-between">
    <h1>
      {#if currentDocumentType}
        Update document type
      {:else}
        Add document Type
      {/if}
    </h1>
    {#if currentDocumentType}
      <span
        on:click={() => {
          resetForm();
        }}
        class="cursor-pointer"
      >
        <X />
    </span>
    {/if}
  </div>
  <!-- Inline -->
  <div class="col-span-3 justify-end">
    <span
      class="flex justify-end items-center pl-5 dark:text-white text-black hover:text-red-500 cursor-pointer"
      on:click={() => {
        startDeleteDocumentType();
      }}
      >
      {#if currentDocumentType}
      <span class="mx-2"><FileMinus /></span>
      Delete Type
      {/if}
      </span
    >
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
  <small class="col-span-3 h-1 text-red-300">
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
  <small class="col-span-3 h-4 text-red-300">
    {#if $errors.description}
      {$errors.description}
    {/if}
  </small>

  <h1>Fields</h1>

  {#each $form.fields as field, j}
    <div class="col-span-3 mt-5 flex">
      <div class="w-4/5 flex-none">
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
        <small class="h-4 inline-block text-red-300">
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
        <small class="h-4 text-red-300">
          {#if $errors.fields[j]?.value_type}
            {$errors.fields[j]?.value_type}
          {/if}
        </small>
      </div>

      <div class="sm:w-1/5 ml-5 sm:m-0 flex-none">
        <div class="h-24 flex flex-wrap content-center justify-end">
          {#if $form.fields.length !== 1}
            <span
              on:click={removeField(j)}
              class="bg-gray-600 active:border-yello-500 hover:border-yellow-400 hover:bg-yellow-500 duration-100 rounded-full px-3 sm:px-4 py-1 flex items-center border cursor-pointer"
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
            on:click={addField}
            class="bg-gray-600 active:border-green-500 hover:border-green-400 hover:bg-green-500 duration-100 rounded-full px-6 py-2 flex items-center border cursor-pointer"
            ><Plus /></span
          >
        {/if}
      </div>
    </div>
    <!-- {#if j === $form.fields.length - 1}
      <span on:click={add}><Button>Add Field</Button></span>
    {/if}
    {#if $form.fields.length !== 1}
      <span on:click={remove(j)}><Button>Remove field</Button></span>
    {/if} -->
  {/each}
  <div class="col-span-3 flex justify-end mt-5">
    <div class="fixed bottom-4 mr-3">
      <input
        type="submit"
        class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white hover:text-green-400 duration-200 rounded-lg shadow-md py-2 px-10 cursor-pointer"
        value={currentDocumentType ? 'Update Type' : 'Add Type'}
      />
    </div>
  </div>
</form>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />
