<script>
    import { createForm } from "svelte-forms-lib";
    import * as yup from "yup";
    import { SendHTTPrequest } from "../../services/api";
    import notificationStore from "../../components/NotificationStore.js";
    import { onMount } from "svelte";
  
    export let username = "";
    export let document_types = [];
    export let fields = [];



    const {
      form,
      errors,
      state,
      handleChange,
      handleSubmit: handleCreateDocument,
    } = createForm({
      initialValues: {
        username: "",
      },
      validationSchema: yup.object().shape({
        title: yup.string().min(1).required()
      }),
      onSubmit: async (values) => {
        const response = await SendHTTPrequest({
          endpoint: "/documents",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            title: values.title,
          },
        });
        if (response.status === 200) {
          notificationStore.set({
            message: "Added successfully",
            type: "SUCCESS",
          });
        } else if (response.status > 400 && response.status < 500) {
          notificationStore.set({
            message: "Could not add document",
            type: "ERROR",
          });
        }
      },
    });
  </script>
  
  <div>
      <p>Select document type</p>
  </div>
  <form on:submit={handleCreateDocument} class="grid gap-10 grid-cols-3 my-5">
    <div class="col-span-3">
      <label class="my-2" for="username">Username</label>
      <input
        id="username"
        name="username"
        autocomplete="username"
        placeholder={username}
        class="w-full dark:bg-gray-900 font-bold px-2"
        on:change={handleChange}
        bind:value={$form.username}
      />
    </div>
    <small class="col-span-3 h-5">
      {#if $errors.username}
        {$errors.username}
      {/if}
    </small>
    <input
      type="submit"
      class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
      value="Update username"
    />
  </form>
  