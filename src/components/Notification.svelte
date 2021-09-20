<script>
    import notificationStore from './NotificationStore';

    export let showNotification = false;
    export let notificationMessage = '';
    export let notificationType = 'SUCCESS';

    function showNotificationCall(message, type) {
        if (message.length > 0) {
            showNotification = true;
            notificationType = type;
            notificationMessage = message;
            setTimeout(() => {
                showNotification = false;
            }, 4500);
        }
    }

    notificationStore.subscribe((value) => {
        showNotificationCall(value.message, value.type);
    });
</script>

{#if showNotification}
    <div
        class="
        {notificationType === 'SUCCESS' && 'bg-green-500'} 
        {notificationType === 'WARNING' && 'bg-yellow-500'} 
        {notificationType === 'ERROR' && 'bg-red-500'} 
        absolute py-2 px-6 rounded-full mt-5 mx-5
        "
    >
        <p>{notificationMessage}</p>
    </div>
{/if}

<style>
    @keyframes showNotification {
        0% {
            opacity: 0%;
        }
        100% {
            opacity: 100%;
        }
    }

    div {
        transition-timing-function: linear;
        animation-name: showNotification;
        animation-duration: 0.3s;
    }
</style>
