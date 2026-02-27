<script>
  import { ArrowBigLeft, ArrowBigRight } from 'lucide-svelte';
  import DateField from './DateField.svelte';
  let {
    full = false,
    onPrevious = () => {},
    onNext = () => {},
    children,
    cornerLeft = '',
    cornerRight = '',
    cornerCenter = '',
    class: userClass = '',
    ...props
  } = $props();
</script>

<div class="flex gap-2 {full ? 'w-full' : 'w-50'} {userClass}">
  <button
    type="button"
    class="relative flex w-9 cursor-pointer items-center justify-center rounded border-2 border-gray-400 outline-none focus:border-amber-500"
    onclick={onPrevious}
  >
    {#if cornerLeft}
      <div
        class="absolute -top-1 -left-1 z-10 flex
             size-4 items-center justify-center rounded-full
             border-2 bg-white p-1 text-[12px]
             font-semibold text-black shadow-sm"
      >
        {cornerLeft}
      </div>
    {/if}
    <ArrowBigLeft size={20} />
  </button>
  <div
    class="relative flex w-9 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded border-2 border-gray-400 py-1 outline-none focus:border-amber-500"
  >
    <span
      class="absolute -top-5 -left-5 flex size-10 items-end justify-end rounded-full bg-gray-300 pr-2 pb-0.5 text-sm"
    >
      {cornerCenter}
    </span>
    {@render children()}
  </div>
  <button
    type="button"
    class="relative flex w-9 cursor-pointer items-center justify-center rounded border-2 border-gray-400 outline-none focus:border-amber-500"
    onclick={onNext}
  >
    {#if cornerRight}
      <div
        class="absolute -top-1 -left-1 z-10 flex
             size-4 items-center justify-center rounded-full
             border-2 bg-white p-1 text-[12px]
             font-semibold text-black shadow-sm"
      >
        {cornerRight}
      </div>
    {/if}
    <ArrowBigRight size={20} />
  </button>
</div>
