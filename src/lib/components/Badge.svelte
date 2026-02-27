<script>
  const { children, color = 'accent', class: userClass = '', prefix, suffix, ...props } = $props();

  const colorStyles = {
    primary: `bg-blue-500 text-white outline-blue-600 dark:bg-blue-700 dark:outline-blue-800`,
    accent: `bg-amber-500 text-white outline-amber-600 dark:bg-amber-700 dark:outline-amber-800`,
    success: `bg-green-500 text-white outline-green-600 dark:bg-green-700 dark:outline-green-800`,
    danger: `bg-red-500 text-white outline-red-600 dark:bg-red-700 dark:outline-red-800`,
    cyan: `bg-cyan-400 text-white outline-cyan-500 dark:bg-cyan-700 dark:outline-cyan-800`,
    fuchsia: `bg-fuchsia-400 text-white outline-fuchsia-500 dark:bg-fuchsia-700 dark:outline-fuchsia-800`,
  };
</script>

<div class="rounded-md px-2 py-1 font-semibold {colorStyles[color]} {userClass}" {...props}>
  {#if prefix}
    {@const Prefix = prefix}
    <Prefix class="mr-1 inline-block" />
  {/if}
  {@render children()}
  {#if suffix}
    {@const Suffix = suffix}
    <Suffix class="ml-1 inline-block" />
  {/if}
</div>
