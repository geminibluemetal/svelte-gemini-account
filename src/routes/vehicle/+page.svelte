<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import VehicleForm from './VehicleForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';

  const { data } = $props();

  const headers = [
    // { name: 'Full Number', align: 'left', key: 'full_number' },
    { name: 'Number', align: 'left', key: 'short_number' },
    { name: 'Company Vehicle', align: 'center', key: 'is_company_vehicle', display: 'boolean' },
    // { name: 'Capacity', align: 'center', key: 'body_capacity' }
  ];

  const availableOptions = [
    { key: '0', description: 'New Vehicle' },
    { key: 'E', description: 'Edit Vehicle' },
    { key: 'D', description: 'Delete Vehicle' },
    { key: 'H', description: 'List available Shortcut' },
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableVehicle = $state(null);

  function handleVehicleEdit(item) {
    formOpened = true;
    editableVehicle = item;
  }

  async function handleVehicleDelete(item) {
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
      body: formData,
    });
    return await res.json();
  }

  function handleFormClose() {
    formOpened = false;
    editableVehicle = null;
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  const customEvents = [
    { key: 'E', handler: handleVehicleEdit },
    { key: 'D', handler: handleVehicleDelete },
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('H', toggleHelper);
    syncOn('VEHICLE.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('H', toggleHelper);
    syncOff('VEHICLE.LIST');
  });
</script>

<Table title="Vehicle" {headers} items={data.vehicle} {customEvents} />
<VehicleForm
  open={formOpened}
  onClose={handleFormClose}
  item={editableVehicle}
  allVehicle={data.items}
/>

<Model open={helperOpened} onClose={toggleHelper}>
  <div class="min-w-md bg-white p-5">
    {#each availableOptions as o}
      <div class="m-1 flex items-center gap-2">
        <span class="inline-block flex-1 rounded-xs bg-gray-300 p-0.5 text-center">{o.key}</span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>
