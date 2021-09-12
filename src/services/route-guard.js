import { navigate } from "svelte-routing";
import { writable } from 'svelte/store';

export const logged = writable(false);

export function checkRoute(){
    let isLogged = false 
    logged.subscribe((value)=> isLogged = value)
    if (isLogged) {
        if(window.location.pathname === "/"){
            navigate("/documents", { replace: true });
        }
    } else {
        navigate("/", { replace: true });
    }
}