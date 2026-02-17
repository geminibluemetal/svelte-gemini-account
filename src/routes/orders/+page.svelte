<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import OrderForm from './OrderForm.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { HighlightCell, HighlightRow } from '$lib/utils/highlight';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Button from '$lib/components/Button.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import { goto } from '$app/navigation';

  const { data } = $props();
  let view = $state('pending');
  let formOpened = $state(false);
  let tokenOpened = $state(false);
  let helperOpened = $state(false);
  let editableOrder = $state(null);
  let quickToken = $state({
    id: null,
    vehicle: null,
    qty: null
  });
  const vehicleList = $derived(data.vehicle.map((v) => v.short_number));
  const viewList = $derived({
    all: data.orders,
    new: data.orders.filter((o) => o.status == 'New'),
    loading: data.orders.filter((o) => o.status == 'Loading'),
    partial: data.orders.filter((o) => o.status == 'Partial'),
    delivered: data.orders.filter((o) => o.status == 'Delivered'),
    cancelled: data.orders.filter((o) => o.status == 'Cancelled'),
    finished: data.orders.filter((o) => o.status == 'Finished'),
    pending: data.orders.filter(
      (o) => o.status == 'New' || o.status == 'Loading' || o.status == 'Partial'
    )
  });

  const headers = [
    { name: 'Date', align: 'center', key: 'date', display: 'date', width: '96' },
    { name: 'ON', align: 'center', key: 'order_number', color: OrderNumberColor, width: '38' },
    { name: 'Party', align: 'left', key: 'party_name', width: '210' },
    { name: 'Address', align: 'left', key: 'address', width: '210' },
    { name: 'Phone', align: 'left', key: 'phone', width: '100' },
    { name: 'Item', align: 'left', key: 'item' },
    { name: 'T Qty', align: 'center', key: 'total_qty', display: 'decimal', width: '53' },
    { name: 'AT', align: 'center', key: 'amount_type', color: AmountTypeColor, width: '60' },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Advan', align: 'right', key: 'advance', display: 'currency' },
    { name: 'Dis', align: 'right', key: 'discount', display: 'currency' },
    { name: 'Bal', align: 'right', key: 'balance', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', display: 'boolean', color: SignColor },
    { name: 'D Qty', align: 'center', key: 'delivered_qty', display: 'decimal', width: '53' },
    { name: 'B Qty', align: 'center', key: 'balance_qty', display: 'decimal', width: '53' },
    { name: 'Notes', align: 'left', key: 'notes', display: notesDisplay },
    { name: 'DSV', align: 'center', key: 'delivery_sheet_verified', color: DSVColor }
  ];

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'New Order' },
    { key: '1', description: 'Switch to Delivered orders' },
    { key: '2', description: 'Switch to Cancelled orders' },
    { key: '3', description: 'Switch to Finsihed orders' },
    { key: '4', description: 'Go to Delivery Sheet' },
    { key: '5', description: 'Go to Cash Report' },
    { key: '6', description: 'Switch to All orders' },
    { key: 'E', description: 'Edit Order' },
    // { key: 'D', description: 'Delete Order' },
    { key: 'P', description: 'Print Phone Number only' },
    { key: 'I', description: 'Single Load, Cash Bill Print' },
    { key: 'O', description: 'Full Load, Cash Bill Print' },
    { key: 'T', description: 'Generate Token Directly' },
    { key: '🠊', description: 'Sign Order Advance Amount' },
    { key: 'L', description: 'Set Loading status for Order' },
    { key: 'C', description: 'Set Cancelled status for Order' },
    { key: 'F', description: 'Set Finished status for Order' },
    { key: 'R', description: 'Reset Current status Automatically' },
    { key: 'Enter', description: 'Single Load Cash Bill Print' }
  ];

  function notesDisplay(value, item) {
    let prefix = '';
    prefix += item.tracktor_only ? '(🚜)' : '';
    prefix += item.status == 'Loading' ? '(⬆️)' : '';
    return `${prefix} ${value}`;
  }

  function OrderNumberColor(value, item) {
    return item.is_owner_order == 1 ? HighlightCell.red : null;
  }

  function SignColor(value) {
    return value == 1 ? HighlightCell.green : null;
  }

  function rowHighlight(item) {
    switch (item.status) {
      case 'Partial':
        return HighlightRow.yellow;
      case 'Delivered':
        return HighlightRow.emerald; // Enhanced Green Color
      case 'Cancelled':
        return HighlightRow.red;
      case 'Finished':
        return HighlightRow.blue;
    }
  }

  function DSVColor(value) {
    return value ? HighlightCell.blue : null;
  }

  function AmountTypeColor(value) {
    // COD, AC, Cash, Paytm, Gpay
    switch (value) {
      case 'COD':
        return HighlightCell.purple;
      case 'AC':
        return HighlightCell.yellow;
      case 'Cash':
        return HighlightCell.green;
      case 'Paytm':
        return HighlightCell.red;
      case 'Gpay':
        return HighlightCell.blue;
    }
  }

  function handleOrderEdit(item) {
    formOpened = true;
    editableOrder = item;
  }

  async function handleOrderDelete(item) {
    if (item.sign) {
      showToast('Signed Order Can not delete', 'amber');
      return;
    }
    const confirmed = await confirm(`Are you Sure to Delete '${item.name}'?`);
    if (confirmed) {
      const result = await transportAction('?/delete', { id: item.id });
      if (result.type === 'failure') showToast('Not Deleted', 'danger');
      else showToast('Deleted Success');
    }
  }

  const handleSinglePrint = (item) => {
    const qty = prompt('Enter Quantity');
    if (!qty) return;
    const amount = prompt('Enter Amount');
    if (!amount) return;
    const tip = prompt('Enter Tip Amount');
    transportAction('?/singlePrint', { id: item.id, qty, amount, tip });
  };
  const handleFullPrint = (item) => {
    const tip = prompt('Enter Tip Amount');
    if (!tip) return;
    transportAction('?/fullPrint', { id: item.id, tip });
  };
  const handlePhonePrint = (item) => transportAction('?/phonePrint', { id: item.id });
  const handleOrderLoading = (item) => transportAction('?/changeToLoading', { id: item.id });
  const handleOrderCancel = (item) => transportAction('?/changeToCancelled', { id: item.id });
  const handleOrderFinish = (item) => transportAction('?/changeToFinished', { id: item.id });
  const handleOrderStatusReset = (item) => transportAction('?/resetStatus', { id: item.id });
  const handleSignOrder = (item) => transportAction('?/sign', { id: item.id, current: item.sign });
  const handleTokenCreation = async (item) => {
    tokenOpened = true;
    quickToken.id = item.id;
  };

  const handleQuickTokenSubmit = () => {
    return async ({ result }) => {
      if (result.type === 'failure') showToast(result?.data?.message, 'danger');
      else {
        showToast(result?.data?.message);
        tokenOpened = false;
        quickToken = {
          id: null,
          vehicle: null,
          qty: null
        };
      }
    };
  };

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
    editableOrder = null;
  }

  async function handleOrderClear() {
    const confirmed = confirm('Are you sure to clear?');
    if (confirmed) {
      const result = await transportAction('?/clearOrder');
      if (result.type === 'failure') {
        const parsedData = JSON.parse(result.data);
        let message = parsedData[parsedData[0].message];
        message = message || 'Not Deleted';
        showToast(message, 'danger');
      } else showToast('Order Cleared');
    }
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function handleQuickTokenClose() {
    tokenOpened = false;
    quickToken = {
      id: null,
      vehicle: null,
      qty: null
    };
  }

  const customEvents = [
    { key: 'E', handler: handleOrderEdit },
    // { key: 'D', handler: handleOrderDelete },
    { key: 'P', handler: handlePhonePrint },
    { key: 'O', handler: handleFullPrint },
    { key: 'I', handler: handleSinglePrint },
    { key: 'T', handler: handleTokenCreation },
    { key: 'L', handler: handleOrderLoading },
    { key: 'C', handler: handleOrderCancel },
    { key: 'F', handler: handleOrderFinish },
    { key: 'R', handler: handleOrderStatusReset },
    { key: 'Enter', handler: handleSinglePrint },
    { key: 'ArrowRight', handler: handleSignOrder }
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);
  const gotoDeliverySheet = () => goto('/delivery');
  const gotoCashReport = () => goto('/cash');
  const handleFilterAll = () => (view = view == 'all' ? 'pending' : 'all');
  const handleFilterDelivered = () => (view = view == 'delivered' ? 'pending' : 'delivered');
  const handleFilterCancelled = () => (view = view == 'cancelled' ? 'pending' : 'cancelled');
  const handleFilterFinished = () => (view = view == 'finished' ? 'pending' : 'finished');

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('1', handleFilterDelivered);
    keyboardEventBus.on('2', handleFilterCancelled);
    keyboardEventBus.on('3', handleFilterFinished);
    keyboardEventBus.on('4', gotoDeliverySheet);
    keyboardEventBus.on('5', gotoCashReport);
    keyboardEventBus.on('6', handleFilterAll);
    keyboardEventBus.on('H', toggleHelper);
    syncOn('ORDERS.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('1', handleFilterDelivered);
    keyboardEventBus.off('2', handleFilterCancelled);
    keyboardEventBus.off('3', handleFilterFinished);
    keyboardEventBus.off('4', gotoDeliverySheet);
    keyboardEventBus.off('5', gotoCashReport);
    keyboardEventBus.off('6', handleFilterAll);
    keyboardEventBus.off('H', toggleHelper);
    syncOff('ORDERS.LIST');
  });
</script>

<Table
  title="Order Book"
  {headers}
  items={viewList[view]}
  hideSerial={true}
  {customEvents}
  {rowHighlight}
>
  {#snippet right()}
    <span class="capitalize mr-2">{view}</span>
  {/snippet}
  {#snippet sidebar()}
    <div>
      <div class="p-1 dark flex flex-col gap-2">
        {#if true}
          <Button color="danger" onclick={handleOrderClear}>
            <span class="w-full">Clear</span>
          </Button>
        {/if}
        {#if viewList.all.length}
          <Button color="primary" onclick={() => (view = 'all')} class="flex justify-between gap-2">
            <span>All</span> <span>{viewList.all.length}</span>
          </Button>
        {/if}
        {#if viewList.new.length}
          <Button color="primary" onclick={() => (view = 'new')} class="flex justify-between gap-2">
            <span>New</span> <span>{viewList.new.length}</span>
          </Button>
        {/if}
        {#if viewList.loading.length}
          <Button
            color="primary"
            onclick={() => (view = 'loading')}
            class="flex justify-between gap-2"
          >
            <span>Loading</span> <span>{viewList.loading.length}</span>
          </Button>
        {/if}
        {#if viewList.partial.length}
          <Button
            color="primary"
            onclick={() => (view = 'partial')}
            class="flex justify-between gap-2"
          >
            <span>Parital</span> <span>{viewList.partial.length}</span>
          </Button>
        {/if}
        {#if viewList.pending.length}
          <Button
            color="primary"
            onclick={() => (view = 'pending')}
            class="flex justify-between gap-2"
          >
            <span>Pending</span> <span>{viewList.pending.length}</span>
          </Button>
        {/if}
        {#if viewList.delivered.length}
          <Button
            color="primary"
            onclick={() => (view = 'delivered')}
            class="flex justify-between gap-2"
          >
            <span>Delivered</span> <span>{viewList.delivered.length}</span>
          </Button>
        {/if}
        {#if viewList.cancelled.length}
          <Button
            color="primary"
            onclick={() => (view = 'cancelled')}
            class="flex justify-between gap-2"
          >
            <span>Cancelled</span> <span>{viewList.cancelled.length}</span>
          </Button>
        {/if}
        {#if viewList.finished.length}
          <Button
            color="primary"
            onclick={() => (view = 'finished')}
            class="flex justify-between gap-2"
          >
            <span>Finished</span> <span>{viewList.finished.length}</span>
          </Button>
        {/if}
      </div>
    </div>
  {/snippet}
</Table>
<OrderForm open={formOpened} onClose={handleFormClose} item={editableOrder} options={data} />
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

<!-- Ask Vehicle and qty to genereate token for orders -->
<Model open={tokenOpened} onClose={handleQuickTokenClose} autoFocusTabIndex={2}>
  <Form
    action="?/orderToToken"
    method="POST"
    cancel={handleQuickTokenClose}
    class="max-w-lg"
    title="Quick Token"
    enhance={handleQuickTokenSubmit}
    submitButtonText={['Generate']}
  >
    <input type="hidden" name="id" bind:value={quickToken.id} />
    <InputField
      name="vehicle"
      bind:value={quickToken.vehicle}
      placeholder="Select Vehicle"
      autoComplete="off"
      options={vehicleList}
      silent={true}
    />
    <InputField
      name="qty"
      bind:value={quickToken.qty}
      placeholder="Enter Quantity"
      autoComplete="off"
      caseMode="none"
    />
  </Form>
</Model>
