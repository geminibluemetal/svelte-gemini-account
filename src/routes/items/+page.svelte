<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import ItemForm from './ItemForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';

  const { data } = $props();

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: '0.25', align: 'right', key: 'price_025' },
    { name: '0.50', align: 'right', key: 'price_050' },
    { name: '1.00', align: 'right', key: 'price_100' },
    { name: '1.50', align: 'right', key: 'price_150' },
    { name: '2.00', align: 'right', key: 'price_200' }
  ];

  let formOpened = $state(false);
  let editableItem = $state(null);

  function handleItemEdit(item) {
    formOpened = true;
    editableItem = item;
  }

  function handleItemPrint(item) {
    console.log('Print', item);
  }

  function handleFormClose() {
    formOpened = false;
    editableItem = null;
  }

  const customEvents = [
    { key: 'E', handler: handleItemEdit },
    { key: 'P', handler: handleItemPrint }
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
  });
</script>

<Table title="Items List" {headers} items={data.items} {customEvents} />
<ItemForm open={formOpened} onClose={handleFormClose} item={editableItem} />
