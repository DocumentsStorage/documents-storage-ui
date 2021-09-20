<script>
	import { Router, Link, Route, navigate } from 'svelte-routing';
	import Cookies from 'universal-cookie';

	import Notification from 'components/Notification.svelte';
	import Button from 'common/Button.svelte';
	import ModLink from 'common/ModLink.svelte';

	import Login from './routes/Login.svelte';
	import Account from './routes/account/Account.svelte';
	import Documents from './routes/documents/Documents.svelte';
	import Manage from './routes/manage/Manage.svelte';
	import DocumentTypes from './routes/documentTypes/DocumentsTypes.svelte';

	import jwt_decode from 'jwt-decode';

	import { checkRoute, sessionInfo } from './services/route-guard';
	import { onMount } from 'svelte';

	export let url = '';
	export let showSettings = false;
	export let isLogged = false;
	export let rank = '';

	sessionInfo.subscribe((value) => {
		isLogged = value.isLogged;
		rank = value.rank;
	});

	function logout() {
		const cookies = new Cookies();
		cookies.remove('authToken');
		sessionInfo.set({ isLogged: false });
		navigate('/', { replace: true });
	}

	// Routing guards
	onMount(() => {
		const cookies = new Cookies();
		try {
			const currentSessionInfo = jwt_decode(cookies.get('authToken'));
			if (currentSessionInfo.exp > Date.now() / 1000) {
				sessionInfo.set({ isLogged: true, ...currentSessionInfo });
			} else {
				cookies.remove('authToken');
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
				<p class="dark:text-white text-3xl font-bold">
					Documents Storage
				</p>

				<!-- Routes -->
				<nav>
					{#if !isLogged}
						<Link to="/"><Button>Login</Button></Link>
					{/if}
					{#if isLogged}
						<Link to="/documents"><Button>Documents</Button></Link>
						<div class="relative inline-block text-left">
							<div>
								<span
									on:click={() =>
										(showSettings = !showSettings)}
								>
									<Button>Settings</Button>
								</span>
							</div>
							{#if showSettings}
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
										{#if rank === 'admin'}
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
					{/if}
				</nav>
			</div>
		</div>
		<div class="flex justify-center">
			<Route path="/"><Login /></Route>
			<Route path="/documents"><Documents /></Route>
			<Route path="/account"><Account /></Route>
			<Route path="/manage"><Manage /></Route>
			<Route path="/document-types"><DocumentTypes /></Route>
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

	nav > * {
		margin: 0 1rem;
	}
	nav a:hover {
		text-decoration: none;
	}
</style>
