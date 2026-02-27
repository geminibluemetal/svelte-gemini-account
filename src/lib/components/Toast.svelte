<!-- Toast.svelte -->
<script>
  import { toasts, closeToast } from '$lib/stores/toast';
  import { X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import Teleport from '$lib/components/Teleport.svelte';

  const styles = {
    success: 'bg-green-600 dark:bg-green-700',
    danger: 'bg-red-600 dark:bg-red-700',
    primary: 'bg-blue-600 dark:bg-blue-700',
    amber: 'bg-amber-600 dark:bg-amber-700',
  };
</script>

<Teleport>
  <div class="fixed right-5 bottom-5 z-[9999] flex flex-col gap-4">
    {#each $toasts as toast (toast.id)}
      <div
        class={`
          animate-slide-in flex min-w-[280px] items-center justify-between
          gap-5 rounded-xl px-3 py-2
          text-white
          shadow-lg
          ${styles[toast.type] || styles.success}
        `}
        in:fly={{ x: 200, duration: 200 }}
      >
        <!-- Message -->
        <span class="text-base leading-relaxed">
          {@html toast.message}
        </span>

        <!-- Close button -->
        <button
          on:click={() => closeToast(toast.id)}
          class="
            flex h-9 w-9
            shrink-0 cursor-pointer
            items-center
            justify-center
            rounded-full
            text-3xl
            text-white/80
            transition
            hover:bg-white/25
            hover:text-white
          "
          aria-label="Close"
        >
          <X />
        </button>
      </div>
    {/each}
  </div>
</Teleport>
