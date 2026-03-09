<script>
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { startSSE, stopSSE } from '$lib/core/client/sseReceiver';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Toast from '$lib/components/Toast.svelte';
  import { resolve } from '$app/paths';
  import { identifyDevice } from '$lib/core/client/fingerprint';

  let { children, data } = $props();
  const apps = $derived(data.apps);

  const gotoHome = () => goto(resolve('/'));

  // store handlers so off() works correctly
  const shortcutHandlers = [];

  async function setVisitorIdInCookie() {
    const visitorId = await identifyDevice();
    document.cookie = `visitorId=${visitorId}; path=/; max-age=31536000; SameSite=Lax`;
  }

  onMount(() => {
    setVisitorIdInCookie();
    startSSE();
    // sidebar toggle
    // keyboardEventBus.on('Alt+X', toggleOpen);
    keyboardEventBus.on('Alt+H', gotoHome);

    // dynamic route shortcuts
    apps.forEach((app) => {
      const handler = () => goto(resolve(app.url));
      shortcutHandlers.push({ key: app.key, handler });
      keyboardEventBus.on(`Alt+${app.key}`, handler);
    });
  });

  onDestroy(() => {
    stopSSE();

    // keyboardEventBus.off('Alt+X', toggleOpen);
    keyboardEventBus.off('Alt+H', gotoHome);

    shortcutHandlers.forEach(({ key, handler }) => {
      keyboardEventBus.off(`Alt+${key}`, handler);
    });
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-dvh" id="main-layout">
  <!-- main content -->
  <div class="flex-1 overflow-auto" id="main">
    {@render children(apps)}
  </div>
</div>
<Toast />
