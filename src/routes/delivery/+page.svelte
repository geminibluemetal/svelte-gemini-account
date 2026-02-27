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
  import { CheckCheck, SearchXIcon, Trash } from 'lucide-svelte';
  import OldBalanceForm from './OldBalanceForm.svelte';

  const { data } = $props();
  let view = $state('All');
  const headers = [
    { name: 'SN', key: 'serial', align: 'center', width: '38', color: serialColor },
    { name: 'T Time', key: 'created_at', display: 'time', align: 'center', width: '80' },
    { name: 'Vehicle', key: 'vehicle', color: VehicleColor, width: '65' },
    { name: 'D Time', key: 'delivery_time', align: 'center', width: '80' },
    { name: 'ON', key: 'order_number', align: 'center', width: '38', color: orderColor },
    { name: 'Party', key: 'party_name', width: '220' },
    { name: 'Address', key: 'address', width: '220' },
    { name: 'Item', key: 'delivery_item', width: '125' },
    { name: 'Qty', key: 'delivery_quantity', align: 'center', display: 'decimal', width: '55' },
    { name: 'AT1', key: 'amount_type_1', align: 'center', color: AmountTypeColor, width: '60' },
    { name: 'Amount1', key: 'amount_1', align: 'center', color: Amount1Color },
    { name: 'AT2', key: 'amount_type_2', align: 'center', color: AmountTypeColor, width: '60' },
    { name: 'Amount2', key: 'amount_2', align: 'center', color: Amount2Color },
    { name: 'Sign', key: 'sign', align: 'center', display: 'boolean', color: SignColor },
  ];

  const oldBalanceHeaders = [
    // { name: 'SN', key: 'serial', align: 'center', width: '38' },
    { name: 'Party', key: 'party_name', width: '220' },
    { name: 'AT', key: 'amount_type', align: 'center', color: AmountTypeColor, width: '100' },
    { name: 'Amount', key: 'amount', align: 'right', color: AmountOBColor, display: 'currency' },
    { name: 'Sign', key: 'sign', align: 'center', display: 'boolean', color: SignColor },
  ];

  const viewList = $derived({
    All: data.token,
    AC: data.token
      .filter((d) => d.amount_type_1 == 'AC' || d.amount_type_2 == 'AC')
      .sort((a, b) => a?.party_name?.localeCompare(b.party_name)),
    CP: data.token
      .filter(
        (d) =>
          d.amount_type_1 == 'CP' ||
          d.amount_type_1 == 'Paytm' ||
          d.amount_type_2 == 'CP' ||
          d.amount_type_2 == 'Paytm',
      )
      .sort((a, b) => a?.order_number?.localeCompare(b.order_number))
      .sort((a, b) => a?.party_name?.localeCompare(b.party_name)),
    Blank: data.token.filter(
      (d) => !d.amount_type_1 && !d.amount_type_1 && !d.amount_type_2 && !d.amount_type_2,
    ),
    AC_Unsigned: data.token
      .filter((d) => (d.amount_type_1 == 'AC' || d.amount_type_2 == 'AC') && !d.sign)
      .sort((a, b) => a?.party_name?.localeCompare(b.party_name)),
    CP_Unsigned: data.token
      .filter(
        (d) =>
          (d.amount_type_1 == 'CP' ||
            d.amount_type_1 == 'Paytm' ||
            d.amount_type_2 == 'CP' ||
            d.amount_type_2 == 'Paytm') &&
          !d.sign,
      )
      .sort((a, b) => a?.order_number?.localeCompare(b.order_number))
      .sort((a, b) => a?.party_name?.localeCompare(b.party_name)),
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
    }, {}),
  );

  const loads = $derived(
    data.token.reduce((acc, item) => {
      const vehicle = item.vehicle;

      // Check if vehicle ends with 'G'
      if (vehicle && vehicle.endsWith('G')) {
        acc[vehicle] = (acc[vehicle] || 0) + 1;
      }

      return acc;
    }, {}),
  );

  const vehicleSummary = $derived(
    data.token.reduce((acc, item) => {
      const vehicle = item.vehicle;

      // Check if vehicle ends with 'G'
      if (vehicle && vehicle.endsWith('G')) {
        if (Array.isArray(acc[vehicle])) {
          acc[vehicle].push({ time: item.delivery_time, address: item.address });
        } else {
          acc[vehicle] = [];
          acc[vehicle].push({ time: item.delivery_time, address: item.address });
        }
      }

      return acc;
    }, {}),
  );

  const partyCounts = $derived(
    Object.fromEntries(
      Object.entries(
        data.token.reduce((acc, item) => {
          const partyName = item.party_name;

          if (partyName) {
            acc[partyName] = (acc[partyName] || 0) + 1;
          }

          return acc;
        }, {}),
      ).filter(([_, count]) => count > 1),
    ),
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
    }, []),
  );

  function orderColor(v) {
    return v == 'NO' ? HighlightCell.red : null;
  }

  function serialColor(_, item) {
    return item.has_mark ? HighlightCell.red : null;
  }

  function VehicleColor(value) {
    if (value.endsWith('G')) return { foreground: 'text-blue-700 font-bold' };
  }

  function SignColor(value) {
    return value == 1 ? HighlightCell.green : null;
  }

  function rowHighlight(item) {
    let highlight = {};
    if (item.is_cancelled) highlight = { ...highlight, ...HighlightRow.red };
    if (item.has_mark)
      highlight = { ...highlight, border: 'border-b-3 border-b-red-500 border-gray-500' };
    return highlight;
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
      case 'Bunk Cash':
        return HighlightCell.green;
      case 'Bunk Ac':
        return HighlightCell.yellow;
      case 'Gemini Ac':
        return HighlightCell.yellow;
      case 'Cash':
        return HighlightCell.green;
      case 'Cheque':
        return HighlightCell.purple;
    }
  }

  function AmountXColor(value) {
    switch (value) {
      case 'Bunk':
        return { foreground: 'text-purple-800 font-bold' };
      case 'CP':
        return { foreground: 'text-green-800 font-bold' };
      case 'Paytm':
        return { foreground: 'text-red-800 font-bold' };
      case 'Gpay':
        return { foreground: 'text-blue-800 font-bold' };
      case 'Bunk Cash':
        return { foreground: 'text-green-800 font-bold' };
      case 'Bunk Ac':
        return { foreground: 'text-yellow-600 font-bold' };
      case 'Gemini Ac':
        return { foreground: 'text-yellow-600 font-bold' };
      case 'Cash':
        return { foreground: 'text-green-800 font-bold' };
      case 'Cheque':
        return { foreground: 'text-purple-800 font-bold' };
    }
  }

  function Amount1Color(value, item) {
    return AmountXColor(item.amount_type_1);
  }

  function Amount2Color(value, item) {
    return AmountXColor(item.amount_type_2);
  }

  function AmountOBColor(value, item) {
    return AmountXColor(item.amount_type);
  }

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'Amount Update or Old Balance Entry' },
    { key: '1', description: 'AC Filter' },
    { key: '2', description: 'CP Filter' },
    { key: '3', description: 'Blank Filter' },
    { key: '4', description: 'Remove Filter' },
    { key: '5', description: 'Open Cash Report' },
    { key: '6', description: 'Open Order Book' },
    { key: '7', description: 'Open Old Balance' },
    { key: '8', description: 'Open Vehicle Summary' },
    { key: '🠊', description: 'Sign delivery entry or old balance' },
    { key: 'M', description: 'Mark Delivery Entry' },
    { key: 'E', description: 'Delivery Entry or Edit old balance' },
    { key: 'C', description: 'Clear Delivery Sheet' },
    { key: 'D', description: 'Delete Old Balance' },
    { key: 'R', description: 'Turn on Reconciliation & Review Mode' },
    { key: 'Enter', description: 'Delivery Entry or Edit old balance' },
  ];

  let formOpened = $state(false);
  let amountFormOpened = $state(false);
  let helperOpened = $state(false);

  let oldBalanceOpened = $state(false);
  let oldBalanceFormOpened = $state(false);
  let oldBalanceEditableItem = $state(null);

  let vehicleSummaryOpened = $state(false);
  let reviewMode = $state(false);
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

  function handleDeliveryMark(item) {
    transportAction('?/mark', { id: item.id, current: item.has_mark });
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

  function handleOldBalanceForm() {
    if (oldBalanceOpened) oldBalanceFormOpened = true;
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
      body: formData,
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

  function handleReviewMode() {
    reviewMode = !reviewMode;
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

  function handleOldBalanceEdit(item) {
    oldBalanceFormOpened = true;
    oldBalanceEditableItem = item;
  }

  function handleOldBalanceDelete(item) {
    if (item.sign) showToast("Can't Delete Signed Payments", 'danger');
    else transportAction('?/oldBalanceDelete', { id: item.id });
  }

  function handleOldBalanceSign(item) {
    transportAction('?/oldBalanceSign', { id: item.id, current: item.sign });
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

  function handleOldBalanceFormClose() {
    oldBalanceFormOpened = false;
    oldBalanceEditableItem = null;
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
    { key: 'M', handler: handleDeliveryMark },
    { key: 'Enter', handler: handleDeliveryEdit },
  ];

  const oldBalanceCustomEvents = [
    { key: 'ArrowRight', handler: handleOldBalanceSign },
    { key: 'E', handler: handleOldBalanceEdit },
    { key: 'D', handler: handleOldBalanceDelete },
    { key: 'Enter', handler: handleOldBalanceEdit },
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  function customCellHighlight(item) {
    if (item.delivery_item && item.delivery_quantity)
      return { ...HighlightRow.green, cells: [0, 1, 2] };
    else return { ...HighlightRow.yellow, cells: [0, 1, 2] };
  }

  const openCashReport = () => goto('/cash');
  const openOrderBook = () => goto('/orders');
  const openACFilter = () => (view = view == 'AC' ? 'AC_Unsigned' : 'AC');
  const openCPFilter = () => (view = view == 'CP' ? 'CP_Unsigned' : 'CP');
  const openBlankFilter = () => (view = 'Blank');
  const openRemoveFilter = () => (view = 'All');

  onMount(() => {
    keyboardEventBus.on('H', handleHelper);
    keyboardEventBus.on('0', handleOldBalanceForm);
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
    keyboardEventBus.off('0', handleOldBalanceForm);
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
  title={`Delivery Sheet${reviewMode ? ` (Reconciliation & Review Mode)` : ''}`}
  headerColor={reviewMode ? 'blue' : 'red'}
  {headers}
  items={viewList[view]}
  {customEvents}
  hideSerial={true}
  doAction={!formOpened &&
    !amountFormOpened &&
    !helperOpened &&
    !oldBalanceOpened &&
    !vehicleSummaryOpened}
  {customCellHighlight}
  {rowHighlight}
>
  {#snippet left()}
    <button
      class="m-0 cursor-pointer rounded-full bg-white p-0 hover:bg-white/90"
      onclick={handleFullDelete}
      title="Delete Current Delivery Sheet"
    >
      <Trash size={23} class="p-1 text-red-500" />
    </button>
    <div>&nbsp;</div>
    <button
      class="m-0 cursor-pointer rounded-full bg-white p-0 hover:bg-white/90"
      onclick={handleReviewMode}
      title="Turn on Reconciliation & Review Mode"
    >
      <CheckCheck size={23} class="p-1 text-red-500" />
    </button>
  {/snippet}
  {#snippet right()}
    <span class="mr-2">{view.replaceAll('_', ' ')}</span>
  {/snippet}
  {#snippet sidebar()}
    <div class="flex w-48 flex-col gap-2">
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
      <div class="flex w-full flex-col gap-2 overflow-auto">
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
                <td class=" border border-black bg-black px-1 text-white">Total</td>
                <!-- Item name (MS, PS, etc.) -->
                <td class=" border border-black bg-black px-1 text-right text-white">
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
  <div class="min-w-md bg-white p-5">
    {#each availableOptions as o}
      <div class="m-1 mb-2 flex items-center gap-2">
        <span class="inline-block flex-1 rounded-xs bg-gray-300 px-3 text-center">{o.key}</span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>

<!-- Old Balance -->
<Model open={oldBalanceOpened} onClose={() => (oldBalanceOpened = false)}>
  <div class="bg-white p-5">
    <Table
      title="Old Balance"
      headers={oldBalanceHeaders}
      autoHight={true}
      items={data.oldBalance}
      doAction={oldBalanceOpened}
      customEvents={oldBalanceCustomEvents}
    ></Table>
  </div>
</Model>
<OldBalanceForm
  open={oldBalanceFormOpened}
  onClose={handleOldBalanceFormClose}
  item={oldBalanceEditableItem}
  options={{ party: data.party }}
/>

<!-- Vehicle Summary -->
<Model open={vehicleSummaryOpened} onClose={() => (vehicleSummaryOpened = false)}>
  <div class="mx-5 mt-5 flex justify-center text-center">Vehicle Summary</div>
  <!-- <div class="text-center mt-5 mx-5 flex items-center">
    <InputField />
  </div> -->
  <div
    class="flex max-w-7xl items-start justify-start gap-2 overflow-x-auto bg-white p-5 whitespace-nowrap"
  >
    {#if Object.entries(vehicleSummary).length}
      {#each Object.entries(vehicleSummary) as [vehicle, data]}
        <table class="border-2">
          <thead>
            <tr>
              <th class="border bg-black px-1 text-white" colspan="3">{vehicle}</th>
            </tr>
            <tr>
              <th class="border bg-black px-1 text-white">S.no</th>
              <th class="border bg-black px-1 text-white">Time</th>
              <th class="border bg-black px-1 text-white">Address</th>
            </tr>
          </thead>
          <tbody>
            {#each data as entry, index (index)}
              <tr>
                <td class="border border-gray-500 px-1 text-center">{index + 1}</td>
                <td class="border border-gray-500 px-1">{entry.time}</td>
                <td class="border border-gray-500 px-1">{entry.address}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/each}
    {:else}
      <div class="flex gap-2 text-gray-500">
        <SearchXIcon />
        <div>No Data to Show</div>
      </div>
    {/if}
  </div>
</Model>
