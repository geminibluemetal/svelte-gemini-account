<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import { resolve } from '$app/paths';
  import PrintBalance from './PrintBalance.svelte';
  import { deserialize } from '$app/forms';
  import { showToast } from '$lib/stores/toast';

  const { data } = $props();

  const headers = [
    { name: 'Name', align: 'left', key: 'name', width: 300 },
    { name: 'Phone', align: 'center', key: 'phone', width: 110 },
    {
      name: 'Open Balance',
      align: 'right',
      key: 'openingBalance',
      width: 125,
      display: 'currency',
    },
    { name: 'Total Amount', align: 'right', key: 'totalDebit', width: 125, display: 'currency' },
    { name: 'Total Payment', align: 'right', key: 'totalCredit', width: 125, display: 'currency' },
    {
      name: 'Total Adjust',
      align: 'right',
      key: 'totalAdjust',
      width: 125,
      display: 'currency',
    },
    {
      name: 'Current Balance',
      align: 'right',
      key: 'currentBalance',
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

  async function transportAction(url, data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return deserialize(await response.text());
  }

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function gotoPartyLedger(item) {
    goto(resolve(`/statement/${item.id}`));
  }

  function handleBalanceReset(item) {
    const isConfirmed = confirm(`Reset Balance For ${item.name}`);
    if (isConfirmed) transportAction(`?/balanceReset`, { id: item.id });
  }

  function handleBalanceNil(item) {
    const isConfirmed = confirm(`Nil Balance for ${item.name}`);
    if (isConfirmed) transportAction(`?/balanceNil`, { id: item.id });
  }

  function handlePrint() {
    window.print();
  }

  function handleAllFilter() {
    goto(resolve(`/balance?type=all`));
  }
  function handlePendingFilter() {
    goto(resolve(`/balance?type=pending`));
  }
  function handleNilFilter() {
    goto(resolve(`/balance?type=nil`));
  }

  async function handleBulkReset() {
    if (!confirm('Are you sure? This will settle all balances and clear history.')) return;
    try {
      const response = await transportAction(`?/bulkBalanceResetForAll`);
      if (response.type == 'success') {
        showToast(`${response?.data?.updatedParties || 'All'} parties balance was reset`);
      } else {
        showToast('Error Occured', 'danger');
      }
    } catch (err) {
      console.error(err);
    }
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

<PrintBalance data={data.balance} />

<div class="visible-content">
  <Table title="Balance Sheet" {headers} items={data.balance} {customEvents}>
    {#snippet sidebar()}
      <div class="dark flex w-25 flex-col gap-2">
        <Button corner="1" color="fuchsia" onclick={handleAllFilter}>All</Button>
        <Button corner="2" color="fuchsia" onclick={handlePendingFilter}>Pending</Button>
        <Button corner="3" color="fuchsia" onclick={handleNilFilter}>Nil</Button>
        <Button corner="P" onclick={handlePrint}>Print</Button>
        {#if data?.isAdmin}
          <Button color="danger" onclick={handleBulkReset}>Reset All</Button>
        {/if}
      </div>
    {/snippet}
  </Table>

  <!-- Helper Dialog -->
  <Model open={helperOpened} onClose={() => (helperOpened = false)}>
    <div class="min-w-md bg-white p-5">
      {#each availableOptions as o (o.key)}
        <div class="m-1 mb-2 flex items-center gap-2">
          <span class="inline-block flex-1 rounded-xs bg-gray-300 px-3 text-center">{o.key}</span>
          <span>=</span>
          <span class="flex-11">{o.description}</span>
        </div>
      {/each}
    </div>
  </Model>
</div>
