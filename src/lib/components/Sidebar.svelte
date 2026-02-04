<script>
  import {
    Flame,
    Home,
    LogOut,
    Monitor,
    Moon,
    PanelRightClose,
    Settings,
    Sun
  } from 'lucide-svelte';
  import IconButton from './IconButton.svelte';
  import { env } from '$env/dynamic/public';
  import { theme, LIGHT, DARK, SYSTEM } from '$lib/stores/theme';
  import { goto } from '$app/navigation';
  import { keyboardEventBus } from '$lib/utils/eventBus';

  const { toggleSidebar, user, ip, port } = $props();
  const url = `http://${ip || ''}:${port || ''}`;

  function navigate(url) {
    goto(url);
  }

  keyboardEventBus.on('Alt+H', () => navigate('/'));
  keyboardEventBus.on('Alt+S', () => navigate('/settings'));
  keyboardEventBus.on('Alt+L', () => (window.location.href = '/logout')); // Logout needs full page reload
  keyboardEventBus.on('Alt+Q', () => navigate('/shutdown'));
</script>

<div class="flex flex-col h-full border-l-2">
  <!-- Sidebar Header -->
  <div class="border-b-2 flex gap-2 flex-wrap p-2 justify-evenly">
    <!-- Theme Toggle -->
    <IconButton title="Toggle theme (Alt+D)" onclick={theme.toggle}>
      {#if $theme === LIGHT}
        <Sun />
      {:else if $theme === DARK}
        <Moon />
      {:else}
        <Monitor />
      {/if}
    </IconButton>

    <!-- Navigate to Home Page -->
    <IconButton title="Go to Home (Alt+H)" onclick={() => goto('/')}>
      <Home />
    </IconButton>

    <!-- Navigate to Settings -->
    <IconButton title="Go to Settings (Alt+S)" onclick={() => goto('/settings')}>
      <Settings />
    </IconButton>

    <!-- Logout user -->
    <IconButton title="Logout (Alt+L)" onclick={() => (window.location.href = '/logout')}>
      <!-- Logout needs full page reload -->
      <LogOut />
    </IconButton>

    <!-- Close Sidebar -->
    <IconButton title="Close Sidebar (Alt+X)" onclick={toggleSidebar}>
      <PanelRightClose />
    </IconButton>

    <!-- Emergency Shutdown -->
    <IconButton color="danger" title="Emergency Shutdown (Alt+Q)" onclick={() => goto('/shutdown')}>
      <Flame />
    </IconButton>
  </div>

  <!-- Sidebar Body -->
  <div class="flex-1"></div>

  <!-- Sidebar Footer -->
  <div class="border-t-2">
    <div class="text-xs text-center p-1">
      <span class="select-all">{url}</span> <br />
      <span>User: <span class="font-bold">{user?.username}</span> </span> <br />
      <span>{env.PUBLIC_COMPANY_NAME}</span>
    </div>
  </div>
</div>
