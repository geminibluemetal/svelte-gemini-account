<script>
  // -------------------------------------
  // Props
  // -------------------------------------
  let {
    children,
    href = '',
    onclick = () => {},
    color = 'accent',
    size = 'md',
    type = 'button',
    radius = '',
    prefix = null,
    suffix = null,
    disabled = false,
    class: userClass = '',
    ...props
  } = $props();

  // -------------------------------------
  // Styles
  // -------------------------------------
  const colorStyles = {
    primary: `bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 outline-blue-600 active:bg-blue-700
      dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:bg-blue-800 dark:outline-blue-800 dark:active:bg-blue-900`,
    accent: `bg-amber-500 text-white hover:bg-amber-600 focus:bg-amber-600 outline-amber-600 active:bg-amber-700
      dark:bg-amber-700 dark:hover:bg-amber-800 dark:focus:bg-amber-800 dark:outline-amber-800 dark:active:bg-amber-900`,
    success: `bg-green-500 text-white hover:bg-green-600 focus:bg-green-600 outline-green-600 active:bg-green-700
      dark:bg-green-700 dark:hover:bg-green-800 dark:focus:bg-green-800 dark:outline-green-800 dark:active:bg-green-900`,
    danger: `bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 outline-red-600 active:bg-red-800
      dark:bg-red-700 dark:hover:bg-red-800 dark:focus:bg-red-800 dark:outline-red-800 dark:active:bg-red-900`,
    cyan: `bg-cyan-400 text-white hover:bg-cyan-500 focus:bg-cyan-500 outline-cyan-500 active:bg-cyan-600
      dark:bg-cyan-700 dark:hover:bg-cyan-800 dark:focus:bg-cyan-800 dark:outline-cyan-800 dark:active:bg-cyan-900`,
    fuchsia: `bg-fuchsia-400 text-white hover:bg-fuchsia-500 focus:bg-fuchsia-500 outline-fuchsia-500 active:bg-fuchsia-600
      dark:bg-fuchsia-700 dark:hover:bg-fuchsia-800 dark:focus:bg-fuchsia-800 dark:outline-fuchsia-800 dark:active:bg-fuchsia-900`
  };

  const sizeStyles = {
    xs: 'px-1 py-0.5 text-sm',
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1 text-base',
    lg: 'px-4 py-2 text-xl'
  };

  const radiusStyles = {
    none: 'rounded-none',
    xs: 'rounded-xs',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const baseClass =
    'cursor-pointer font-semibold inline-flex items-center focus:outline-2 focus:outline-offset-2 select-none';

  // -------------------------------------
  // Derived values
  // -------------------------------------
  const iconSize = $derived(size === 'sm' ? 15 : size === 'md' ? 20 : size === 'lg' ? 25 : 20);

  // Margin spacing based on size
  const prefixClassSize = $derived(
    size === 'sm' ? 'mr-1' : size === 'md' ? 'mr-2' : size === 'lg' ? 'mr-3' : 'mr-2'
  );

  const suffixClassSize = $derived(
    size === 'sm' ? 'ml-1' : size === 'md' ? 'ml-2' : size === 'lg' ? 'ml-3' : 'ml-2'
  );

  const disabledClass = $derived(
    disabled
      ? 'cursor-not-allowed pointer-events-none opacity-60 hover:bg-gray-300 active:bg-gray-300'
      : 'cursor-pointer'
  );
</script>

<!-- -------------------------------------
      Render Output
-------------------------------------- -->

{#if href}
  <!-- Anchor Button -->
  <a
    href={disabled ? undefined : href}
    class="{baseClass} {colorStyles[color]} {sizeStyles[size]}
    {radiusStyles[radius || size]} {userClass}"
    {...props}
  >
    {#if prefix}
      {@const Prefix = prefix}
      <Prefix class="inline-block {prefixClassSize}" size={iconSize} />
    {/if}

    {@render children()}

    {#if suffix}
      {@const Suffix = suffix}
      <Suffix class="inline-block {suffixClassSize}" size={iconSize} />
    {/if}
  </a>
{:else}
  <!-- Normal Button -->
  <button
    class="{baseClass} {colorStyles[color]} {sizeStyles[size]} {disabledClass}
    {radiusStyles[radius || size]} {userClass}"
    {onclick}
    {disabled}
    {type}
    {...props}
  >
    {#if prefix}
      {@const Prefix = prefix}
      <Prefix class="inline-block {prefixClassSize}" size={iconSize} />
    {/if}

    {@render children()}

    {#if suffix}
      {@const Suffix = suffix}
      <Suffix class="inline-block {suffixClassSize}" size={iconSize} />
    {/if}
  </button>
{/if}
