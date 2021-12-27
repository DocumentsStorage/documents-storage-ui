<script>
	import { Router, Link, Route, navigate } from "svelte-routing";
	import Cookies from "universal-cookie";
    import notificationStore from "components/NotificationStore.js";

	import Notification from "components/Notification.svelte";
	import Button from "common/Button.svelte";
	import ModLink from "common/ModLink.svelte";

	import { X, List, Lifebuoy, SignOut, User, Table } from "phosphor-svelte";

	import Login from "./routes/Login.svelte";
	import Account from "./routes/account/Account.svelte";
	import Documents from "./routes/documents/Documents.svelte";
	import Manage from "./routes/manage/Manage.svelte";
	import DocumentTypes from "./routes/documentTypes/DocumentTypes.svelte";
	import Tags from "./routes/tags/Tags.svelte";

	import jwt_decode from "jwt-decode";

	import { checkRoute, sessionInfo } from "services/route-guard.js";
	import { onMount } from "svelte";
	import { SendHTTPrequest } from "services/api.js";

	export let fullScreenMenuOpen = false;
	export let url = "";
	export let showSettings = false;
	export let isLogged = false;

	$: checkRoute(window.location.pathname)

	sessionInfo.subscribe((value) => {
		isLogged = value.isLogged;
	});

	function logout() {
		const cookies = new Cookies();
		cookies.remove("authToken");
		sessionInfo.set({ isLogged: false });
		navigate("/", { replace: true });
	}

	async function getSessionNotifications(){
		const response = await SendHTTPrequest({
			endpoint: '/accounts/session/notifications',
			method: 'GET'
		})
		const notifications = response.data.notifications.filter((element)=> { return !element.seen })
		notifications.forEach((element)=>{
			notificationStore.set({
          		message: element.text,
          		type: 'SUCCESS'
        	})
		})
	}

	async function updateToken(){
      const response = await SendHTTPrequest({
        endpoint: '/token/update',
        method: 'POST'
      });
      if (response.status === 200) {
        const cookies = new Cookies();
        cookies.set('authToken', response.data.access_token, {
          sameSite: 'strict'
        });
        const currentSessionInfo = jwt_decode(response.data.access_token);
        if (currentSessionInfo) {
          sessionInfo.set({isLogged: true, ...currentSessionInfo});
        }
      } else if (response.status > 400 && response.status < 500) {
        notificationStore.set({
          message: 'Could not update token',
          type: 'ERROR'
        });
      }
    }

	// Routing guards
	onMount(() => {
		const cookies = new Cookies();
		try {
			const currentSessionInfo = jwt_decode(cookies.get("authToken"));
			if (currentSessionInfo.exp > Date.now() / 1000) {
				if(currentSessionInfo.exp - Date.now() / 1000 < 60*30){
					updateToken();
				}
				sessionInfo.set({ isLogged: true, ...currentSessionInfo });
				getSessionNotifications()
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
					<List />
				</p>

				<!-- Routes -->
				<nav
					on:click={() => {
						let mobileMenu = document.getElementById("mobileMenu");
						mobileMenu.classList.remove("active");
						fullScreenMenuOpen = false;
					}}
					class="hidden absolute inset-0 bg-gray-900 pl-12 py-2 md:px-2 flex md:block md:static md:flex-row md:mt-0 md:bg-transparent"
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
							<X />
						</div>
					{/if}
					{#if !isLogged}
						<Link
							to="/"
							class="nav_mobile_btn md:mt-0 md:inline-block"
							><Button>Login</Button></Link
						>
					{/if}
					{#if isLogged}
						<Link
							to="/documents"
							class="nav_mobile_btn md:mt-0 md:inline-block"
							><Button>Documents</Button></Link
						>
						<!-- Large -->
						<div
							id="settings_menu"
							class="relative nav_mobile_btn md:mt-0 md:inline-block text-left"
						>
							<div>
								<span
									on:click={() =>(showSettings = !showSettings)}
								>
									<Button>Settings</Button>
								</span>
							</div>
							{#if showSettings && !fullScreenMenuOpen}
								<div
									class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-10"
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
													<User />Account details
												</ModLink>
											</Link>
										</span>
											<span
												role="menuitem"
												tabindex="-1"
												id="menu-item-1"
												class="block my-2"
											>
												<Link to="/manage">
													<ModLink>
														<Table />Manage
													</ModLink>
												</Link>
											</span>
										<span
											role="menuitem"
											tabindex="-1"
											id="menu-item-2"
											class="block my-2"
										>
											<a
												href="https://github.com/DocumentsStorage"
												><ModLink
													><Lifebuoy />App support</ModLink
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
													><SignOut />Sign out</ModLink
												></span
											>
										</div>
									</div>
								</div>
							{/if}
						</div>
						<!-- Mobile -->
						{#if fullScreenMenuOpen}
							<div class="md:hidden nav_mobile_btn">
								<Link to="/account" class="nav_mobile_btn"
									><Button>Account</Button></Link
								>
								<Link to="/manage" class="nav_mobile_btn"
									><Button>Manage</Button></Link
								>
								<a
									class="nav_mobile_btn"
									href="https://github.com/DocumentsStorage"
									><Button>
										<Lifebuoy /> App support</Button
									></a
								>
								<span
									class="nav_mobile_btn"
									on:click={() => logout()}
									><Button><SignOut /> Sign out</Button></span
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

	.nav_mobile_btn {
		display: block;
		margin-top: 3.5rem;
	}
	.active {
		display: block;
	}
</style>
