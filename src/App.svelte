<script>
	import { Router, Link, Route } from "svelte-routing";
	import Cookies from "universal-cookie";

	import Button from './common/button.svelte'

	import Login from "./routes/Login.svelte";
	import Account from "./routes/account/Account.svelte";
	import Documents from "./routes/Documents.svelte";


	export let url = "";

	export let logged = false;
	const cookies = new Cookies();
	const sessionToken = cookies.get("authToken");
	if (sessionToken) {
		console.log("Logged in");
		logged = true;
	}
</script>

<main
	class="min-h-screen min-w-screen dark:text-dark dark:bg-gray-800 dark:text-white"
>
	<Router {url}>
		<nav class="shadow-lg">
			<div class="flex justify-between items-center p-5 mx-4">
				<a href="/" class="text-white text-3xl font-bold">Documents Storage</a>
				<!-- Routes -->
				<nav>
					{#if !logged}
						<Link to="/"><Button>Login</Button></Link>
					{/if}
					{#if logged}
						
						<Link to="/documents"><Button>Documents</Button></Link>
						<Link to="/account"><Button>Account</Button></Link>
					{/if}
				</nav>
			</div>
		</nav>
		<div class="flex justify-center">
			<Route path="/"><Login /></Route>
			<Route path="/documents"><Documents /></Route>
			<Route path="/account"><Account /></Route>
		</div>
	</Router>
</main>

<style global lang="postcss">
	@import url("https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600&display=swap");
	:global(:root) {
		font-family: "Raleway", sans-serif;
	}
	:global(body) {
		padding: 0;
	}

	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
