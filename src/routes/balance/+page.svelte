<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import PrintBalance from './PrintBalance.svelte';

  const { data } = $props();

  const headers = [
    { name: 'Name', align: 'left', key: 'name', width: 300 },
    { name: 'Phone', align: 'center', key: 'phone', width: 150 },
    {
      name: 'Open Balance',
      align: 'right',
      key: 'opening_balance',
      width: 125,
      display: 'currency',
    },
    { name: 'Total Amount', align: 'right', key: 'total_debit', width: 125, display: 'currency' },
    { name: 'Total Payment', align: 'right', key: 'total_credit', width: 125, display: 'currency' },
    {
      name: 'Current Balance',
      align: 'right',
      key: 'current_balance',
      width: 125,
      display: 'currency',
    },
  ];

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: 'R', description: 'Reset Balance' },
    { key: 'N', description: 'Nil Balance' },
    { key: 'P', description: 'Print Balance Sheet' },
    { key: '1', description: 'All Filter' },
    { key: '2', description: 'Pending Filter' },
    { key: '3', description: 'Nil Filter' },
    { key: 'Enter', description: 'Open Party Ledger' },
  ];

  let helperOpened = $state(false);
  let isPrinting = $state(false);

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

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function gotoPartyLedger(item) {
    goto(`/statement/${item.id}`);
  }

  function handleBalanceReset(item) {
    const isConfirmed = confirm(`Reset Balance For ${item.name}`);
    if (isConfirmed) transportAction(`/balanceReset`, { id: item.id });
  }

  function handleBalanceNil(item) {
    const isConfirmed = confirm(`Nil Balance for ${item.name}`);
    if (isConfirmed) transportAction(`/balanceNil`, { id: item.id });
  }

  function handlePrint() {
    isPrinting = true;
    window.print();
  }

  function handleAllFilter() {
    goto(`?type=all`);
  }
  function handlePendingFilter() {
    goto(`?type=pending`);
  }
  function handleNilFilter() {
    goto(`?type=nil`);
  }

  const customEvents = [
    { key: 'Enter', handler: gotoPartyLedger },
    { key: 'R', handler: handleBalanceReset },
    { key: 'N', handler: handleBalanceNil },
  ];

  onMount(() => {
    keyboardEventBus.on('H', toggleHelper);
    keyboardEventBus.on('P', handlePrint);
    keyboardEventBus.on('1', handleAllFilter);
    keyboardEventBus.on('2', handlePendingFilter);
    keyboardEventBus.on('3', handleNilFilter);
    syncOn('BALANCE.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('H', toggleHelper);
    keyboardEventBus.off('P', handlePrint);
    keyboardEventBus.off('1', handleAllFilter);
    keyboardEventBus.off('2', handlePendingFilter);
    keyboardEventBus.off('3', handleNilFilter);
    syncOff('BALANCE.LIST');
  });
</script>

<div class="printing-content">
  <PrintBalance title="Balance Sheet" {headers} items={data.balance} />
</div>

<div class="visible-content">
  <Table title="Balance Sheet" {headers} items={data.balance} {customEvents}>
    {#snippet sidebar()}
      <div class="flex w-25 flex-col gap-2">
        <Button corner="1" color="primary" onclick={handleAllFilter}>All</Button>
        <Button corner="2" color="primary" onclick={handlePendingFilter}>Pending</Button>
        <Button corner="3" color="primary" onclick={handleNilFilter}>Nil</Button>
        <Button corner="P" class="dark" onclick={handlePrint}>Print</Button>
      </div>
    {/snippet}
  </Table>

  <!-- Helper Dialog -->
  <Model open={helperOpened} onClose={() => (helperOpened = false)}>
    <div class="min-w-md bg-white p-5">
      {#each availableOptions as o}
        <div class="m-1 mb-2 flex items-center gap-2">
          <span class="inline-block flex-1 rounded-xs bg-gray-300 px-3 text-center">{o.key}</span>
          <span>=</span>
          <span class="flex-11">{o.description}</span>
        </div>
      {/each}
    </div>
  </Model>
</div>

<style>
  .printing-content {
    display: none;
  }

  @media print {
    .printing-content {
      display: block;
    }
    .visible-content {
      display: none;
    }
  }
</style>
