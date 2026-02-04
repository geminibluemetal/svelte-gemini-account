<script>
  let { enabled = $bindable(false) } = $props();

  function toggle() {
    enabled = !enabled;
  }
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button
  type="button"
  onclick={toggle}
  class={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 min-w-12 ml-5 ${
    enabled ? 'bg-emerald-500 dark:bg-emerald-700' : 'bg-gray-300 dark:bg-gray-500'
  }`}
>
  <div
    class={`w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-md transform transition-transform ${
      enabled ? 'translate-x-6' : 'translate-x-0'
    }`}
  ></div>
</button>
