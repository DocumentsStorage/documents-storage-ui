<script>
    import { createForm } from "svelte-forms-lib";
    import Cookies from 'universal-cookie';
    import { SendHTTPrequest } from "../../services/api"

    const { form, handleChange, handleSubmit: handleUpdateAccount } = createForm({
      initialValues: {
        username: "",
        rank: "",
        password: "",
        new_password: ""
      },
      onSubmit: async(values) => {
        const response = await SendHTTPrequest({
          endpoint: '/token',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            username: values.username,
            rank: values.rank,
            password: values.password,
            new_password: values.new_password
          }
        });
        if(response.status === 200){
          const cookies = new Cookies();
          cookies.set('authToken', response.data.access_token, {sameSite: 'strict'});
        }
      },
    });
  </script>
  
  <div
    class="w-1/3 mt-10 rounded-md shadow-lg dark:bg-gray-800 flex justify-center"
  >
    <form on:submit={handleUpdateAccount} class="grid gap-10 grid-cols-3 my-5">
      <h1 class="text-2xl col-span-3">Account</h1>
      <div class="col-span-3">
        <label class="my-2" for="name">Username</label>
        <input
          id="name"
          name="name"
          autocomplete="username"
          class="w-full dark:bg-gray-900 font-bold px-2"
          on:change={handleChange}
          bind:value={$form.username}
        />
      </div>
      <div class="col-span-3">
        <label class="my-2" for="password">Old Password</label>
        <input
          id="password"
          name="password"
          autocomplete="current-password"
          type="password"
          class="w-full dark:bg-gray-900 px-2"
          on:change={handleChange}
          bind:value={$form.password}
        />
      </div>
      <div class="col-span-3">
        <label class="my-2" for="new-password">New Password</label>
        <input
          id="new-password"
          name="new-password"
          autocomplete="new-password"
          type="password"
          class="w-full dark:bg-gray-900 px-2"
          on:change={handleChange}
          bind:value={$form.password}
        />
      </div>
      <input type="submit" class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3" value="Update"/>
    </form>
  </div>
  