<script>
  import Teleport from '$lib/components/Teleport.svelte';
  import { getFormattedTimestamp } from '$lib/utils/dateTime';
  import { formatNumber } from '$lib/utils/number';

  // Svelte 5 syntax for props
  const { data = [] } = $props();
</script>

<Teleport to="body">
  <div id="print-area" class="text-sm">
    <table class="print-table w-full border-collapse border border-black">
      <thead>
        <tr>
          <th colspan="10" class="border border-black bg-gray-100 px-2 py-1 text-center">
            Balance Sheet - Printed on {getFormattedTimestamp()}
          </th>
        </tr>
        <tr class="bg-gray-50">
          <th class="border border-black px-1 py-0.5 text-center"> S </th>
          <th class="border border-black px-1 py-0.5 text-center"> Name </th>
          <th class="border border-black px-1 py-0.5 text-center"> Phone </th>
          <th class="border border-black px-1 py-0.5 text-center"> Amount </th>
          <th class="border border-black px-1 py-0.5 text-center"> Description </th>

          <th class="border border-black px-1 py-0.5 text-center"> S </th>
          <th class="border border-black px-1 py-0.5 text-center"> Name </th>
          <th class="border border-black px-1 py-0.5 text-center"> Phone </th>
          <th class="border border-black px-1 py-0.5 text-center"> Amount </th>
          <th class="border border-black px-1 py-0.5 text-center"> Description </th>
        </tr>
      </thead>
      <tbody>
        <!-- eslint-disable-next-line no-unused-vars -->
        {#each Array.from({ length: data.length / 2 }) as _, index (index)}
          {@const col1 = 2 * index}
          {@const col2 = 2 * index + 1}
          <tr class="break-inside-avoid">
            <td class="border border-black px-1 py-0.5 text-center"> {col1 + 1} </td>
            <td class="border border-black px-1 py-0.5"> {data[col1]?.['name']} </td>
            <td class="border border-black px-1 py-0.5 text-center">
              {data[col1]?.['phone']}
            </td>
            <td class="border border-black px-1 py-0.5 text-right font-mono">
              {formatNumber(data[col1]?.['currentBalance'])}
            </td>
            <td class="border border-black px-1 py-0.5"> </td>

            <td class="border border-black px-1 py-0.5 text-center"> {col2 + 1} </td>
            <td class="border border-black px-1 py-0.5"> {data[col2]?.['name']} </td>
            <td class="border border-black px-1 py-0.5 text-center">
              {data[col2]?.['phone']}
            </td>
            <td class="border border-black px-1 py-0.5 text-right font-mono">
              {formatNumber(data[col2]?.['currentBalance'])}
            </td>
            <td class="border border-black px-1 py-0.5"> </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Teleport>

<style>
  /* 1. Set Paper Orientation to Landscape for wide data */
  @page {
    size: portrait;
    margin: 8mm;
  }

  /* 2. Hide everything except the print area on the screen by default */
  #print-area {
    display: none;
  }

  @media print {
    /* Hide your main app layout */
    :global(#main-layout),
    :global(nav),
    :global(button) {
      display: none !important;
    }

    /* Force the teleported print area to show */
    :global(#print-area) {
      display: block !important;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }

    /* Target the table and text precisely */
    :global(#print-area table) {
      border-collapse: collapse !important;
      width: 100% !important;
      /* Adjust this pt size to find your "Goldilocks" zone */
      font-size: 9pt !important;
      color: black !important;
    }

    :global(#print-area th),
    :global(#print-area td) {
      border: 1px solid black !important;
      padding: 2px 4px !important;
      line-height: 1.2 !important;
    }

    /* Ensure headers repeat on every page */
    :global(thead) {
      display: table-header-group !important;
    }
  }
</style>
