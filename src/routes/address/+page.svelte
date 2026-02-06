<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import AddressForm from './AddressForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';

  const { data } = $props();

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: '0.25 Delivery', align: 'right', key: 'delivery_025' },
    { name: '1.00 Delivery', align: 'right', key: 'delivery_050_100' },
    { name: '2.00 Delivery', align: 'right', key: 'delivery_max' }
  ];

  const availableOptions = [
    { key: '0', description: 'New Address' },
    { key: 'E', description: 'Edit Address' },
    { key: 'D', description: 'Delete Address' },
    { key: 'H', description: 'List available Shortcut' }
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableAddress = $state(null);

  function handleAddressEdit(item) {
    formOpened = true;
    editableAddress = item;
  }

  async function handleAddressDelete(item) {
    const confirmed = await confirm(`Are you Sure to Delete '${item.name}'?`);
    if (confirmed) {
      const result = await transportAction('?/delete', { id: item.id });
      if (result.type === 'failure') showToast('Not Deleted', 'danger');
      else showToast('Deleted Success');
    }
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
    editableAddress = null;
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  const customEvents = [
    { key: 'E', handler: handleAddressEdit },
    { key: 'D', handler: handleAddressDelete }
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('H', toggleHelper);
    syncOn('ADDRESS.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('H', toggleHelper);
    syncOff('ADDRESS.LIST');
  });
</script>

<Table title="Address List" {headers} items={data.address} {customEvents} />
<AddressForm
  open={formOpened}
  onClose={handleFormClose}
  item={editableAddress}
  allAddress={data.items}
/>

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
