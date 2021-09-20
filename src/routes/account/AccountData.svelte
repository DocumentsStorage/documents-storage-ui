<script>
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import Cookies from "universal-cookie";
  import jwt_decode from "jwt-decode";
  import { SendHTTPrequest } from "../../services/api";
  import { onMount } from "svelte";
  import notificationStore from "../../components/NotificationStore.js";

  export let username = "";

  onMount(async () => {
    const response = await SendHTTPrequest({
      endpoint: "/accounts/session",
      method: "GET",
    });
    username = response.data.username;
  });

  const {
    form,
    errors,
    state,
    handleChange,
    handleSubmit: handleUpdateAccount,
  } = createForm({
    initialValues: {
      username: "",
    },
    validationSchema: yup.object().shape({
      username: yup.string().min(2).required(),
    }),
    onSubmit: async (values) => {
      const cookies = new Cookies();
      const response = await SendHTTPrequest({
        endpoint: `/accounts/${jwt_decode(cookies.get("authToken")).client_id}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          username: values.username,
        },
      });
      if (response.status === 200) {
        notificationStore.set({
          message: "Updated successfully",
          type: "SUCCESS",
        });
      } else if (response.status > 400 && response.status < 500) {
        notificationStore.set({
          message: "Could not change account data",
          type: "ERROR",
        });
      }
    },
  });
</script>

<form on:submit={handleUpdateAccount} class="grid gap-10 grid-cols-3 my-5">
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
