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
  import DateNavigator from '$lib/components/DateNavigator.svelte';
  import { commonDate } from '$lib/stores/common';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Trash } from 'lucide-svelte';

  const { data } = $props();
  let view = $state('All');
  const headers = [
    { name: 'SN', key: 'serial', align: 'center', width: '38' },
    { name: 'T Time', key: 'token_time', align: 'center', width: '80' },
    { name: 'Vehicle', key: 'vehicle', color: VehicleColor, width: '65' },
    { name: 'D Time', key: 'delivery_time', align: 'center', width: '80' },
    { name: 'ON', key: 'order_number', align: 'center', width: '38' },
    { name: 'Party', key: 'party_name', width: '220' },
    { name: 'Address', key: 'address', width: '220' },
    { name: 'Item', key: 'delivery_item', width: '125' },
    { name: 'Qty', key: 'delivery_quantity', align: 'center', display: 'decimal', width: '55' },
    { name: 'AT1', key: 'amount_type_1', align: 'center', color: AmountTypeColor, width: '60' },
    { name: 'Amount1', key: 'amount_1', align: 'center', color: Amount1Color },
    { name: 'AT2', key: 'amount_type_2', align: 'center', color: AmountTypeColor, width: '60' },
    { name: 'Amount2', key: 'amount_2', align: 'center', color: Amount2Color },
    { name: 'Sign', key: 'sign', align: 'center', display: 'boolean', color: SignColor }
  ];

  const viewList = $derived({
    All: data.token,
    AC: data.token.filter((d) => d.amount_type_1 == 'AC' || d.amount_type_2 == 'AC'),
    CP: data.token.filter(
      (d) =>
        d.amount_type_1 == 'CP' ||
        d.amount_type_1 == 'Paytm' ||
        d.amount_type_2 == 'CP' ||
        d.amount_type_2 == 'Paytm'
    ),
    Blank: data.token.filter(
      (d) => !d.amount_type_1 && !d.amount_type_1 && !d.amount_type_2 && !d.amount_type_2
    )
  });

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
  let oldBalanceOpened = $state(false);
  let vehicleSummaryOpened = $state(false);
  let editableDelivery = $state(null);

  function handleDeliveryEdit(item) {
    if (
      !formOpened &&
      !amountFormOpened &&
      !helperOpened &&
      !oldBalanceOpened &&
      !vehicleSummaryOpened
    ) {
      formOpened = true;
      editableDelivery = item;
    }
  }

  function handleDeliveryAmountUpdate(item) {
    if (
      !formOpened &&
      !amountFormOpened &&
      !helperOpened &&
      !oldBalanceOpened &&
      !vehicleSummaryOpened
    ) {
      amountFormOpened = true;
      editableDelivery = item;
    }
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

  function handleFullDelete() {
    transportAction('?/fullDelete', { date: $commonDate.toISOString() });
  }

  function handleOldBalance() {
    if (
      !formOpened &&
      !amountFormOpened &&
      !helperOpened &&
      !oldBalanceOpened &&
      !vehicleSummaryOpened
    ) {
      oldBalanceOpened = true;
    }
  }

  function handleVehicleSummary(item) {
    if (
      !formOpened &&
      !amountFormOpened &&
      !helperOpened &&
      !oldBalanceOpened &&
      !vehicleSummaryOpened
    ) {
      vehicleSummaryOpened = true;
    }
  }

  function handleHelper() {
    if (
      !formOpened &&
      !amountFormOpened &&
      !helperOpened &&
      !oldBalanceOpened &&
      !vehicleSummaryOpened
    ) {
      helperOpened = true;
    }
  }

  function handleDateNavigationChange(value) {
    // 1. Calculate the ISO strings for a stable comparison
    const newDateStr = value.toISOString();
    const urlDateStr = $page.url.searchParams.get('date');

    // 2. Only proceed if the date has actually changed
    if (newDateStr !== urlDateStr) {
      $commonDate = value; // Update store

      // 3. Use { keepFocus: true, replaceState: true } to prevent
      // unnecessary scroll jumps or history bloating
      goto(`?date=${newDateStr}`, { keepFocus: true, replaceState: true });
    }
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

  const openCashReport = () => goto('/cash');
  const openOrderBook = () => goto('/orders');
  const openACFilter = () => (view = 'AC');
  const openCPFilter = () => (view = 'CP');
  const openBlankFilter = () => (view = 'Blank');
  const openRemoveFilter = () => (view = 'All');

  onMount(() => {
    keyboardEventBus.on('H', handleHelper);
    keyboardEventBus.on('1', openACFilter);
    keyboardEventBus.on('2', openCPFilter);
    keyboardEventBus.on('3', openBlankFilter);
    keyboardEventBus.on('4', openRemoveFilter);
    keyboardEventBus.on('5', openCashReport);
    keyboardEventBus.on('6', openOrderBook);
    keyboardEventBus.on('7', handleOldBalance);
    keyboardEventBus.on('8', handleVehicleSummary);
    syncOn('DELIVERY.TOKEN.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('H', handleHelper);
    keyboardEventBus.off('1', openACFilter);
    keyboardEventBus.off('2', openCPFilter);
    keyboardEventBus.off('3', openBlankFilter);
    keyboardEventBus.off('4', openRemoveFilter);
    keyboardEventBus.off('5', openCashReport);
    keyboardEventBus.off('6', openOrderBook);
    keyboardEventBus.off('7', handleOldBalance);
    keyboardEventBus.off('8', handleVehicleSummary);
    syncOff('DELIVERY.TOKEN.LIST');
  });
</script>

<Table
  title="Delivery Sheet"
  {headers}
  items={viewList[view]}
  {customEvents}
  hideSerial={true}
  {customCellHighlight}
>
  {#snippet left()}
    <button
      class="m-0 p-0 cursor-pointer bg-white rounded-full hover:bg-white/90"
      onclick={handleFullDelete}
    >
      <Trash size={23} class="text-red-500 p-1" />
    </button>
  {/snippet}
  {#snippet right()}
    <span class="mr-2">{view}</span>
  {/snippet}
  {#snippet sidebar()}
    <div class="flex flex-col gap-2 w-50">
      <div class="flex gap-2 *:flex-1">
        <DateNavigator
          class="focus:bg-amber-50"
          value={$commonDate}
          onDateChange={handleDateNavigationChange}
        />
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button corner="1" color="fuchsia" onclick={openACFilter}>AC</Button>
        <Button corner="2" color="fuchsia" onclick={openCPFilter}>CP</Button>
        <Button corner="3" color="fuchsia" onclick={openBlankFilter}>Blank</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button corner="4" color="fuchsia" onclick={openRemoveFilter}>Remove</Button>
        <Button corner="5" color="primary" onclick={openCashReport}>CR</Button>
        <Button corner="6" color="primary" onclick={openOrderBook}>OB</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button corner="7" color="accent" onclick={handleOldBalance}>Old Balance</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button corner="8" color="accent" onclick={handleVehicleSummary}>Vehicle Summary</Button>
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

<!-- Delivery Entry Form -->
<DeliveryForm open={formOpened} onClose={handleFormClose} item={editableDelivery} options={data} />

<!-- Delivery Amount Update -->
<DeliveryAmountForm
  open={amountFormOpened}
  onClose={handleAmountFormClose}
  item={editableDelivery}
/>

<!-- Helper Dialog -->
<Model open={helperOpened} onClose={() => (helperOpened = false)}>
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

<!-- Old Balance -->
<Model open={oldBalanceOpened} onClose={() => (oldBalanceOpened = false)}>
  <div class="bg-white p-5 min-w-2xl">
    <Table></Table>
  </div>
</Model>

<!-- Vehicle Summary -->
<Model open={vehicleSummaryOpened} onClose={() => (vehicleSummaryOpened = false)}>
  <div class="bg-white p-5 min-w-2xl">
    <Table></Table>
  </div>
</Model>
