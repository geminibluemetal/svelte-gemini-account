<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import TokenForm from './TokenForm.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import Button from '$lib/components/Button.svelte';
  import { page } from '$app/stores';
  import { HighlightRow } from '$lib/utils/highlight';
  import { getFormattedDate } from '$lib/utils/dateTime';
  import { parseDate } from '$lib/utils/dateTimeParser';
  import { updateParams } from '$lib/core/client/urlParams';
  import NavigateButton from '$lib/components/NavigateButton.svelte';
  import { resolve } from '$app/paths';
  import { goto } from '$app/navigation';

  const { data } = $props();
  const headers = [
    { name: 'Serial', align: 'center', key: 'serial' },
    { name: 'Time', align: 'center', key: 'createdAt', display: 'time', width: '85' },
    { name: 'Party', align: 'left', key: 'partyName', width: '300' },
    { name: 'Item', align: 'left', key: 'tokenItem', width: '125' },
    { name: 'Quantity', align: 'center', key: 'tokenQuantity', display: 'decimal' },
    { name: 'Vehicle', align: 'left', key: 'vehicle', width: '70' },
  ];

  const availableOptions = [
    { key: '0', description: 'New Token' },
    { key: 'E', description: 'Edit Token' },
    { key: 'D', description: 'Delete Token' },
    { key: 'P', description: 'Print Token' },
    { key: 'H', description: 'List available Shortcut' },
    { key: '4', description: 'Go to Delivery Sheet' },
    { key: '5', description: 'Go to Cash Report' },
    { key: '6', description: 'Go to Orders' },
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableToken = $state(null);
  let view = $state('opened');

  const currentDate = $derived($page.url.searchParams.get('date') || getFormattedDate());
  const viewList = $derived({
    all: data.token,
    closed: data.token.filter((t) => t.isClosed),
    opened: data.token.filter((t) => !t.isClosed),
  });

  function handleTokenEdit(item) {
    formOpened = true;
    editableToken = item;
  }

  async function handleTokenDelete(item) {
    const confirmed = await confirm(`Are you Sure to Delete?`);
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
      body: formData,
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

  function handlePreviewsDate() {
    let prev = parseDate(currentDate);
    prev = prev.setDate(prev.getDate() - 1);
    prev = getFormattedDate(prev);
    updateParams({ date: prev });
  }

  function handleNextDate() {
    let next = parseDate(currentDate);
    next = next.setDate(next.getDate() + 1);
    next = getFormattedDate(next);
    updateParams({ date: next });
  }

  function handleTodayDate() {
    updateParams({ date: getFormattedDate() });
  }

  const customEvents = [
    { key: 'E', handler: handleTokenEdit },
    { key: 'D', handler: handleTokenDelete },
    { key: 'P', handler: handleTokenPrint },
  ];

  const toggleOpenForm = () => (formOpened = !formOpened);

  function rowHighlight(item) {
    return item.isCancelled ? HighlightRow.red : null;
  }

  const gotoDeliverySheet = () => goto(resolve(`/delivery?date=${currentDate}`));
  const gotoCashReport = () => goto(resolve(`/cash?date=${currentDate}`));
  const gotoOrderBook = () => goto(resolve(`/orders?date=${currentDate}`));

  onMount(() => {
    keyboardEventBus.on('0', toggleOpenForm);
    keyboardEventBus.on('H', toggleHelper);
    keyboardEventBus.on('4', gotoDeliverySheet);
    keyboardEventBus.on('5', gotoCashReport);
    keyboardEventBus.on('6', gotoOrderBook);
    syncOn('DELIVERY.TOKEN.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', toggleOpenForm);
    keyboardEventBus.off('H', toggleHelper);
    keyboardEventBus.off('4', gotoDeliverySheet);
    keyboardEventBus.off('5', gotoCashReport);
    keyboardEventBus.on('6', gotoOrderBook);
    syncOff('DELIVERY.TOKEN.LIST');
  });
</script>

<Table
  title="Token"
  {headers}
  items={viewList[view]}
  {customEvents}
  hideSerial={true}
  {rowHighlight}
>
  {#snippet right()}
    <span class="px-2 capitalize">{view}</span>
  {/snippet}
  {#snippet sidebar()}
    <div>
      <div class="flex flex-col gap-2 p-3">
        <NavigateButton
          class="focus:bg-amber-50"
          onNext={handleNextDate}
          onPrevious={handlePreviewsDate}
          onClick={handleTodayDate}
        >
          {currentDate}
        </NavigateButton>
        <Button onclick={viewAllToken} color="primary" class="dark flex justify-between gap-2">
          <span>All</span> <span>{viewList.all.length}</span>
        </Button>
        <Button onclick={viewOpenedToken} color="primary" class="dark flex justify-between gap-2">
          <span>Opened</span> <span>{viewList.opened.length}</span>
        </Button>
        <Button onclick={viewClosedToken} color="primary" class="dark flex justify-between gap-2">
          <span>Closed</span> <span>{viewList.closed.length}</span>
        </Button>
      </div>
    </div>
  {/snippet}
</Table>
<TokenForm open={formOpened} onClose={handleFormClose} item={editableToken} options={data} />

<Model open={helperOpened} onClose={toggleHelper}>
  <div class="min-w-md bg-white p-5">
    {#each availableOptions as o (o.key)}
      <div class="m-1 flex items-center gap-2">
        <span class="inline-block flex-1 rounded-xs bg-gray-300 p-0.5 text-center">{o.key}</span>
        <span>=</span>
        <span class="flex-11">{o.description}</span>
      </div>
    {/each}
  </div>
</Model>
