<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { goto } from '$app/navigation';
  import display from '$lib/core/client/display.js';
  import { HighlightCell } from '$lib/utils/highlight.js';

  const { data } = $props();

  const debitColor = (value) => (value ? { ...HighlightCell.red, background: '' } : null);
  const creditColor = (value) => (value ? { ...HighlightCell.green, background: '' } : null);
  const balanceColor = (value) => (value ? { ...HighlightCell.blue, background: '' } : null);

  const headers = [
    { name: 'Date', align: 'center', key: 'date', width: 100, display: 'date' },
    { name: 'Time', align: 'center', key: 'time', width: 80, display: 'time' },
    { name: 'Vehicle', align: 'left', key: 'vehicle', width: 70 },
    { name: 'Address', align: 'left', key: 'address', width: 230 },
    { name: 'Item', align: 'left', key: 'item' },
    { name: 'Qty', key: 'qty', align: 'right', width: 50, display: 'decimal' },
    {
      name: 'Debit',
      align: 'right',
      key: 'debit',
      width: 110,
      display: 'currency',
      color: debitColor
    },
    {
      name: 'Credit',
      align: 'right',
      key: 'credit',
      width: 110,
      display: 'currency',
      color: creditColor
    },
    {
      name: 'Balance',
      align: 'right',
      key: 'running_balance',
      width: 110,
      display: 'currency',
      color: balanceColor
    }
  ];

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: 'R', description: 'Reset Balance' },
    { key: 'Enter', description: 'Open Party Ledger' }
  ];

  let helperOpened = $state(false);

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

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function gotoPartyLedger(item) {
    goto(`/statement/${item.id}`);
  }

  function gotoBalanceSheet() {
    goto(`/balance`);
  }

  function handleBalanceReset(item) {
    // console.log(item);
    // goto(`/statement/${item.id}`);
  }

  const customEvents = [
    { key: 'Enter', handler: gotoPartyLedger },
    { key: 'R', handler: handleBalanceReset }
  ];

  onMount(() => {
    keyboardEventBus.on('H', toggleHelper);
    keyboardEventBus.on('Backspace', gotoBalanceSheet);
    syncOn('BALANCE.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('H', toggleHelper);
    keyboardEventBus.off('Backspace', gotoBalanceSheet);
    syncOff('BALANCE.LIST');
  });
</script>

<Table title={data.party?.name} {headers} items={data.statement} {customEvents} />

<!-- Helper Dialog -->
<Model open={helperOpened} onClose={() => (helperOpened = false)}>
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
