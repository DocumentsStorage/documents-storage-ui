import { navigate } from 'svelte-routing';
import { writable } from 'svelte/store';

export const sessionInfo = writable({
    isLogged: false,
    client_id: '',
    rank: '',
    exp: ''
});

export function checkRoute() {
    let isLogged = false;
    sessionInfo.subscribe((value) => isLogged = value.isLogged);
    if (isLogged) {
        if (window.location.pathname === '/') {
            navigate('/documents', { replace: true });
        }
    } else {
        navigate('/', { replace: true });
    }
}
