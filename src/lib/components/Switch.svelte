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
  class={`ml-5 flex h-6 w-12 min-w-12 cursor-pointer items-center rounded-full p-1 ${
    enabled ? 'bg-emerald-500 dark:bg-emerald-700' : 'bg-gray-300 dark:bg-gray-500'
  }`}
>
  <div
    class={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform dark:bg-gray-300 ${
      enabled ? 'translate-x-6' : 'translate-x-0'
    }`}
  ></div>
</button>
