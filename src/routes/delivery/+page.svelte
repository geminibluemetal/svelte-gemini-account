<script>
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import { onDestroy, onMount } from 'svelte';
  import { HighlightCell, HighlightRow } from '$lib/utils/highlight';
  import Table from '$lib/components/Table.svelte';
  import Model from '$lib/components/Model.svelte';
  import DeliveryForm from './DeliveryForm.svelte';
  import DeliveryAmountForm from './DeliveryAmountForm.svelte';

  const { data } = $props();
  const headers = [
    { name: 'SN', key: 'serial', align: 'center' },
    { name: 'T Time', key: 'token_time', align: 'center' },
    { name: 'Vehicle', key: 'vehicle', color: VehicleColor },
    { name: 'D Time', key: 'delivery_time', align: 'center' },
    { name: 'ON', key: 'order_number', align: 'center' },
    { name: 'Party', key: 'party_name' },
    { name: 'Address', key: 'address' },
    { name: 'Item', key: 'delivery_item' },
    { name: 'Qty', key: 'delivery_quantity', align: 'center', display: 'decimal' },
    { name: 'AT1', key: 'amount_type_1', align: 'center', color: AmountTypeColor },
    { name: 'Amount1', key: 'amount_1', align: 'center', color: Amount1Color },
    { name: 'AT2', key: 'amount_type_2', align: 'center', color: AmountTypeColor },
    { name: 'Amount2', key: 'amount_2', align: 'center', color: Amount2Color },
    { name: 'Sign', key: 'sign', align: 'center', display: 'boolean', color: SignColor }
  ];

  function VehicleColor(value) {
    if (value.endsWith('G')) return { foreground: 'text-blue-700 font-bold' };
  }

  function SignColor(value) {
    return value == 1 ? HighlightCell.green : null;
  }

  function AmountTypeColor(value) {
    switch (value) {
      case 'Bunk':
        return HighlightCell.purple;
      case 'AC':
        return HighlightCell.yellow;
      case 'CP':
        return HighlightCell.green;
      case 'Paytm':
        return HighlightCell.red;
      case 'Gpay':
        return HighlightCell.blue;
    }
  }

  function AmountXColor(value) {
    switch (value) {
      case 'Bunk':
        return { foreground: 'text-purple-700 font-bold' };
      case 'CP':
        return { foreground: 'text-green-700 font-bold' };
      case 'Paytm':
        return { foreground: 'text-red-700 font-bold' };
      case 'Gpay':
        return { foreground: 'text-blue-700 font-bold' };
    }
  }

  function Amount1Color(value, item) {
    return AmountXColor(item.amount_type_1);
  }

  function Amount2Color(value, item) {
    return AmountXColor(item.amount_type_2);
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

  const handleDeliverySign = (item) =>
    transportAction('?/sign', { id: item.id, current: item.sign });

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
    { key: 'ArrowRight', handler: handleDeliverySign },
    { key: 'E', handler: handleDeliveryEdit },
    { key: 'Enter', handler: handleDeliveryEdit }
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  function customCellHighlight(item) {
    if (item.delivery_item && item.delivery_quantity)
      return { ...HighlightRow.green, cells: [0, 1, 2] };
    else return { ...HighlightRow.yellow, cells: [0, 1, 2] };
  }

  onMount(() => {
    keyboardEventBus.on('H', toggleHelper);
    syncOn('DELIVERY.TOKEN.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('H', toggleHelper);
    syncOff('DELIVERY.TOKEN.LIST');
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
