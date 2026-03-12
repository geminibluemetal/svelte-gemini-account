<script>
  import { deserialize } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
  import Table from '$lib/components/Table.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { showToast } from '$lib/stores/toast.js';
  import { formatNumber } from '$lib/utils/number';
  import { CirclePowerIcon } from 'lucide-svelte';
  import { onDestroy, onMount } from 'svelte';
  import WeighmentSettings from './WeighmentSettings.svelte';
  import WeighmentEmptyForm from './WeighmentEmptyForm.svelte';
  import Model from '$lib/components/Model.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import WeighmentForm from './WeighmentForm.svelte';

  const { data } = $props();

  const headers = [
    { name: 'Empty Time', key: 'emptyTime' },
    { name: 'Load Time', key: 'loadTime' },
    { name: 'Vehicle', key: 'vehicle' },
    { name: 'Load Weight', key: 'loadWeight' },
    { name: 'Empty Weight', key: 'emptyWeight' },
    { name: 'Net Weight', key: 'netWeight' },
  ];

  const firstWeightHeader = [
    { name: 'Time', key: 'firstWeightAt', display: 'time' },
    { name: 'Vehicle', key: 'vehicle' },
    { name: 'First Weight', key: 'firstWeight' },
  ];

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'First Weight Entry' },
    { key: 'Enter', description: 'Second Weight Entry' },
  ];

  let turnedOn = $derived(data.isScaleOpen);
  let weighmentEventSoruce = null;
  let scaleData = $state('No Data');
  let settingsForm = $state(false);
  let emptyForm = $state(false);
  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableVehicle = $state(null);

  async function transportAction(url, data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const result = deserialize(await response.text());
    if (result.type == 'failure') {
      showToast(result.data.message, 'danger');
    } else {
      result.data;
    }
  }

  async function handleWeighmentSwitch() {
    scaleData = 'No Data';
    await transportAction('?/switchWeighment');
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function handleFormClose() {
    formOpened = false;
    editableVehicle = null;
  }

  const toggleOpenForm = () => (formOpened = !formOpened);

  onMount(() => {
    syncOn('WEIGHMENT.LIST');
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('H', toggleHelper);
    weighmentEventSoruce = new EventSource('/api/weighment');
    weighmentEventSoruce.onmessage = function (event) {
      scaleData = event.data;
    };
  });
  onDestroy(() => {
    syncOff('WEIGHMENT.LIST');
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('H', toggleHelper);
    if (weighmentEventSoruce) weighmentEventSoruce.close();
  });
</script>

<Table headers={firstWeightHeader} title="Weighment" items={data.weighData}>
  {#snippet sidebar()}
    <div class="flex w-75 flex-col gap-2">
      <div class="dark flex gap-2 *:flex-1">
        <Button
          color={turnedOn ? 'success' : 'danger'}
          class="gap-2"
          onclick={handleWeighmentSwitch}
        >
          <CirclePowerIcon /> Weighment {turnedOn ? 'On' : 'Off'}
        </Button>
      </div>
      {#if turnedOn}
        <div class="w-75 rounded-lg border-2 bg-green-200 px-4 py-2 text-right font-mono text-6xl">
          <span class="text-green-950">
            {isNaN(Number(scaleData)) ? 'Waiting' : formatNumber(scaleData)}
          </span>
        </div>
      {:else}
        <div class="w-75 rounded-lg border-2 bg-red-200 px-4 py-2 text-right font-mono text-6xl">
          <span class="text-red-950">OFF</span>
        </div>
      {/if}
      <div class="dark flex gap-2 *:flex-1">
        <Button corner="1" color="primary">Pending</Button>
        <Button corner="2" color="primary">Completed</Button>
        <Button corner="3" color="primary">Chakka</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button onclick={() => (settingsForm = true)}>Port Settings</Button>
        <Button onclick={() => (emptyForm = true)}>Saved Empty</Button>
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

<WeighmentSettings
  open={settingsForm}
  onClose={() => (settingsForm = false)}
  item={data.settings}
/>

<WeighmentEmptyForm open={emptyForm} onClose={() => (emptyForm = false)} item={data.emptyData} />

<WeighmentForm open={formOpened} onClose={handleFormClose} item={editableVehicle} {scaleData} />

<!-- Helper Dialog -->
<Model open={helperOpened} onClose={() => (helperOpened = false)}>
  <div class="min-w-md bg-white p-5">
    {#each availableOptions as o (o.key)}
      <div class="m-1 mb-2 flex items-center gap-2">
        <span class="inline-block flex-1 rounded-xs bg-gray-300 px-3 text-center">{o.key}</span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>
