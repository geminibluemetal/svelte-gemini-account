<script>
  import { ArrowBigLeft, ArrowBigRight } from 'lucide-svelte';
  import DateField from './DateField.svelte';
  let {
    full = false,
    onPrevious = () => {},
    onNext = () => {},
    children,
    class: userClass = '',
    ...props
  } = $props();
</script>

<div class="flex gap-2 {full ? 'w-full' : 'w-50'} {userClass}">
  <button
    type="button"
    class="border-2 rounded flex items-center justify-center w-9 border-gray-400 outline-none focus:border-amber-500 cursor-pointer"
    onclick={onPrevious}
  >
    <ArrowBigLeft size={20} />
  </button>
  <div
    class="flex-1 border-2 rounded flex items-center justify-center py-1 w-9 border-gray-400 outline-none focus:border-amber-500 cursor-pointer relative overflow-hidden"
  >
    <span
      class="absolute -top-5 -left-5 bg-gray-300 size-10 text-sm flex items-end justify-end pr-2 pb-0.5 rounded-full"
    >
      2
    </span>
    {@render children()}
  </div>
  <button
    type="button"
    class="border-2 rounded flex items-center justify-center w-9 border-gray-400 outline-none focus:border-amber-500 cursor-pointer"
    onclick={onNext}
  >
    <ArrowBigRight size={20} />
  </button>
</div>
