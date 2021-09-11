<script>
	import { Router, Link, Route, navigate } from "svelte-routing";
	import Cookies from "universal-cookie";
	import Button from './common/button.svelte'
	import Login from "./routes/Login.svelte";
	import Account from "./routes/account/Account.svelte";
	import Documents from "./routes/documents/Documents.svelte";
	import { checkRoute, logged } from "./services/route-guard";
	import { onMount } from "svelte";

	export let url = "";
	export let isLogged = false;
	
	logged.subscribe(value => {
		isLogged = value;
	});

	function logout(){
		const cookies = new Cookies();
		cookies.remove("authToken")
		logged.set(false)
		navigate("/", {replace: true})
	}

	// Routing guards
	onMount(()=> {
		const cookies = new Cookies();
		cookies.get("authToken") && logged.set(true)
		checkRoute()
	})
	
</script>

<main
	class="min-h-screen min-w-screen dark:text-dark dark:bg-gray-800 dark:text-white"
>
	<Router {url}>
		<div class="shadow-lg">
			<div class="flex justify-between items-center p-5 mx-4">
				<p class="dark:text-white text-3xl font-bold">Documents Storage</p>
				<!-- Routes -->
				<nav>
					{#if !isLogged}
						<Link to="/"><Button>Login</Button></Link>
					{/if}
					{#if isLogged}
						<Link to="/documents"><Button>Documents</Button></Link>
						<Link to="/account"><Button>Account</Button></Link>
						<span on:click={()=>logout()}><Button><i class="ph-sign-out"></i></Button></span>
					{/if}
				</nav>
			</div>
		</div>
		<div class="flex justify-center">
			<Route path="/"><Login /></Route>
			<Route path="/documents"><Documents /></Route>
			<Route path="/account"><Account /></Route>
		</div>
	</Router>
</main>

<style global lang="postcss">
	@import url("https://unpkg.com/phosphor-icons@1.3.2/src/css/phosphor.css");
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

	nav > *{
		margin: 0 1rem;
	}
</style>
