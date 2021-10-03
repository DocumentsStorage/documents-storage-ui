<script>
	import { Router, Link, Route, navigate } from "svelte-routing";
	import Cookies from "universal-cookie";

	import Notification from "components/Notification.svelte";
	import Button from "common/Button.svelte";
	import ModLink from "common/ModLink.svelte";

	import Login from "./routes/Login.svelte";
	import Account from "./routes/account/Account.svelte";
	import Documents from "./routes/documents/Documents.svelte";
	import Manage from "./routes/manage/Manage.svelte";
	import DocumentTypes from "./routes/documentTypes/DocumentTypes.svelte";
	import Tags from "./routes/tags/Tags.svelte";

	import jwt_decode from "jwt-decode";

	import { checkRoute, sessionInfo } from "services/route-guard.js";
	import { onMount } from "svelte";

	export let fullScreenMenuOpen = false;
	export let url = "";
	export let showSettings = false;
	export let isLogged = false;
	export let rank = "";

	sessionInfo.subscribe((value) => {
		isLogged = value.isLogged;
		rank = value.rank;
	});

	function logout() {
		const cookies = new Cookies();
		cookies.remove("authToken");
		sessionInfo.set({ isLogged: false });
		navigate("/", { replace: true });
	}

	// Routing guards
	onMount(() => {
		const cookies = new Cookies();
		try {
			const currentSessionInfo = jwt_decode(cookies.get("authToken"));
			if (currentSessionInfo.exp > Date.now() / 1000) {
				sessionInfo.set({ isLogged: true, ...currentSessionInfo });
			} else {
				cookies.remove("authToken");
			}
		} catch (e) {
			return e;
			// console.error(e);
		}
		checkRoute();
	});
</script>

<main
	class="min-h-screen min-w-screen dark:text-dark dark:bg-gray-800 dark:text-white"
>
	<Notification />
	<Router {url}>
		<div class="shadow-lg">
			<div class="flex justify-between items-center p-5 mx-4">
				<h1 class="dark:text-white font-bold">Documents Storage</h1>
				<p
					class="md:hidden p-2 rounded bg-gray-700 flex items-center text-xl"
					on:click={() => {
						let mobileMenu = document.getElementById("mobileMenu");
						mobileMenu.classList.toggle("active");
						fullScreenMenuOpen = true;
					}}
				>
					<i class="ph-list" />
				</p>

				<!-- Routes -->
				<nav
					on:click={() => {
						let mobileMenu = document.getElementById("mobileMenu");
						mobileMenu.classList.remove("active");
						fullScreenMenuOpen = false;
					}}
					class="hidden absolute inset-0 bg-gray-900 px-2 py-2 flex md:block md:static md:flex-row md:mt-0 md:bg-transparent"
					id="mobileMenu"
				>
					{#if fullScreenMenuOpen}
						<div
							on:click={() => {
								let mobileMenu =
									document.getElementById("mobileMenu");
								mobileMenu.classList.toggle("active");
								fullScreenMenuOpen = false;
							}}
							class="flex justify-end text-2xl"
						>
							<i class="ph-x" />
						</div>
					{/if}
					{#if !isLogged}
						<Link to="/"><Button>Login</Button></Link>
					{/if}
					{#if isLogged}
						<Link to="/documents"><Button>Documents</Button></Link>
						<!-- Large -->
						<div class="relative inline-block text-left">
							<div>
								<span
									on:click={() =>
										(showSettings = !showSettings)}
								>
									<Button>Settings</Button>
								</span>
							</div>
							{#if showSettings && !fullScreenMenuOpen}
								<div
									class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="menu-button"
									tabindex="-1"
								>
									<div class="py-1" role="none">
										<span
											role="menuitem"
											tabindex="-1"
											id="menu-item-0"
											class="block my-2"
										>
											<Link to="/account">
												<ModLink>
													<i
														class="ph-user mr-2"
													/>Account details
												</ModLink>
											</Link>
										</span>
										{#if rank === "admin"}
											<span
												role="menuitem"
												tabindex="-1"
												id="menu-item-1"
												class="block my-2"
											>
												<Link to="/manage">
													<ModLink>
														<i
															class="ph-table mr-2"
														/>Manage
													</ModLink>
												</Link>
											</span>
										{/if}
										<span
											role="menuitem"
											tabindex="-1"
											id="menu-item-2"
											class="block my-2"
										>
											<a
												href="https://github.com/DocumentsStorage"
												><ModLink
													><i
														class="ph-lifebuoy mr-2"
													/>App support</ModLink
												></a
											>
										</span>
										<div class="py-1" role="none">
											<span
												on:click={() => logout()}
												role="menuitem"
												tabindex="-1"
												id="menu-item-3"
												class="block my-2"
												><ModLink
													><i
														class="ph-sign-out mr-2 ml-1"
													/>Sign out</ModLink
												></span
											>
										</div>
									</div>
								</div>
							{/if}
						</div>
						<!-- Mobile -->
						{#if fullScreenMenuOpen}
							<div class="md:hidden">
								<Link to="/account" class="mx-5"
									><Button>Account</Button></Link
								>
								<Link to="/manage"><Button>Manage</Button></Link
								>
								<a class="mx-5" href="https://github.com/DocumentsStorage"
									><Button>
									<i class="ph-lifebuoy mr-2" />App
										support</Button
									></a
								>
								<span class="mx-5" on:click={() => logout()}
									><Button
										><i class="ph-sign-out mr-2 ml-1" />Sign
										out</Button
									></span
								>
							</div>
						{/if}
					{/if}
				</nav>
			</div>
		</div>
		{#if !fullScreenMenuOpen}
			<div class="flex justify-center">
				<Route path="/"><Login /></Route>
				<Route path="/documents"><Documents /></Route>
				<Route path="/account"><Account /></Route>
				<Route path="/manage"><Manage /></Route>
				<Route path="/document-types"><DocumentTypes /></Route>
				<Route path="/tags"><Tags /></Route>
			</div>
		{/if}
	</Router>
</main>

<style global lang="postcss">
	@import url("/phosphor.css");

	@font-face {
		font-family: "Poppins";
		src: url("/fonts/Poppins/Poppins-Regular.ttf");
	}

	@font-face {
		font-family: "Raleway";
		src: url("/fonts/Raleway/Raleway-Regular.ttf");
	}

	:global(:root) {
		font-family: "Poppins", sans-serif;
	}

	:global(body) {
		padding: 0;
	}

	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	@layer base {
		h1,
		h2,
		h3 {
			font-family: "Raleway";
		}
		h1 {
			@apply text-2xl;
		}
		h2 {
			@apply text-xl;
		}
	}
	nav > * {
		margin: 0 1rem;
	}
	nav a:hover {
		text-decoration: none;
	}
	.active {
		display: block;
	}
</style>
