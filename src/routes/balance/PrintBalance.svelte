<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getFormattedTimeStamp } from '$lib/utils/dateTime';

  const { title, headers, items } = $props();
  onMount(() => {
    const main = document.querySelector('.visible-content > div');
    const table = document.querySelector('.visible-content > div > div');
    main.classList.toggle('h-screen');
    table.classList.toggle('overflow-auto');
  });
</script>

<table class="border w-full text-sm font-medium">
  <thead>
    <tr>
      <th colspan="4" class="text-left px-2">{title}</th>
      <th colspan="4" class="text-right px-2">{getFormattedTimeStamp()}</th>
    </tr>
    <tr class="*:border">
      <th>S.No</th>
      <th>Party</th>
      <th>Phone</th>
      <th>Description</th>

      <th>S.No</th>
      <th>Party</th>
      <th>Phone</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    {#each Array.from({ length: Math.ceil(items.length / 2) }) as _, i}
      {@const leftIndex = i * 2}
      {@const rightIndex = i * 2 + 1}
      <tr class="*:border">
        <!-- Left column -->
        <td>{i * 2 + 1}</td>
        <td>{items[leftIndex]?.name || ''}</td>
        <td>{items[leftIndex]?.phone || ''}</td>
        <td></td>

        <!-- Right column -->
        <td>{i * 2 + 2}</td>
        <td>{items[rightIndex]?.name || ''}</td>
        <td>{items[rightIndex]?.phone || ''}</td>
        <td></td>
      </tr>
    {/each}
  </tbody>
</table>
