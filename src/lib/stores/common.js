import { writable } from 'svelte/store';

export let commonDate = writable(new Date());
export let commonCurrontCashReportIndex = writable(null);