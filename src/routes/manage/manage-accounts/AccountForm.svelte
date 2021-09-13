<script>
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { SendHTTPrequest } from "../../../services/api";
  import notificationStore from "../../../components/NotificationStore.js";

  export let allAccounts;
  export let currentAccount = null;

  function resetForm() {
    $form.username = null;
    $form.password = null;
    $form.rank = "user";
    currentAccount = null;
  }

  $: currentAccount, loadAccount();

  function loadAccount() {
    if (currentAccount) {
      $form.rank = currentAccount.rank;
    } else {
      $form.rank = "user";
    }
  }

  async function createAccount(accountData) {
    const response = await SendHTTPrequest({
      endpoint: "/accounts/add",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: accountData,
    });
    if (response.status === 200) {
      notificationStore.set({
        message: "Added account",
        type: "SUCCESS",
      });
      allAccounts.push({
        _id: { $oid: response.data.id.$oid },
        ...accountData,
      });
      allAccounts = allAccounts;
      resetForm();
    } else if (response.status > 400 && response.status < 500) {
      notificationStore.set({
        message: "Could not create account.",
        type: "ERROR",
      });
    }
  }

  async function updateAccount(accountData) {
    const response = await SendHTTPrequest({
      endpoint: "/accounts/update",
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      data: accountData,
    });
    if (response.status === 200) {
      notificationStore.set({
        message: "Updated account.",
        type: "SUCCESS",
      });
      // allAccounts = allAccounts.map({_id: {$oid: response.data.id}, ...accountData})
      allAccounts = allAccounts.map((account) => {
        if (account._id.$oid === currentAccount._id.$oid) {
          return Object.assign(account, accountData);
        } else {
          return account;
        }
      });
      resetForm();
    } else if (response.status > 400 && response.status < 500) {
      notificationStore.set({
        message: "Could not update account.",
        type: "ERROR",
      });
    }
  }

  // Form

  const {
    form,
    errors,
    state,
    handleChange,
    handleSubmit: handleUpdateAccount,
  } = createForm({
    initialValues: {
      username: null,
      password: null,
      rank: "user",
    },
    validationSchema: yup.object().shape({
      username: yup.string().min(1).nullable(true),
      password: yup.string().min(3).nullable(true),
      rank: yup.string().oneOf(["admin", "user"]).nullable(true),
    }),
    onSubmit: async (values) => {
      if (values.password) {
        await createAccount(values);
      } else {
        await updateAccount({ id: currentAccount._id.$oid, ...values });
      }
    },
  });
</script>

<div class="mt-5 rounded-md shadow-lg dark:bg-gray-800 flex justify-center">
  <form on:submit={handleUpdateAccount} class="grid gap-5 grid-cols-3 my-5">
    <div class="w-full col-span-3 flex justify-between">
      <h1 class="text-2xl">
        {#if currentAccount}
          Update account
        {:else}
          Add account
        {/if}
      </h1>
      {#if currentAccount}
        <i
          on:click={() => {
            resetForm();
          }}
          class="ph-x"
        />
      {/if}
    </div>
    <div class="col-span-3">
      <label class="my-2" for="username">Username</label>
      <input
        id="username"
        name="username"
        autocomplete="username"
        placeholder={currentAccount?.username}
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

    {#if !currentAccount}
      <div class="col-span-3">
        <label class="my-2" for="password">Password</label>
        <input
          id="password"
          name="password"
          autocomplete="new-password"
          type="password"
          placeholder="Minimum 3 characters"
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
    {/if}

    <div class="col-span-3">
      <label for="rank">Rank</label>
      <select
        id="rank"
        name="rank"
        class="w-full dark:bg-gray-900"
        on:change={handleChange}
        bind:value={$form.rank}
      >
        <option>user</option>
        <option>admin</option>
      </select>
    </div>
    <small class="col-span-3 h-5">
      {#if $errors.rank}
        {$errors.rank}
      {/if}
    </small>

    <input
      type="submit"
      class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 px-5 col-start-3"
      value={currentAccount ? "Update" : "Add"}
    />
  </form>
</div>
