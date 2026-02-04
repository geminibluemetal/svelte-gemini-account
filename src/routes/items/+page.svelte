<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import ItemForm from './ItemForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';

  const headers = [
    { name: 'Name', align: 'left', key: 'name' },
    { name: '0.25', align: 'right', key: 'price_025' },
    { name: '0.50', align: 'right', key: 'price_050' },
    { name: '1.00', align: 'right', key: 'price_100' },
    { name: '1.50', align: 'right', key: 'price_150' },
    { name: '2.00', align: 'right', key: 'price_200' }
  ];

  const a = {
    name: 'Velthigamani Benda',
    price_025: 5000,
    price_050: 5000,
    price_100: 300,
    price_150: 300,
    price_200: 300
  };

  let formOpened = $state(false);

  function handleItemEdit(item) {
    console.log('Edit', item);
    formOpened = true;
  }

  function handleItemPrint(item) {
    console.log('Print', item);
  }

  const customEvents = [
    { key: 'E', handler: handleItemEdit },
    { key: 'P', handler: handleItemPrint }
  ];

  const items = Array.from({ length: 500 }).map((_) => a);
  items.unshift({ ...a, name: 'Kumar' });

  const toggleOpenForm = () => (formOpened = !formOpened);

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
  });
</script>

<Table title="Items List" {headers} {items} {customEvents} />
<ItemForm open={formOpened} onClose={() => (formOpened = false)} />
