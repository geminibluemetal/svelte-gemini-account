<script>
  import Button from '$lib/components/Button.svelte';
  import Table from '$lib/components/Table.svelte';
  import { formatNumber } from '$lib/utils/number';
  import { CirclePowerIcon, Workflow } from 'lucide-svelte';

  const headers = [
    { name: 'Empty Time', key: 'emptyTime' },
    { name: 'Load Time', key: 'loadTime' },
    { name: 'Name', key: 'name' },
    { name: 'Vehicle', key: 'vehicle' },
    { name: 'Load Weight', key: 'loadWeight' },
    { name: 'Empty Weight', key: 'emptyWeight' },
    { name: 'Net Weight', key: 'netWeight' },
  ];

  let isScaleOpen = $state(false);
  let isAutoMode = $state(false);
</script>

<Table {headers} title="Weightment">
  {#snippet sidebar()}
    <div class="flex w-75 flex-col gap-2">
      <div class="dark flex gap-2 *:flex-1">
        <Button
          color={isScaleOpen ? 'success' : 'danger'}
          class="gap-2"
          onclick={() => (isScaleOpen = !isScaleOpen)}
        >
          <CirclePowerIcon /> Turn on
        </Button>
        <Button
          color={isAutoMode ? 'success' : 'danger'}
          class="gap-2"
          onclick={() => (isAutoMode = !isAutoMode)}
        >
          <Workflow /> Auto mode
        </Button>
      </div>
      <div class="w-75 rounded-lg border-2 bg-gray-200 px-4 py-2 text-right font-mono text-6xl">
        {formatNumber(582452)}
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button corner="1" color="fuchsia">All</Button>
        <Button corner="2" color="fuchsia">Empty</Button>
        <Button corner="3" color="fuchsia">Load</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button corner="4" color="primary">Temp</Button>
        <Button corner="5" color="primary">Jelly</Button>
        <Button corner="6" color="primary">Chakka</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button>Settings</Button>
        <Button>Saved Empty</Button>
      </div>

      <table class="w-full border-2">
        <thead>
          <tr>
            <th class="border border-black bg-black text-white" colspan="3">Mayil Paarai</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border px-1">4971</td>
            <td class="border px-1">2</td>
            <td class="border px-1 text-right">{formatNumber(24563)}</td>
          </tr>
          <tr>
            <td class="border px-1">4844</td>
            <td class="border px-1">2</td>
            <td class="border px-1 text-right">{formatNumber(24563)}</td>
          </tr>
          <tr>
            <td colspan="2" class=" border border-black bg-black px-1 text-white">Total</td>
            <td class=" border border-black bg-black px-1 text-right text-white">
              {formatNumber(48563)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  {/snippet}
</Table>
