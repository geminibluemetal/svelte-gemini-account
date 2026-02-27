<script>
  import Checkbox from '$lib/components/Checkbox.svelte';
  let { placeholder, value = $bindable(false), ...props } = $props();
</script>

<div class="mb-3 inline-flex items-center rounded-md px-2 py-1 font-semibold">
  <Checkbox bind:value {...props} />
  <button class="ml-2 select-none" onclick={() => (value = !value)} type="button" tabindex="-1">
    {placeholder}
  </button>
</div>
