<script>
  import Table from '$lib/components/Table.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import Model from '$lib/components/Model.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver';
  import { HighlightCell } from '$lib/utils/highlight.js';
  import AdjustmentForm from './AdjustmentForm.svelte';
  import StatementForm from './StatementForm.svelte';

  const { data } = $props();

  const debitColor = (value) => (value ? { ...HighlightCell.red, background: '' } : null);
  const creditColor = (value) => (value ? { ...HighlightCell.green, background: '' } : null);
  const balanceColor = (value) => (value ? { ...HighlightCell.blue, background: '' } : null);

  const headers = [
    { name: 'Date', align: 'center', key: 'createdAt', width: 100, display: 'date' },
    { name: 'Time', align: 'center', key: 'createdAt', width: 80, display: 'time' },
    { name: 'Vehicle', align: 'left', key: 'vehicle', width: 70 },
    { name: 'Address', align: 'left', key: 'address', width: 230 },
    { name: 'Item', align: 'left', key: 'item' },
    { name: 'Qty', key: 'qty', align: 'right', width: 60, display: 'decimal' },
    {
      name: 'Debit',
      align: 'right',
      key: 'debit',
      width: 110,
      display: 'currency',
      color: debitColor,
    },
    { name: 'AT', key: 'amountType', align: 'center', width: 100, color: AmountTypeColor },
    {
      name: 'Credit',
      align: 'right',
      key: 'credit',
      width: 110,
      display: 'currency',
      color: creditColor,
    },
    {
      name: 'Balance',
      align: 'right',
      key: 'runningBalance',
      width: 110,
      display: 'currency',
      color: balanceColor,
    },
    {
      name: 'Sign',
      align: 'center',
      key: 'sign',
      display: 'sign',
      color: SignColor,
    },
  ];

  let adjustFormOpened = $state(false);
  let statementFormOpened = $state(false);
  let editableItem = $state(null);

  const openingBalance = {
    createdAt: data.party.updatedAt,
    runningBalance: data.party.openingBalance,
    amountType: 'Open Bal',
  };

  const statementItem = $derived(
    data.party.openingBalance ? [openingBalance, ...data.statement] : data.statement,
  );

  function AmountTypeColor(value) {
    switch (value) {
      case 'Bunk':
        return HighlightCell.purple;
      case 'AC':
        return HighlightCell.yellow;
      case 'CP':
        return HighlightCell.green;
      case 'Paytm':
        return HighlightCell.red;
      case 'Gpay':
        return HighlightCell.blue;
      case 'Bunk Cash':
        return HighlightCell.green;
      case 'Bunk Ac':
        return HighlightCell.yellow;
      case 'Gemini Ac':
        return HighlightCell.yellow;
      case 'Cash':
        return HighlightCell.green;
      case 'Cheque':
        return HighlightCell.purple;
      case 'Open Bal':
        return HighlightCell.gray;
      case 'Discount':
      case 'Roundoff':
      case 'Tip Adjust':
      case 'Other':
        return HighlightCell.black;
    }
  }

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: 'R', description: 'Reset Balance' },
    { key: 'N', description: 'Nil Balance' },
    { key: '0', description: 'Add Adjustment (Discount, Roundoff)' },
    { key: 'Enter', description: 'Edit statement' },
    { key: 'Back', description: 'Return to Balance Sheet' },
  ];

  let helperOpened = $state(false);

  function SignColor(value) {
    return value == 1 ? HighlightCell.green : null;
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

  function toggleHelper() {
    helperOpened = !helperOpened;
  }

  function gotoBalanceSheet() {
    history.back();
  }

  function handleBalanceReset() {
    const isConfirmed = confirm(`Reset Balance For ${data.party?.name}`);
    if (isConfirmed) transportAction(`?/balanceReset`, { id: data.party?.id });
  }

  function handleBalanceNil() {
    const isConfirmed = confirm(`Nil Balance for ${data.party?.name}`);
    if (isConfirmed) transportAction(`?/balanceNil`, { id: data.party?.id });
  }

  function handleAdjustmentForm() {
    adjustFormOpened = !adjustFormOpened;
  }

  function handleStatementForm(item) {
    statementFormOpened = !statementFormOpened;
    editableItem = statementFormOpened ? item : null;
  }

  const customEvents = [
    { key: '0', handler: handleAdjustmentForm },
    { key: 'Enter', handler: handleStatementForm },
  ];

  onMount(() => {
    keyboardEventBus.on('R', handleBalanceReset);
    keyboardEventBus.on('N', handleBalanceNil);
    keyboardEventBus.on('H', toggleHelper);
    keyboardEventBus.on('Backspace', gotoBalanceSheet);
    syncOn('BALANCE.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('R', handleBalanceReset);
    keyboardEventBus.off('N', handleBalanceNil);
    keyboardEventBus.off('H', toggleHelper);
    keyboardEventBus.off('Backspace', gotoBalanceSheet);
    syncOff('BALANCE.LIST');
  });
</script>

<Table title={data.party?.name} {headers} items={statementItem} {customEvents} />

<AdjustmentForm open={adjustFormOpened} onClose={handleAdjustmentForm} partyId={data.party?.id} />
<StatementForm open={statementFormOpened} onClose={handleStatementForm} item={editableItem} />

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
