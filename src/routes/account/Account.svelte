<script>
  import AccountData from './AccountData.svelte';
  import AccountPassword from './AccountPassword.svelte';
  import { onMount } from "svelte";
	import { SendHTTPrequest } from "services/api.js";

  export let notifications = [];


  async function getSessionNotifications(){
		const response = await SendHTTPrequest({
			endpoint: '/accounts/session/notifications',
			method: 'GET'
		});
		return response.data.notifications;
	}

  onMount(async () => {
      notifications = await getSessionNotifications();
  });
</script>

<div class="mt-10 p-5 rounded-md shadow-lg dark:bg-gray-800 grid flex justify-center">
  <h1 class="justify-self-center">Account</h1>
  <div>
    <AccountData />
    <AccountPassword />
    <div class="my-10">
      <h2 class="justify-self-center">Latest notifications</h2>
        {#if notifications.length > 0}
                {#each notifications as notification}
                <div class="dark:bg-gray-900 rounded mx-5 my-3 px-2 py-1 max-w-md">
                <p class="text-base">{notification.text}</p>
                <small>{new Date(notification.creation_date["$date"]).toLocaleString()}</small>
                </div>
                {/each}
        {/if}
    </div>
    <p>App version: {APP_VERSION}</p>
  </div>
</div>
