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
  import Button from '$lib/components/Button.svelte';
  import { formatFixed } from '$lib/utils/number';

  const { data } = $props();
  const headers = [
    { name: 'SN', key: 'serial', align: 'center', width: '38' },
    { name: 'T Time', key: 'token_time', align: 'center', width: '80' },
    { name: 'Vehicle', key: 'vehicle', color: VehicleColor, width: '65' },
    { name: 'D Time', key: 'delivery_time', align: 'center', width: '80' },
    { name: 'ON', key: 'order_number', align: 'center', width: '38' },
    { name: 'Party', key: 'party_name', width: '220' },
    { name: 'Address', key: 'address', width: '220' },
    { name: 'Item', key: 'delivery_item' }, // width: '125'
    { name: 'Qty', key: 'delivery_quantity', align: 'center', display: 'decimal', width: '55' },
    { name: 'AT1', key: 'amount_type_1', align: 'center', color: AmountTypeColor, width: '60' },
    { name: 'Amount1', key: 'amount_1', align: 'center', color: Amount1Color },
    { name: 'AT2', key: 'amount_type_2', align: 'center', color: AmountTypeColor, width: '60' },
    { name: 'Amount2', key: 'amount_2', align: 'center', color: Amount2Color },
    { name: 'Sign', key: 'sign', align: 'center', display: 'boolean', color: SignColor }
  ];

  const sales = $derived(
    data.token.reduce((acc, item) => {
      const itemName = item.delivery_item;
      const qty = item.delivery_quantity || 0;

      // Skip if no delivery_item or quantity
      if (!itemName || qty === null || qty === undefined || qty === 0) {
        return acc;
      }

      // Check if the item contains " + " separator
      if (itemName.includes(' + ')) {
        // Split by " + " and trim whitespace
        const items = itemName.split(' + ').map((i) => i.trim());
        const splitQty = qty / items.length;

        // Add equal quantity to each split item
        items.forEach((splitItem) => {
          acc[splitItem] = (acc[splitItem] || 0) + splitQty;
        });
      } else {
        // Single item, add full quantity
        acc[itemName] = (acc[itemName] || 0) + qty;
      }

      return acc;
    }, {})
  );

  const loads = $derived(
    data.token.reduce((acc, item) => {
      const vehicle = item.vehicle;

      // Check if vehicle ends with 'G'
      if (vehicle && vehicle.endsWith('G')) {
        acc[vehicle] = (acc[vehicle] || 0) + 1;
      }

      return acc;
    }, {})
  );

  const partyCounts = $derived(
    data.token.reduce((acc, item) => {
      const partyName = item.party_name;

      if (partyName) {
        acc[partyName] = (acc[partyName] || 0) + 1;
      }

      return acc;
    }, {})
  );

  // Array of only Paytm amounts (numbers)
  const paytmAmountsArray = $derived(
    data.token.reduce((acc, item) => {
      // Add amount_1 if it's Paytm
      if (item.amount_type_1 === 'Paytm' && item.amount_1 !== null && item.amount_1 !== undefined) {
        acc.push(Number(item.amount_1));
      }

      // Add amount_2 if it's Paytm
      if (item.amount_type_2 === 'Paytm' && item.amount_2 !== null && item.amount_2 !== undefined) {
        acc.push(Number(item.amount_2));
      }

      return acc;
    }, [])
  );

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
>
  {#snippet sidebar()}
    <div class="flex flex-col gap-2 w-50">
      <div class="dark flex gap-2 *:flex-1">
        <Button color="fuchsia">AC</Button>
        <Button color="fuchsia">CP</Button>
        <Button color="fuchsia">Blank</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button color="fuchsia">Remove</Button>
        <Button color="primary">CR</Button>
        <Button color="primary">OB</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button color="accent">Old Balance</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button color="accent">Vehicle Summary</Button>
      </div>
      <div class="flex flex-col gap-2 w-full overflow-auto">
        {#if Object.entries(sales).length}
          <table class="w-full border-2">
            <thead>
              <tr>
                <th class="border border-black bg-black text-white" colspan="2">Sales</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.entries(sales) as [itemName, quantity], index}
                <tr>
                  <td class="border px-1">{itemName}</td>
                  <!-- Item name (MS, PS, etc.) -->
                  <td class="border px-1 text-right">{formatFixed(quantity)}</td>
                  <!-- Quantity with 2 decimals -->
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
        {#if Object.entries(loads).length}
          <table class="w-full border-2">
            <thead>
              <tr>
                <th class="border border-black bg-black text-white" colspan="2">Loads</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.entries(loads) as [vehicle, count], index}
                <tr>
                  <td class="border px-1">{vehicle}</td>
                  <!-- Item name (MS, PS, etc.) -->
                  <td class="border px-1 text-right">{count}</td>
                  <!-- Quantity with 2 decimals -->
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
        {#if Object.entries(partyCounts).length}
          <table class="w-full border-2">
            <thead>
              <tr>
                <th class="border border-black bg-black text-white" colspan="2">Party</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.entries(partyCounts) as [party, count], index}
                <tr>
                  <td class="border px-1">{party}</td>
                  <!-- Item name (MS, PS, etc.) -->
                  <td class="border px-1 text-right">{count}</td>
                  <!-- Quantity with 2 decimals -->
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
        {#if Object.entries(paytmAmountsArray).length}
          <table class="w-full border-2">
            <thead>
              <tr>
                <th class="border border-black bg-black text-white" colspan="2">Paytm</th>
              </tr>
            </thead>
            <tbody>
              {#each paytmAmountsArray as amount, index}
                <tr>
                  <td class="border px-1">{index + 1}</td>
                  <!-- Item name (MS, PS, etc.) -->
                  <td class="border px-1 text-right">{amount}</td>
                  <!-- Quantity with 2 decimals -->
                </tr>
              {/each}
              <tr>
                <td class=" border border-black bg-black text-white px-1">Total</td>
                <!-- Item name (MS, PS, etc.) -->
                <td class=" border border-black bg-black text-white px-1 text-right">
                  {paytmAmountsArray.reduce((total, num) => total + num, 0)}
                </td>
                <!-- Quantity with 2 decimals -->
              </tr>
            </tbody>
          </table>
        {/if}
      </div>
    </div>
  {/snippet}
</Table>
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
