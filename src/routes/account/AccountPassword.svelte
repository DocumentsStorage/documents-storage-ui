<script>
  import { createForm } from 'svelte-forms-lib';
  import * as yup from 'yup';
  import jwt_decode from 'jwt-decode';
  import Cookies from 'universal-cookie';
  import { SendHTTPrequest } from '../../services/api';
  import notificationStore from '../../components/NotificationStore.js';

  const {
    form,
    errors,
    handleChange,
    handleSubmit: handleUpdateAccount
  } = createForm({
    initialValues: {
      password: '',
      new_password: ''
    },
    validationSchema: yup.object().shape({
      password: yup.string().required(),
      new_password: yup.string().min(3).required()
    }),
    onSubmit: async (values) => {
      const cookies = new Cookies();
      const response = await SendHTTPrequest({
        endpoint: `/accounts/${jwt_decode(cookies.get('authToken')).client_id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          password: values.password,
          new_password: values.new_password
        }
      });
      if (response.status === 200) {
        notificationStore.set({
          message: 'Updated successfully',
          type: 'SUCCESS'
        });
      } else if (response.status > 400 && response.status < 500) {
        notificationStore.set({
          message: 'Could not change account data',
          type: 'ERROR'
        });
      }
    }
  });
</script>

<form on:submit={handleUpdateAccount} class="grid gap-10 grid-cols-3 my-5">
  <div class="col-span-3">
    <label class="my-2" for="name">Old password</label>
    <input
      id="password"
      name="password"
      autocomplete="current-password"
      type="password"
      class="w-full dark:bg-gray-900 font-bold px-2"
      on:change={handleChange}
      bind:value={$form.password}
    />
  </div>
  <small class="col-span-3 h-5">
    {#if $errors.password}
      {$errors.password}
    {/if}
  </small>
  <div class="col-span-3">
    <label class="my-2" for="name">New password</label>
    <input
      id="new_password"
      name="new_password"
      autocomplete="new-password"
      type="password"
      class="w-full dark:bg-gray-900 font-bold px-2"
      on:change={handleChange}
      bind:value={$form.new_password}
    />
  </div>
  <small class="col-span-3 h-5">
    {#if $errors.new_password}
      {$errors.new_password}
    {/if}
  </small>
  <input
    type="submit"
    class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
    value="Update password"
  />
</form>
