<script>
  import AccountData from './AccountData.svelte';
  import AccountPassword from './AccountPassword.svelte';
</script>

<div class="mt-10 p-5 rounded-md shadow-lg dark:bg-gray-800 grid flex justify-center">
  <h1 class="justify-self-center">Account</h1>
  <div>
    <AccountData />
    <AccountPassword />
  </div>
</div>
