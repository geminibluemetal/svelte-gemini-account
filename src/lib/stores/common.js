import { writable } from 'svelte/store';

export let commonDate = writable(new Date());