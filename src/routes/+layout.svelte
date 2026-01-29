<script>
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { onDestroy, onMount } from 'svelte';
  import { startSSE, stopSSE } from '$lib';

  let { children } = $props();
  onMount(startSSE);
  onDestroy(stopSSE);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
