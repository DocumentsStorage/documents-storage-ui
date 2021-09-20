<script>
    import { SendHTTPrequest } from '../../../services/api';
    import notificationStore from '../../../components/NotificationStore.js';
    import ActionsModal from '../../../components/ActionsModal.svelte';
    import { onMount } from 'svelte';

    export let allAccounts = [];
    export let currentAccount = null;
    export let modalConfig = {
        show: false,
        title: '',
        message: '',
        cancelAction: '',
        proceedAction: '',
        callback: null
    };

    async function resetPassword() {
        const temporaryPassword = Math.floor(Math.random() * 9000 + 999);
        modalConfig.show = false;
        const response = await SendHTTPrequest({
            endpoint: `/accounts/${currentAccount._id.$oid}`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: currentAccount._id.$oid,
                new_password: temporaryPassword
            }
        });
        if (response.status === 200) {
            notificationStore.set({
                message: `New account password is: ${temporaryPassword}`,
                type: 'SUCCESS'
            });
        } else if (response.status === 404) {
            notificationStore.set({
                message: 'Not found account',
                type: 'ERROR'
            });
        }
    }

    function startResetPassword() {
        modalConfig = {
            show: true,
            title: `Reset password for ${currentAccount.username}`,
            message:
                'This action will result in reseting password for account, new password will be prompted to you as notification for few seconds. Make sure user will change it!.',
            cancelAction: 'Cancel',
            proceedAction: 'Reset',
            callback: resetPassword
        };
    }

    async function deleteAccount() {
        modalConfig.show = false;
        const response = await SendHTTPrequest({
            endpoint: `/accounts/${currentAccount._id.$oid}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            notificationStore.set({
                message: 'Account has been deleted',
                type: 'SUCCESS'
            });
            allAccounts = allAccounts.filter((account) => account.username !== currentAccount.username);
        } else if (response.status === 404) {
            notificationStore.set({
                message: 'Not found account',
                type: 'ERROR'
            });
        }
    }

    function startDeleteAccount() {
        modalConfig = {
            show: true,
            title: `Delete ${currentAccount.username} account`,
            message:
                'This action is irreversible. Whole account will be deleted, only documents linked to this account will persist.',
            cancelAction: 'Cancel',
            proceedAction: 'Delete',
            callback: deleteAccount
        };
    }

    onMount(async () => {
        const response = await SendHTTPrequest({
            endpoint: '/accounts/list?limit=20',
            method: 'GET'
        });
        if (response.status === 200) {
            allAccounts = response.data;
        }
    });
</script>

<div class="rounded-md shadow-lg">
    <h1 class="text-xl">Accounts</h1>
    <ul class="mt-5">
        {#each allAccounts as account}
            <li class="dark:bg-gray-600 rounded mt-5 p-2 flex items-center">
                <!-- Stacked -->
                <div class="w-1/6 ml-2">
                    <p>{account.username}</p>
                    <small>{account.rank}</small>
                </div>
                <!-- Inline -->
                <div class="mx-5 flex">
                    <span
                        class="flex items-center pl-5 dark:text-white text-black hover:text-yellow-300"
                        on:click={() => {
                            currentAccount = account;
                            startResetPassword();
                        }}
                        ><i class="ph-key mx-2" />
                        Reset Password</span
                    >
                    <span
                        class="flex items-center pl-5 dark:text-white text-black hover:text-red-500"
                        on:click={() => {
                            currentAccount = account;
                            startDeleteAccount();
                        }}
                        ><i class="ph-user-minus mx-2" />
                        Delete</span
                    >

                    <span
                        class="flex items-center pl-5 dark:text-white text-black"
                        on:click={() => {
                            currentAccount = account;
                        }}
                    >
                    <i class="ph-pencil-simple mx-2" />Update
                        </span
                    >
                </div>
            </li>
        {/each}
    </ul>
</div>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />

<style>
    span {
        cursor: pointer;
        transition-duration: 0.2s;
    }
</style>
