<script>
  import { createForm } from "svelte-forms-lib";
  import Cookies from "universal-cookie";
  import jwt_decode from "jwt-decode";
  import { SendHTTPrequest } from "../../services/api";
  import { onMount } from "svelte";

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
    handleChange,
    handleSubmit: handleUpdateAccount,
  } = createForm({
    initialValues: {
      username: "",
    },
    onSubmit: async (values) => {
      const cookies = new Cookies();
      const response = await SendHTTPrequest({
        endpoint: "/accounts/update",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          id: jwt_decode(cookies.get("authToken")).client_id,
          username: values.username,
        },
      });
      if (response.status === 200) {

      } else {
        
      }
    },
  });
</script>

<form on:submit={handleUpdateAccount} class="grid gap-10 grid-cols-3 my-5">
  <div class="col-span-3">
    <label class="my-2" for="name">Username</label>
    <input
      id="name"
      name="name"
      autocomplete="username"
      placeholder={username}
      class="w-full dark:bg-gray-900 font-bold px-2"
      on:change={handleChange}
      bind:value={$form.username}
    />
  </div>
  <input
    type="submit"
    class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
    value="Update username"
  />
</form>
