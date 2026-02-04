<script>
  import { Check } from 'lucide-svelte';
  let { value = $bindable(false), varient = 'accent', ...props } = $props();

  let varientStyle = {
    primary: {
      border: 'hover:border-blue-600 focus:border-blue-600',
      checkedBorder: 'border-blue-600',
      inner: 'bg-blue-600'
    },
    success: {
      border: 'hover:border-green-600 focus:border-green-600',
      checkedBorder: 'border-green-600',
      inner: 'bg-green-600'
    },
    danger: {
      border: 'hover:border-red-600 focus:border-red-600',
      checkedBorder: 'border-red-600',
      inner: 'bg-red-600'
    },
    accent: {
      border: 'hover:border-amber-600 focus:border-amber-600',
      checkedBorder: 'border-amber-600',
      inner: 'bg-amber-600'
    }
  };
</script>

<input type="checkbox" bind:checked={value} class="hidden" {...props} />
<button
  class="border-2 rounded inline-block size-5 text-center relative overflow-hidden select-none focus:bg-amber-50 dark:focus:bg-amber-950 focus:outline-2 focus:outline-amber-600 outline-offset-1
  {varientStyle[varient]?.border}
  {value ? varientStyle[varient]?.checkedBorder : 'border-gray-400'}"
  onclick={() => (value = !value)}
  type="button"
  {...props}
>
  {#if value}
    <span
      class="inline-block font-extrabold absolute inset-0 -mt-1 text-white
      {varientStyle[varient]?.inner}"
    >
      &check;
    </span>
  {/if}
</button>
