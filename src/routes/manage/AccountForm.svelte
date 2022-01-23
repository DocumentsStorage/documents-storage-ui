<script>
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { SendHTTPrequest } from "services/api.js";
  import notificationStore from "components/NotificationStore.js";
  import ActionsModal from "components/ActionsModal.svelte";
  import { Key, UserMinus, X } from "phosphor-svelte";

  export let allAccounts;
  export let currentAccount = null;
  export let modalConfig = {
    show: false,
    title: "",
    message: "",
    cancelAction: "",
    proceedAction: "",
  };

  function resetForm() {
    $form.username = null;
    $form.new_password = null;
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

  async function resetPassword() {
    const temporaryPassword = Math.floor(Math.random() * 9000 + 999);
    modalConfig.show = false;
    const response = await SendHTTPrequest({
      endpoint: `/accounts/${currentAccount._id.$oid}`,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        id: currentAccount._id.$oid,
        new_password: temporaryPassword,
      },
    });
    if (response.status === 200) {
      notificationStore.set({
        message: `New account password is: ${temporaryPassword}`,
        type: "SUCCESS",
      });
    } else if (response.status === 404) {
      notificationStore.set({
        message: "Not found account",
        type: "ERROR",
      });
    } else {
      notificationStore.set({
        message: response.data.detail.message,
        type: "ERROR",
      });
    }
  }

  function startResetPassword() {
    modalConfig = {
      show: true,
      title: `Reset password for ${currentAccount.username}`,
      message:
        "This action will result in reseting password for account, new password will be prompted to you as notification for few seconds. Make sure user will change it!.",
      cancelAction: "Cancel",
      proceedAction: "Reset",
      callback: resetPassword,
    };
  }

  async function deleteAccount() {
    modalConfig.show = false;
    const response = await SendHTTPrequest({
      endpoint: `/accounts/${currentAccount._id.$oid}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      notificationStore.set({
        message: "Account has been deleted",
        type: "SUCCESS",
      });
      allAccounts = allAccounts.filter(
        (account) => account.username !== currentAccount.username
      );
      resetForm();
    } else if (response.status === 404) {
      notificationStore.set({
        message: "Not found account",
        type: "ERROR",
      });
    }
  }

  function startDeleteAccount() {
    modalConfig = {
      show: true,
      title: `Delete ${currentAccount.username} account`,
      message:
        "This action is irreversible. Whole account will be deleted, only documents linked to this account will persist.",
      cancelAction: "Cancel",
      proceedAction: "Delete",
      callback: deleteAccount,
    };
  }

  async function createAccount(accountData) {
    const response = await SendHTTPrequest({
      endpoint: "/accounts",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: accountData,
    });
    if (response.status === 201) {
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
    accountData.new_password = accountData.new_password
      ? accountData.new_password
      : delete accountData["new_password"];
    const response = await SendHTTPrequest({
      endpoint: `/accounts/${accountData.id}`,
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
    handleChange,
    handleSubmit: handleAccountSubmit,
  } = createForm({
    initialValues: {
      username: null,
      new_password: null,
      rank: "user",
    },
    validationSchema: yup.object().shape({
      username: yup.string().min(1).nullable(true),
      new_password: yup.string().min(3).nullable(true),
      rank: yup.string().oneOf(["admin", "user"]).nullable(true),
    }),
    onSubmit: async (values) => {
      if (!currentAccount) {
        await createAccount(values);
      } else {
        await updateAccount({ id: currentAccount._id.$oid, ...values });
      }
    },
  });
</script>

<div class="w-full mt-5 rounded-md shadow-lg dark:bg-gray-800 p-1">
  <form on:submit={handleAccountSubmit} class="grid grid-cols-3">
    <div class="col-span-3 flex justify-between">
      <h1>
        {#if currentAccount}
          Update account
        {:else}
          Add account
        {/if}
      </h1>
      {#if currentAccount}
        <span
          on:click={() => {
            resetForm();
          }}
          class="mr-2"
        >
          <X />
        </span>
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
        <label class="my-2" for="new_password">Password</label>
        <input
          id="new_password"
          name="new_password"
          autocomplete="new-password"
          type="password"
          placeholder="Minimum 3 characters"
          class="w-full dark:bg-gray-900 px-2"
          on:change={handleChange}
          bind:value={$form.new_password}
        />
      </div>
      <small class="col-span-3 h-5">
        {#if $errors.new_password}
          {$errors.new_password}
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
      class="dark:bg-gray-800 dark:active:bg-gray-900 dark:text-white rounded-lg shadow-md py-2 col-start-3"
      value={currentAccount ? "Update" : "Add"}
    />
    <div class="flex col-span-3 mt-5">
      {#if currentAccount}
        <span
          class="flex items-center mx-2 dark:text-white hover:text-yellow-300 cursor-pointer"
          on:click={() => {
            startResetPassword();
          }}
          ><span class="mx-2"><Key /></span>
          Reset Password</span
        >
        <span
          class="flex items-center mx-2 dark:text-white hover:text-red-500 cursor-pointer"
          on:click={() => {
            startDeleteAccount();
          }}
          ><span class="mx-2"><UserMinus /></span>
          Delete</span
        >
      {/if}
    </div>
  </form>
</div>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />
