<script>
    import { SendHTTPrequest } from "../../../services/api";
    import notificationStore from "../../../components/NotificationStore.js";
    import ActionsModal from "../../../components/ActionsModal.svelte";
    import { onMount } from "svelte";

    export let accounts = [];
    export let currentAccount = "";
    export let modalConfig = {
        show: false,
        title: "",
        message: "",
        cancelAction: "",
        proceedAction: "",
        callback: null,
    };

    async function resetPassword() {
        const temporaryPassword = Math.floor(Math.random() * 9000 + 999);
        modalConfig.show = false;
        const response = await SendHTTPrequest({
            endpoint: "/accounts/update",
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                id: currentAccount,
                new_password: temporaryPassword,
            },
        });
        if(response.status === 200){
            notificationStore.set({
                message: `New account password is: ${temporaryPassword}`,
                type: "SUCCESS",
            });
        } else if(response.status === 404){
            notificationStore.set({
                message: `Not found account`,
                type: "ERROR",
            });
        }
    }

    function startResetPassword() {
        modalConfig = {
            show: true,
            title: "Reset password",
            message:
                "This action will result in reseting password for account, new password will be prompted to you as notification for few seconds. Make sure user will change it!.",
            cancelAction: "Cancel",
            proceedAction: "Reset",
            callback: resetPassword,
        };
    }

    async function deleteAccount(){
        modalConfig.show = false;
        const response = await SendHTTPrequest({
            endpoint: `/accounts/delete?account_id=${currentAccount}`,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if(response.status === 200){
            notificationStore.set({
                message: `Account has been deleted`,
                type: "SUCCESS",
            });
        } else if(response.status === 404){
            notificationStore.set({
                message: `Not found account`,
                type: "ERROR",
            });
        }
    }

    function startDeleteAccount(){
        modalConfig = {
            show: true,
            title: "Delete account",
            message:
                "This action is irreversible. Whole account will be deleted, only documents linked to this account will persist.",
            cancelAction: "Cancel",
            proceedAction: "Delete",
            callback: deleteAccount,
        };
    }

    onMount(async () => {
        const response = await SendHTTPrequest({
            endpoint: "/accounts/list?limit=20",
            method: "GET",
        });
        if (response.status === 200) {
            accounts = response.data;
        }
    });
</script>

<h1 class="text-xl">Accounts</h1>
<ul>
    {#each accounts as account}
        <li class="dark:bg-gray-600 rounded p-2 flex items-center">
            <!-- Stacked -->
            <div class="mx-3">
                <p>{account.username}</p>
                <small>{account.rank}</small>
            </div>
            <!-- Inline -->
            <div class="mx-5 flex">
                <span
                    class="flex items-center pl-5 dark:text-white text-black hover:text-yellow-300"
                    on:click={() => {
                        startResetPassword();
                        currentAccount = account._id.$oid;
                    }}
                    ><i class="ph-key mx-2" />
                    Reset Password</span
                >
                <span
                    class="flex items-center pl-5 dark:text-white text-black hover:text-red-500"
                    on:click={() => {
                        startDeleteAccount();
                        currentAccount = account._id.$oid;
                    }}
                    ><i class="ph-user-minus mx-2 hover:text-red" />
                    Delete</span
                >
            </div>
        </li>
    {/each}
</ul>
<ActionsModal on:proceed={modalConfig.callback} {...modalConfig} />

<style>
    span {
        cursor: pointer;
        transition-duration: 0.2s;
    }
</style>
