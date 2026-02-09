<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import TokenForm from './TokenForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import Badge from '$lib/components/Badge.svelte';
  import Button from '$lib/components/Button.svelte';

  const { data } = $props();
  const headers = [
    { name: 'Serial', align: 'center', key: 'serial' },
    { name: 'Time', align: 'center', key: 'token_time' },
    { name: 'Party', align: 'left', key: 'party_name' },
    { name: 'Item', align: 'left', key: 'token_item' },
    { name: 'Quantity', align: 'center', key: 'token_quantity', display: 'decimal' },
    { name: 'Vehicle', align: 'left', key: 'vehicle' }
  ];

  const availableOptions = [
    { key: '0', description: 'New Token' },
    { key: 'E', description: 'Edit Token' },
    { key: 'D', description: 'Delete Token' },
    { key: 'P', description: 'Print Token' },
    { key: 'H', description: 'List available Shortcut' }
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableToken = $state(null);
  let view = $state('opened');

  const viewList = $derived({
    all: data.token,
    closed: data.token.filter((t) => t.delivery_item && t.delivery_quantity),
    opened: data.token.filter((t) => !t.delivery_item || !t.delivery_quantity)
  });

  function handleTokenEdit(item) {
    formOpened = true;
    editableToken = item;
  }

  async function handleTokenDelete(item) {
    const confirmed = await confirm(`Are you Sure to Delete '${item.name}'?`);
    if (confirmed) {
      const result = await transportAction('?/delete', { id: item.id });
      if (result.type === 'failure') {
        const parsedData = JSON.parse(result.data);
        let message = parsedData[parsedData[0].message];
        message = message || 'Not Deleted';
        showToast(message, 'danger');
      } else showToast('Deleted Success');
    }
  }

  const handleTokenPrint = (item) => transportAction('?/print', { id: item.id });

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

  const viewAllToken = () => (view = 'all');
  const viewOpenedToken = () => (view = 'opened');
  const viewClosedToken = () => (view = 'closed');

  function handleFormClose() {
    formOpened = false;
    editableToken = null;
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  const customEvents = [
    { key: 'E', handler: handleTokenEdit },
    { key: 'D', handler: handleTokenDelete },
    { key: 'P', handler: handleTokenPrint }
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('H', toggleHelper);
    syncOn('DELIVERY.TOKEN.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('H', toggleHelper);
    syncOff('DELIVERY.TOKEN.LIST');
  });
</script>

<Table title="Token" {headers} items={viewList[view]} {customEvents} hideSerial={true}>
  {#snippet right()}
    <span class="capitalize px-2">{view}</span>
  {/snippet}
  {#snippet sidebar()}
    <div>
      <div class="p-3 dark flex flex-col gap-2">
        <Button onclick={viewAllToken} color="primary" class="flex justify-between gap-2">
          <span>Total</span> <span>{viewList.all.length}</span>
        </Button>
        <Button onclick={viewOpenedToken} color="primary" class="flex justify-between gap-2">
          <span>Opened</span> <span>{viewList.opened.length}</span>
        </Button>
        <Button onclick={viewClosedToken} color="primary" class="flex justify-between gap-2">
          <span>Closed</span> <span>{viewList.closed.length}</span>
        </Button>
      </div>
    </div>
  {/snippet}
</Table>
<TokenForm open={formOpened} onClose={handleFormClose} item={editableToken} options={data} />

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
