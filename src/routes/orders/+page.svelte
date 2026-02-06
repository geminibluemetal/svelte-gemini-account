<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import OrderForm from './OrderForm.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const headers = [
    { name: 'Date', align: 'center', key: 'date', display: 'date' },
    { name: 'ON', align: 'center', key: 'order_number' },
    { name: 'Party', align: 'left', key: 'party_name' },
    { name: 'Address', align: 'left', key: 'address' },
    { name: 'Phone', align: 'left', key: 'phone' },
    { name: 'Item', align: 'left', key: 'item' },
    { name: 'T Qty', align: 'center', key: 'total_qty', display: 'decimal' },
    { name: 'AT', align: 'center', key: 'amount_type' },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Advance', align: 'right', key: 'advance', display: 'currency' },
    { name: 'Disount', align: 'right', key: 'discount', display: 'currency' },
    { name: 'Balance', align: 'right', key: 'balance', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign' },
    { name: 'D Qty', align: 'center', key: 'delivered_qty', display: 'decimal' },
    { name: 'B Qty', align: 'center', key: 'balance_qty', display: 'decimal' },
    { name: 'Notes', align: 'left', key: 'notes', display: notesDisplay },
    { name: 'DSV', align: 'center', key: 'delivery_sheet_verified' }
  ];

  function notesDisplay(value, item) {
    return `${item.tracktor_only ? '(🚜)' : ''} ${value}`;
  }

  const { data } = $props();

  const availableOptions = [
    { key: '0', description: 'New Item' },
    { key: 'E', description: 'Edit Item' },
    { key: 'D', description: 'Delete Item' },
    { key: 'H', description: 'List available Shortcut' }
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableOrder = $state(null);

  function handleItemEdit(item) {
    formOpened = true;
    editableOrder = item;
  }

  async function handleItemDelete(item) {
    const formData = new FormData();
    const confirmed = await confirm(`Are you Sure to Delete '${item.name}'?`);
    if (confirmed) {
      formData.append('id', item.id);
      fetch('?/delete', {
        method: 'POST',
        body: formData
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.type == 'failure') {
            showToast('Not Deleted', 'danger');
          } else {
            showToast('Deleted Success');
          }
        });
    }
  }

  function handleFormClose() {
    formOpened = false;
    editableOrder = null;
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  const customEvents = [
    { key: 'E', handler: handleItemEdit },
    { key: 'D', handler: handleItemDelete }
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
      <div class="m-1 flex gap-2 items-center">
        <span class="inline-block bg-gray-300 p-0.5 rounded-xs flex-1 text-center">{o.key}</span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>
