<script>
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { navigate } from "svelte-routing";
  import Cookies from "universal-cookie";
  import { SendHTTPrequest } from "../services/api";
  import { logged } from "../services/route-guard";
  import notificationStore from "../components/NotificationStore.js";

  const {
    form,
    errors,
    state,
    handleChange,
    handleSubmit: handleLogin,
  } = createForm({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      username: yup.string().min(1).required(),
      password: yup.string().min(3).required(),
    }),
    onSubmit: async (values) => {
      const response = await SendHTTPrequest({
        endpoint: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: `username=${values.username}&password=${values.password}`,
      });
      if (response.status === 200) {
        const cookies = new Cookies();
        cookies.set("authToken", response.data.access_token, {
          sameSite: "strict",
        });
        logged.set(true);
        navigate("/documents", { replace: true });
      } else if (response.status > 400 && response.status < 500) {
        notificationStore.set({
          message: "Could not login, check Your credentials",
          type: "ERROR",
        });
      }
    },
  });
</script>

<div
  class="lg:xl:2xl:w-1/3 mt-5 rounded-md shadow-lg dark:bg-gray-800 flex justify-center"
>
  <form on:submit={handleLogin} class="grid gap-5 grid-cols-3 my-5">
    <h1 class="text-2xl col-span-3">Login</h1>
    <div class="col-span-3">
      <label class="my-2" for="username">Username</label>
      <input
        id="username"
        name="username"
        autocomplete="username"
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

    <div class="col-span-3">
      <label class="my-2" for="password">Password</label>
      <input
        id="password"
        name="password"
        autocomplete="new-password"
        type="password"
        class="w-full dark:bg-gray-900 px-2"
        on:change={handleChange}
        bind:value={$form.password}
      />
    </div>
    <small class="col-span-3 h-5">
      {#if $errors.password}
        {$errors.password}
      {/if}
    </small>
    <input
      type="submit"
      class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
      value="Login"
    />
  </form>
</div>
