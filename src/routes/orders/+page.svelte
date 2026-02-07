<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import OrderForm from './OrderForm.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { Highlight } from '$lib/utils/highlight';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';

  const headers = [
    { name: 'Date', align: 'center', key: 'date', display: 'date' },
    { name: 'ON', align: 'center', key: 'order_number', color: OrderNumberColor },
    { name: 'Party', align: 'left', key: 'party_name' },
    { name: 'Address', align: 'left', key: 'address' },
    { name: 'Phone', align: 'left', key: 'phone' },
    { name: 'Item', align: 'left', key: 'item' },
    { name: 'T Qty', align: 'center', key: 'total_qty', display: 'decimal' },
    { name: 'AT', align: 'center', key: 'amount_type', color: AmountTypeColor },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Advance', align: 'right', key: 'advance', display: 'currency' },
    { name: 'Disount', align: 'right', key: 'discount', display: 'currency' },
    { name: 'Balance', align: 'right', key: 'balance', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', display: 'boolean', color: SignColor },
    { name: 'D Qty', align: 'center', key: 'delivered_qty', display: 'decimal' },
    { name: 'B Qty', align: 'center', key: 'balance_qty', display: 'decimal' },
    { name: 'Notes', align: 'left', key: 'notes', display: notesDisplay },
    { name: 'DSV', align: 'center', key: 'delivery_sheet_verified' }
  ];

  function notesDisplay(value, item) {
    return `${item.tracktor_only ? '(🚜)' : ''} ${value}`;
  }

  function OrderNumberColor(value, item) {
    return item.is_owner_order == 1 ? Highlight.red : null;
  }

  function SignColor(value) {
    return value == 1 ? Highlight.green : null;
  }

  function AmountTypeColor(value) {
    // COD, AC, Cash, Paytm, Gpay
    switch (value) {
      case 'COD':
        return Highlight.purple;
      case 'AC':
        return Highlight.yellow;
      case 'Cash':
        return Highlight.green;
      case 'Paytm':
        return Highlight.red;
      case 'Gpay':
        return Highlight.blue;
    }
  }

  const { data } = $props();

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'New Item' },
    { key: 'E', description: 'Edit Item' },
    { key: 'D', description: 'Delete Item' },
    { key: 'P', description: 'Print Phone Number only' },
    { key: 'I', description: 'Single Load Cash Bill Print' },
    { key: 'O', description: 'Full Load Cash Bill Print' },
    { key: 'T', description: 'Generate Token For these Order' },
    { key: '➔', description: 'Sign this order' },
    { key: 'Enter', description: 'Single Load Cash Bill Print' }
  ];

  const vehicleList = $derived(data.vehicle.map((v) => v.short_number));

  let formOpened = $state(false);
  let tokenOpened = $state(false);
  let helperOpened = $state(false);
  let editableOrder = $state(null);
  let quickToken = $state({
    id: null,
    vehicle: null,
    qty: null
  });

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

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function toggleToken() {
    tokenOpened = !tokenOpened;
  }

  const customEvents = [
    { key: 'E', handler: handleOrderEdit },
    { key: 'D', handler: handleOrderDelete },
    { key: 'P', handler: handlePhonePrint },
    { key: 'O', handler: handleFullPrint },
    { key: 'I', handler: handleSinglePrint },
    { key: 'T', handler: handleTokenCreation },
    { key: 'Enter', handler: handleSinglePrint },
    { key: 'ArrowRight', handler: handleSignOrder }
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('H', toggleHelper);
    syncOn('ORDERS.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('H', toggleHelper);
    syncOff('ORDERS.LIST');
  });
</script>

<Table title="Order Book" {headers} items={data.orders} hideSerial={true} {customEvents}></Table>
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
<Model open={tokenOpened} onClose={toggleToken} autoFocusTabIndex={2}>
  <Form
    action="?/orderToToken"
    method="POST"
    cancel={toggleToken}
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
