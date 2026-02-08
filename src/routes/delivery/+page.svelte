<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import DeliveryForm from './DeliveryForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import DeliveryAmountForm from './DeliveryAmountForm.svelte';
  import { HighlightCell, HighlightRow } from '$lib/utils/highlight';

  const { data } = $props();
  const headers = [
    { name: 'SN', key: 'serial', align: 'center' },
    { name: 'T Time', key: 'token_time', align: 'center' },
    { name: 'Vehicle', key: 'vehicle', color: VehicleColor },
    { name: 'D Time', key: 'delivery_time', align: 'center' },
    { name: 'ON', key: 'order_number', align: 'center' },
    { name: 'Party', key: 'party_name' },
    { name: 'Address', key: 'address' },
    { name: 'Item', key: 'delivered_item' },
    { name: 'Qty', key: 'delivered_quantity', align: 'center' },
    { name: 'AT1', key: 'amount_type_1', align: 'center' },
    { name: 'Amount1', key: 'amount_1', align: 'center' },
    { name: 'AT2', key: 'amount_type_2', align: 'center' },
    { name: 'Amount2', key: 'amount_2', align: 'center' },
    { name: 'Sign', key: 'owner_sign', align: 'center' }
  ];

  function VehicleColor(value) {
    // if (value.endsWith('G')) return { foreground: HighlightCell.blue.foreground };
    if (value.endsWith('G')) return HighlightCell.blue;
  }

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'Amount Update' },
    { key: '➔', description: 'Sign delivery entry' },
    { key: 'E', description: 'Delivery Entry' },
    { key: 'Enter', description: 'Delivery Entry' }
  ];

  let formOpened = $state(false);
  let amountFormOpened = $state(false);
  let helperOpened = $state(false);
  let editableDelivery = $state(null);

  function handleDeliveryEdit(item) {
    formOpened = true;
    editableDelivery = item;
  }

  function handleDeliveryAmountUpdate(item) {
    amountFormOpened = true;
    editableDelivery = item;
  }

  async function transportAction(url, data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  }

  function handleFormClose() {
    formOpened = false;
    editableDelivery = null;
  }

  function handleAmountFormClose() {
    amountFormOpened = false;
    editableDelivery = null;
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  const customEvents = [
    { key: '0', handler: handleDeliveryAmountUpdate },
    { key: 'E', handler: handleDeliveryEdit },
    { key: 'Enter', handler: handleDeliveryEdit }
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  function customCellHighlight(item) {
    if (item.delivered_item && item.delivered_delivered_quantity)
      return { ...HighlightRow.green, cells: [0, 1, 2] };
    else return { ...HighlightRow.yellow, cells: [0, 1, 2] };
  }

  onMount(() => {
    keyboardEventBus.on('H', toggleHelper);
    syncOn('TOKEN.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('H', toggleHelper);
    syncOff('TOKEN.LIST');
  });
</script>

<Table
  title="Delivery Sheet"
  {headers}
  items={data.token}
  {customEvents}
  hideSerial={true}
  {customCellHighlight}
/>
<DeliveryForm open={formOpened} onClose={handleFormClose} item={editableDelivery} options={data} />
<DeliveryAmountForm
  open={amountFormOpened}
  onClose={handleAmountFormClose}
  item={editableDelivery}
/>

<Model open={helperOpened} onClose={toggleHelper}>
  <div class="bg-white p-5 min-w-md">
    {#each availableOptions as o}
      <div class="m-1 mb-2 flex gap-2 items-center">
        <span class="inline-block bg-gray-300 px-3 rounded-xs flex-1 text-center">{o.key}</span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>
