import { writable } from 'svelte/store';

const notificationStore = writable({
    message: '',
    type: 'SUCCESS'
});

export default notificationStore;
