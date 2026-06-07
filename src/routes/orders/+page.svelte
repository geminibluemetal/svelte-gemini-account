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
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getFormattedDate } from '$lib/utils/dateTime';
  import { page } from '$app/stores';
  import {
    LucideBlend,
    LucidePen,
    LucidePhone,
    LucidePlusCircle,
    LucideReceiptIndianRupee,
    LucideRotateCcw,
    LucideSquareArrowUp,
    LucideTicket,
  } from 'lucide-svelte';

  const { data } = $props();
  let view = $state('pending');
  let formOpened = $state(false);
  let tokenOpened = $state(false);
  let helperOpened = $state(false);
  let editableOrder = $state(null);
  let quickToken = $state({
    id: null,
    vehicle: null,
    qty: null,
  });
  const vehicleList = $derived(data.vehicle.map((v) => v.shortNumber));
  const currentDate = $derived($page.url.searchParams.get('date') || getFormattedDate());
  let filterItem = $state();
  let filterQty = $state();

  const viewList = $derived({
    all: data.orders,
    new: data.orders.filter((o) => o.status == 'New'),
    loading: data.orders.filter((o) => o.status == 'Loading'),
    partial: data.orders.filter((o) => o.status == 'Partial'),
    delivered: data.orders.filter((o) => o.status == 'Delivered'),
    cancelled: data.orders.filter((o) => o.status == 'Cancelled'),
    finished: data.orders.filter((o) => o.status == 'Finished'),
    pending: data.orders.filter(
      (o) => o.status == 'New' || o.status == 'Loading' || o.status == 'Partial',
    ),
  });
  const viewListItems = $derived([...new Set(viewList[view].map((o) => o.item))]);
  const viewListQty = $derived([...new Set(viewList[view].map((o) => o.balanceQty))]);

  const filterList = $derived(
    viewList[view].filter((o) => {
      if (filterItem != 'All Item') {
        if (o.item != filterItem) return false;
      }
      if (filterQty != 'All Qty') {
        if (o.balanceQty != filterQty) return false;
      }
      return true;
    }),
  );

  const headers = [
    { name: 'Date', align: 'center', key: 'createdAt', display: 'date', width: '96' },
    { name: 'ON', align: 'center', key: 'orderNumber', color: OrderNumberColor, width: '38' },
    { name: 'Party', align: 'left', key: 'partyName', width: '220' },
    { name: 'Address', align: 'left', key: 'address', width: '220' },
    { name: 'Phone', align: 'left', key: 'phone', width: '100' },
    { name: 'Item', align: 'left', key: 'item' },
    { name: 'T Qty', align: 'center', key: 'totalQty', display: 'decimal', width: '53' },
    { name: 'AT', align: 'center', key: 'amountType', color: AmountTypeColor, width: '60' },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Advan', align: 'right', key: 'advance', display: 'currency' },
    { name: 'Dis', align: 'right', key: 'discount', display: 'currency' },
    { name: 'Bal', align: 'right', key: 'balance', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', display: 'sign', color: SignColor },
    { name: 'D Qty', align: 'center', key: 'deliveredQty', display: 'decimal', width: '53' },
    { name: 'B Qty', align: 'center', key: 'balanceQty', display: 'decimal', width: '53' },
    { name: 'Notes', align: 'left', key: 'notes', display: notesDisplay },
    { name: 'DSV', align: 'center', key: 'deliverySheetVerified', color: DSVColor },
  ];

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'New Order' },
    { key: '1', description: 'Filter Delivered orders' },
    { key: '2', description: 'Filter Cancelled orders' },
    { key: '3', description: 'Filter Finsihed orders' },
    { key: '4', description: 'Go to Delivery Sheet' },
    { key: '5', description: 'Go to Cash Report' },
    { key: '6', description: 'Filter Pending orders' },
    { key: '7', description: 'Show All orders' },
    { key: '8', description: 'Filter Loading orders' },
    { key: '9', description: 'Go to Tokens' },
    { key: 'E', description: 'Edit Order' },
    { key: 'V', description: 'Create Copy and Reuse Order' },
    { key: 'P', description: 'Print Phone Number only' },
    { key: 'I', description: 'Single Load, Cash Bill Print' },
    { key: 'O', description: 'Full Load, Cash Bill Print' },
    { key: 'T', description: 'Generate Token Directly' },
    { key: '🠊', description: 'Sign Order Advance Amount' },
    { key: 'L', description: 'Set Loading status for Order' },
    { key: 'C', description: 'Set Cancelled status for Order' },
    { key: 'F', description: 'Set Finished status for Order' },
    { key: 'R', description: 'Reset Current status Automatically' },
    { key: 'Enter', description: 'Full Load Cash Bill Print' },
  ];

  function notesDisplay(value, item) {
    const tractor = item.tracktorOnly ? '(🚗)' : '';
    const vehicle = item.assignedVehicle?.replace(' G', '') ?? '';
    const loading = item.status === 'Loading' ? `(⬆️${vehicle ? `-${vehicle}` : ''})` : '';
    return `${tractor}${loading} ${value}`.trim();
  }

  function OrderNumberColor(value, item) {
    return item.isOwnerOrder == 1 ? HighlightCell.red : null;
  }

  function SignColor(value) {
    return value == 1 ? HighlightCell.green : null;
  }

  function rowHighlight(item) {
    if (item.status === 'Partial') {
      return HighlightRow.yellow;
    } else if (item.status === 'Delivered') {
      return HighlightRow.emerald;
    } else if (item.status === 'Cancelled') {
      return HighlightRow.red;
    } else if (item.status === 'Finished') {
      return HighlightRow.blue;
    }
  }

  function DSVColor(value) {
    return value ? HighlightCell.blue : null;
  }

  function AmountTypeColor(value) {
    if (value === 'COD') {
      return HighlightCell.purple;
    } else if (value === 'AC') {
      return HighlightCell.yellow;
    } else if (value === 'Cash') {
      return HighlightCell.green;
    } else if (value === 'Paytm') {
      return HighlightCell.red;
    } else if (value === 'Gpay') {
      return HighlightCell.blue;
    }
  }

  function handleOrderEdit(item) {
    formOpened = true;
    editableOrder = item;
  }

  // async function handleOrderDelete(item) {
  //   if (item.sign) {
  //     showToast('Signed Order Can not delete', 'amber');
  //     return;
  //   }
  //   const confirmed = await confirm(`Are you Sure to Delete '${item.name}'?`);
  //   if (confirmed) {
  //     const result = await transportAction('?/delete', { id: item.id });
  //     if (result.type === 'failure') showToast('Not Deleted', 'danger');
  //     else showToast('Deleted Success');
  //   }
  // }

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
          qty: null,
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
      body: formData,
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

  async function handleOrderCopy(item) {
    formOpened = true;
    const copyData = {
      partyName: item.partyName,
      address: item.address,
      phone: item.phone,
      amountType: item.amountType,
      isOwnerOrder: item.isOwnerOrder,
      tracktorOnly: item.tracktorOnly,
      notes: item.notes,
    };
    editableOrder = copyData;
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function handleQuickTokenClose() {
    tokenOpened = false;
    quickToken = {
      id: null,
      vehicle: null,
      qty: null,
    };
  }

  function dispatchKey({ key = 'Enter', code, keyCode, target = document, type = 'keydown' } = {}) {
    const event = new KeyboardEvent(type, {
      key,
      code: code || key,
      keyCode: keyCode || key.charCodeAt(0),
      which: keyCode || key.charCodeAt(0),
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
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
    { key: 'V', handler: handleOrderCopy },
    { key: 'Enter', handler: handleFullPrint },
    { key: 'ArrowRight', handler: handleSignOrder },
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);
  const gotoDeliverySheet = () => goto(resolve(`/delivery?date=${currentDate}`));
  const gotoCashReport = () => goto(resolve(`/cash?date=${currentDate}`));
  const gotoToken = () => goto(resolve(`/tokens?date=${currentDate}`));
  const handleFilterAll = () => (view = 'all');
  const handleFilterDelivered = () => (view = 'delivered');
  const handleFilterCancelled = () => (view = 'cancelled');
  const handleFilterFinished = () => (view = 'finished');
  const handleFilterPending = () => (view = 'pending');
  const handleFilterLoading = () => (view = 'loading');
  // const handleFilterPartial = () => (view = 'partial');
  // const handleFilterNew = () => (view = 'new');

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('1', handleFilterDelivered);
    keyboardEventBus.on('2', handleFilterCancelled);
    keyboardEventBus.on('3', handleFilterFinished);
    keyboardEventBus.on('4', gotoDeliverySheet);
    keyboardEventBus.on('5', gotoCashReport);
    keyboardEventBus.on('6', handleFilterPending);
    keyboardEventBus.on('7', handleFilterAll);
    keyboardEventBus.on('8', handleFilterLoading);
    keyboardEventBus.on('9', gotoToken);
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
    keyboardEventBus.off('6', handleFilterPending);
    keyboardEventBus.off('7', handleFilterAll);
    keyboardEventBus.off('8', handleFilterLoading);
    keyboardEventBus.off('9', gotoToken);
    keyboardEventBus.off('H', toggleHelper);
    syncOff('ORDERS.LIST');
  });
</script>

<Table
  title="Order Book"
  {headers}
  items={filterList}
  hideSerial={true}
  {customEvents}
  {rowHighlight}
>
  {#snippet right()}
    <span class="mr-2 capitalize">{view}</span>
  {/snippet}
  {#snippet sidebar()}
    <div>
      <div class="dark flex flex-col gap-2 p-1">
        {#if true}
          <Button color="danger" onclick={handleOrderClear}>
            <span class="w-full">Clear</span>
          </Button>
        {/if}
        {#if viewList.all.length}
          <Button
            color="fuchsia"
            corner="7"
            onclick={() => (view = 'all')}
            class="flex justify-between gap-2"
          >
            <span>All</span> <span>{viewList.all.length}</span>
          </Button>
        {/if}
        {#if viewList.new.length}
          <Button color="fuchsia" onclick={() => (view = 'new')} class="flex justify-between gap-2">
            <span>New</span> <span>{viewList.new.length}</span>
          </Button>
        {/if}
        {#if viewList.loading.length}
          <Button
            color="fuchsia"
            corner="8"
            onclick={() => (view = 'loading')}
            class="flex justify-between gap-2"
          >
            <span>Loading</span> <span>{viewList.loading.length}</span>
          </Button>
        {/if}
        {#if viewList.partial.length}
          <Button
            color="fuchsia"
            onclick={() => (view = 'partial')}
            class="flex justify-between gap-2"
          >
            <span>Partial</span> <span>{viewList.partial.length}</span>
          </Button>
        {/if}
        {#if viewList.pending.length}
          <Button
            color="fuchsia"
            corner="6"
            onclick={() => (view = 'pending')}
            class="flex justify-between gap-2"
          >
            <span>Pending</span> <span>{viewList.pending.length}</span>
          </Button>
        {/if}
        {#if viewList.delivered.length}
          <Button
            color="fuchsia"
            corner="1"
            onclick={() => (view = 'delivered')}
            class="flex justify-between gap-2"
          >
            <span>Delivered</span> <span>{viewList.delivered.length}</span>
          </Button>
        {/if}
        {#if viewList.cancelled.length}
          <Button
            color="fuchsia"
            corner="2"
            onclick={() => (view = 'cancelled')}
            class="flex justify-between gap-2"
          >
            <span>Cancelled</span> <span>{viewList.cancelled.length}</span>
          </Button>
        {/if}
        {#if viewList.finished.length}
          <Button
            color="fuchsia"
            corner="3"
            onclick={() => (view = 'finished')}
            class="flex justify-between gap-2"
          >
            <span>Finished</span> <span>{viewList.finished.length}</span>
          </Button>
        {/if}
      </div>
      <div class="dark flex flex-col gap-2 p-1">
        <div class="flex gap-2 *:flex-1">
          <Button color="primary" corner="4" onclick={gotoDeliverySheet}>DS</Button>
          <Button color="primary" corner="5" onclick={gotoCashReport}>CR</Button>
        </div>
      </div>
      <div class="dark flex flex-col gap-2 p-1 lg:hidden">
        <div class="flex gap-2 *:flex-1">
          <Button color="success" corner="0" onclick={toggleOpenForm}>
            <LucidePlusCircle />
          </Button>
          <Button color="success" corner="E" onclick={() => dispatchKey({ key: 'e' })}>
            <LucidePen />
          </Button>
          <Button color="success" corner="V" onclick={() => dispatchKey({ key: 'v' })}>
            <LucideBlend />
          </Button>
        </div>
        <div class="flex gap-2 *:flex-1">
          <Button color="success" corner="P" onclick={() => dispatchKey({ key: 'p' })}>
            <LucidePhone />
          </Button>
          <Button color="success" corner="I" onclick={() => dispatchKey({ key: 'i' })}>
            <LucideReceiptIndianRupee />
          </Button>
          <Button color="success" corner="O" onclick={() => dispatchKey({ key: 'o' })}>
            <LucideReceiptIndianRupee />
          </Button>
        </div>
        <div class="flex gap-2 *:flex-1">
          <Button color="success" corner="T" onclick={() => dispatchKey({ key: 't' })}>
            <LucideTicket />
          </Button>
          <Button color="success" corner="L" onclick={() => dispatchKey({ key: 'l' })}>
            <LucideSquareArrowUp />
          </Button>
          <Button color="success" corner="R" onclick={() => dispatchKey({ key: 'r' })}>
            <LucideRotateCcw />
          </Button>
        </div>
      </div>

      <!-- Filter by Item and Quantity -->
      <div class="flex flex-col gap-2 p-1">
        <select
          class="appearance-none rounded border-2 border-gray-300 p-1 px-2 outline-none"
          bind:value={filterItem}
        >
          <option value="All Item">All Item</option>
          {#each viewListItems as i (i)}
            <option value={i}>{i}</option>
          {/each}
        </select>
        <select
          class="appearance-none rounded border-2 border-gray-300 p-1 px-2 outline-none"
          bind:value={filterQty}
        >
          <option value="All Qty">All Qty</option>
          {#each viewListQty as i (i)}
            <option value={i}>{i}</option>
          {/each}
        </select>
        <Button
          color="gray"
          onclick={() => ((filterItem = 'All Item'), (filterQty = 'All Qty'))}
          class="flex justify-between gap-2"
        >
          <span>Remove</span>
        </Button>
      </div>
    </div>
  {/snippet}
</Table>
<OrderForm open={formOpened} onClose={handleFormClose} item={editableOrder} options={data} />
<Model open={helperOpened} onClose={toggleHelper}>
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
