<script>
  import { toasts, closeToast } from '$lib/stores/toast';
  import { X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  const styles = {
    success: 'bg-green-600 dark:bg-green-700',
    danger: 'bg-red-600 dark:bg-red-700',
    primary: 'bg-blue-600 dark:bg-blue-700',
    amber: 'bg-amber-600 dark:bg-amber-700'
  };
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-4">
  {#each $toasts as toast (toast.id)}
    <div
      class={`
        px-3 py-2 rounded-xl shadow-lg min-w-[280px]
        flex items-center justify-between gap-5
        text-white
        animate-slide-in
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
          flex justify-center items-center
          w-9 h-9
          text-3xl
          rounded-full
          text-white/80
          hover:text-white
          hover:bg-white/25
          transition
          cursor-pointer
          shrink-0
        "
        aria-label="Close"
      >
        <X />
      </button>
    </div>
  {/each}
</div>
