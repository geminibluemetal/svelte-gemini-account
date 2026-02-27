<script>
  let { value = $bindable(false), varient = 'accent', ...props } = $props();

  let varientStyle = {
    primary: {
      border: 'hover:border-blue-600 focus:border-blue-600',
      checkedBorder: 'border-blue-600',
      inner: 'bg-blue-600',
    },
    success: {
      border: 'hover:border-green-600 focus:border-green-600',
      checkedBorder: 'border-green-600',
      inner: 'bg-green-600',
    },
    danger: {
      border: 'hover:border-red-600 focus:border-red-600',
      checkedBorder: 'border-red-600',
      inner: 'bg-red-600',
    },
    accent: {
      border: 'hover:border-amber-600 focus:border-amber-600',
      checkedBorder: 'border-amber-600',
      inner: 'bg-amber-600',
    },
  };
</script>

<input type="checkbox" bind:checked={value} class="hidden" {...props} />
<button
  class="relative inline-block size-5 overflow-hidden rounded border-2 text-center outline-offset-1 select-none focus:bg-amber-50 focus:outline-2 focus:outline-amber-600 dark:focus:bg-amber-950
  {varientStyle[varient]?.border}
  {value ? varientStyle[varient]?.checkedBorder : 'border-gray-400'}"
  onclick={() => (value = !value)}
  type="button"
  {...props}
>
  {#if value}
    <span
      class="absolute inset-0 -mt-1 inline-block font-extrabold text-white
      {varientStyle[varient]?.inner}"
    >
      &check;
    </span>
  {/if}
</button>
