<script>
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { startSSE, stopSSE } from '$lib/core/client/sseReceiver';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import { PanelRightClose } from 'lucide-svelte';
  import Toast from '$lib/components/Toast.svelte';

  let { children, data } = $props();
  const apps = $derived(data.apps);
  let { open } = $state(false);

  const toggleOpen = () => (open = !open);

  // store handlers so off() works correctly
  const shortcutHandlers = [];

  onMount(() => {
    startSSE();

    // sidebar toggle
    keyboardEventBus.on('Alt+X', toggleOpen);

    // dynamic route shortcuts
    apps.forEach((app) => {
      const handler = () => goto(app.url);
      shortcutHandlers.push({ key: app.key, handler });
      keyboardEventBus.on(`Alt+${app.key}`, handler);
    });
  });

  onDestroy(() => {
    stopSSE();

    keyboardEventBus.off('Alt+X', toggleOpen);

    shortcutHandlers.forEach(({ key, handler }) => {
      keyboardEventBus.off(`Alt+${key}`, handler);
    });
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-dvh">
  <!-- main content -->
  <div class="flex-1 overflow-auto">
    {@render children(apps)}
  </div>

  <!-- sidebar wrapper -->
  <div
    class="overflow-hidden transition-[width] duration-300 ease-in-out"
    class:w-40={open}
    class:w-0={!open}
  >
    <aside class="w-40 h-full p-2 flex flex-col gap-2 bg-white border-l-2">
      {#each apps as app}
        <a
          href={app.url}
          class="flex flex-col gap-2 p-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          <span>{app.emoji} {app.name}</span>
          <span class="text-xs px-2 py-1 bg-black/10 rounded self-start">
            Alt + {app.key}
          </span>
        </a>
      {/each}
      <button class="p-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer" onclick={toggleOpen}>
        <span class="inline-flex items-center gap-2">
          <PanelRightClose class="inline" size={22} /> Close
        </span> <br />
        <span class="text-xs px-2 py-1 bg-black/10 rounded self-start inline-block"> Alt + X </span>
      </button>
    </aside>
  </div>
</div>
<Toast />
