<script>
  import Checkbox from '$lib/components/Checkbox.svelte';
  let { placeholder, value = $bindable(false), ...props } = $props();
</script>

<div class="px-2 py-1 rounded-md font-semibold inline-flex items-center mb-3">
  <Checkbox bind:value {...props} />
  <button class="ml-2 select-none" onclick={() => (value = !value)} type="button" tabindex="-1">
    {placeholder}
  </button>
</div>
