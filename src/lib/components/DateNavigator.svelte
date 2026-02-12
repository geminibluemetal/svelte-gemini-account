<script>
  import { ArrowBigLeft, ArrowBigRight } from 'lucide-svelte';
  import DateField from './DateField.svelte';
  let { value = $bindable(), full = false, onDateChange = () => {}, ...props } = $props();
  $effect(() => {
    onDateChange(value);
  });
</script>

<div class="flex gap-2 {full ? 'w-full' : 'w-50'}">
  <button
    type="button"
    class="border-2 rounded flex items-center justify-center w-9 border-gray-400 outline-none focus:border-amber-500 cursor-pointer"
    onclick={() => (value = new Date(value.setDate(value.getDate() - 1)))}
  >
    <ArrowBigLeft size={20} />
  </button>
  <div class="flex-1">
    <DateField placeholder="Date" bind:value {...props} textAlign="center" />
  </div>
  <button
    type="button"
    class="border-2 rounded flex items-center justify-center w-9 border-gray-400 outline-none focus:border-amber-500 cursor-pointer"
    onclick={() => (value = new Date(value.setDate(value.getDate() + 1)))}
  >
    <ArrowBigRight size={20} />
  </button>
</div>
