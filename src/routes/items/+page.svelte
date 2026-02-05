<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import ItemForm from './ItemForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';

  const { data } = $props();

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: '0.25', align: 'right', key: 'price_025' },
    { name: '0.50', align: 'right', key: 'price_050' },
    { name: '1.00', align: 'right', key: 'price_100' },
    { name: '1.50', align: 'right', key: 'price_150' },
    { name: '2.00', align: 'right', key: 'price_200' }
  ];

  const availableOptions = [
    { key: '0', description: 'New Item' },
    { key: 'E', description: 'Edit Item' },
    { key: 'D', description: 'Delete Item' },
    { key: 'H', description: 'List available Shortcut' }
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableItem = $state(null);

  function handleItemEdit(item) {
    formOpened = true;
    editableItem = item;
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
    editableItem = null;
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
    syncOn('ITEMS.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('H', toggleHelper);
    syncOff('ITEMS.LIST');
  });
</script>

<Table title="Items List" {headers} items={data.items} {customEvents} />
<ItemForm open={formOpened} onClose={handleFormClose} item={editableItem} allItems={data.items} />

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
