<script>
  import { ArrowBigLeft, ArrowBigRight } from 'lucide-svelte';
  import DateField from './DateField.svelte';
  let { value = $bindable(), full, ...props } = $props();
</script>

<div class="flex gap-2 w-{full ? 'full' : '52'}">
  <button
    type="button"
    class="border-2 rounded flex items-center justify-center w-10 border-gray-400 outline-none focus:border-amber-500 cursor-pointer"
    onclick={() => (value = new Date(value.setDate(value.getDate() - 1)))}
  >
    <ArrowBigLeft />
  </button>
  <div class="flex-1">
    <DateField placeholder="Date" bind:value {...props} textAlign="center" />
  </div>
  <button
    type="button"
    class="border-2 rounded flex items-center justify-center w-10 border-gray-400 outline-none focus:border-amber-500 cursor-pointer"
    onclick={() => (value = new Date(value.setDate(value.getDate() + 1)))}
  >
    <ArrowBigRight />
  </button>
</div>
