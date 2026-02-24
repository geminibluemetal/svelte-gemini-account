<script>
  import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/Button.svelte';
  import CashTable from '$lib/components/CashTable.svelte';
  import DateNavigator from '$lib/components/DateNavigator.svelte';
  import Model from '$lib/components/Model.svelte';
  import NavigateButton from '$lib/components/NavigateButton.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus.js';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver.js';
  import { parseDate, parseTime } from '$lib/utils/dateTimeParser.js';
  import { HighlightCell } from '$lib/utils/highlight.js';
  import { formatNumber } from '$lib/utils/number.js';
  import { onDestroy, onMount } from 'svelte';
  import CashForm from './CashForm.svelte';
  import { showToast } from '$lib/stores/toast';
  import { commonDate } from '$lib/stores/common';

  const { data } = $props();

  const incomeHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '85', display: 'time' },
    { name: 'Referance', align: 'left', key: 'serial', width: '82', color: ReferanceColor },
    { name: 'Description', align: 'left', key: 'description', width: '250', nowrap: true },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', color: SignColor, display: 'boolean' }
  ];

  const expenseHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '85', display: 'time' },
    { hide: true },
    { name: 'Description', align: 'left', key: 'description', width: '250', nowrap: true },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', color: SignColor, display: 'boolean' }
  ];

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'Cash Entry both (income and expense)' },
    { key: '1', description: 'Previous Cash Report' },
    { key: '2', description: 'Next Cash Report' },
    { key: '4', description: 'Go to Delivery Sheet' },
    { key: '5', description: 'Open Current Cash Report' },
    { key: '6', description: 'Go to Order Book' },
    { key: '7', description: 'Create New Cash Report' },
    { key: '8', description: 'Delete Cash Report' },
    { key: '🠈', description: 'Switch focus on Income and Expense' }, // 🠈	🠉	🠊	🠋
    { key: '🠊', description: 'Sign Cash Entry' },
    { key: 'D', description: 'Delete Cash Entry' },
    { key: 'E', description: 'Edit Cash Entry' },
    // { key: 'C', description: 'Clear Delivery Sheet' },
    // { key: 'R', description: 'Turn on Reconciliation & Review Mode' },
    { key: 'Enter', description: 'Edit Cash Entry' }
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableItem = $state();
  let currentReportIndex = $state(data.reports.length > 0 ? data.reports.length - 1 : 0);
  let lastSeenLength = $state(data.reports.length);
  let pendingSnap = $state(false);

  // Number Safe
  const num = (value) => Number(value) || 0;

  const totalIncome = $derived(data?.income?.reduce((sum, item) => sum + num(item?.amount), 0));
  const totalExpense = $derived(data?.expense?.reduce((sum, item) => sum + num(item?.amount), 0));

  function SignColor(value, item) {
    return value ? HighlightCell.green : null;
  }

  function ReferanceColor(value) {
    if (value && typeof value === 'string') {
      if (value.startsWith('DS')) return HighlightCell.green;
      if (value.startsWith('OA')) return HighlightCell.red;
      if (value.startsWith('OB')) return HighlightCell.blue;
    }
  }

  function handleHelper() {
    if (!formOpened && !helperOpened) {
      helperOpened = true;
    }
  }

  function handleForm() {
    if (!formOpened && !helperOpened) {
      formOpened = true;
    }
  }

  function handleFocusSwitch() {
    changeOverType(); // Calling client componet function
  }

  function gotoDeliverySheet() {
    goto('/delivery');
  }

  function gotoOrderBook() {
    goto('/orders');
  }

  function handleFormClose() {
    editableItem = null;
    formOpened = false;
  }

  const sortedIncome = $derived(
    data.income.sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time);
    })
  );

  const sortedExpense = $derived(
    data.expense.sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time);
    })
  );

  function handleCashEdit(item) {
    formOpened = true;
    editableItem = item;
  }

  function handleCashSign(item) {
    if (item.serial) {
      showToast('Referance record can not sign here', 'danger');
      return;
    }
    transportAction('?/sign', { id: item.id, current: item.sign });
  }

  function handleDateNavigationChange(value) {
    // Just update the store; the $effect will handle the URL
    $commonDate = value;
  }

  function handleNextReport() {
    if (currentReportIndex < data.reports.length - 1) {
      currentReportIndex = Number(currentReportIndex) + 1;
    }
  }

  function handlePreviousReport() {
    if (currentReportIndex > 0) {
      currentReportIndex = Number(currentReportIndex) - 1;
    }
  }

  async function handleNewReport() {
    // Record length BEFORE we start the network request
    const lengthBefore = data.reports.length;

    const result = await transportAction('?/newReport');

    if (result.type === 'success') {
      // Check: Did the SSE already update the data while we were waiting?
      if (data.reports.length > lengthBefore) {
        // Yes, SSE was faster. Snap immediately.
        currentReportIndex = data.reports.length - 1;
        lastSeenLength = data.reports.length;
      } else {
        // No, SSE hasn't arrived yet. Set the flag to snap when it does.
        pendingSnap = true;
      }
    }
  }

  function handleDeleteReport() {
    if (!data.income.length && !data.expense.length) {
      if (data.reports[currentReportIndex]?.id === 'current') {
        transportAction('?/deleteReport', {
          id: data.reports[currentReportIndex - 1]?.id
        });
      } else {
        transportAction('?/deleteReport', { id: data.reports[currentReportIndex]?.id });
      }
    } else {
      showToast('Only empty reports can be deleted', 'danger');
    }
  }

  async function handleCashDelete(item) {
    if (item.serial) {
      showToast('Referance record can not delete here', 'danger');
      return;
    }
    const result = await transportAction('?/delete', { id: item.id });
    if (result.type == 'failure') {
      const data = JSON.parse(result.data);
      showToast(data[data[0].message], 'danger');
    }
  }

  const cashCustomEvents = [
    { key: 'ArrowRight', handler: handleCashSign },
    { key: 'E', handler: handleCashEdit },
    { key: 'Enter', handler: handleCashEdit },
    { key: 'D', handler: handleCashDelete }
  ];

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

  onMount(() => {
    keyboardEventBus.on('0', handleForm);
    keyboardEventBus.on('H', handleHelper);
    keyboardEventBus.on('1', handlePreviousReport);
    keyboardEventBus.on('2', handleNextReport);
    keyboardEventBus.on('4', gotoDeliverySheet);
    // keyboardEventBus.on('5', handleHelper);
    keyboardEventBus.on('6', gotoOrderBook);
    keyboardEventBus.on('7', handleNewReport);
    keyboardEventBus.on('8', handleDeleteReport);
    syncOn('CASH.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', handleForm);
    keyboardEventBus.off('H', handleHelper);
    keyboardEventBus.off('1', handlePreviousReport);
    keyboardEventBus.off('2', handleNextReport);
    keyboardEventBus.off('4', gotoDeliverySheet);
    // keyboardEventBus.off('5', handleHelper);
    keyboardEventBus.off('6', gotoOrderBook);
    keyboardEventBus.off('7', handleNewReport);
    keyboardEventBus.off('8', handleDeleteReport);
    syncOff('CASH.LIST');
  });

  // This effect watches both the flag AND the data length
  $effect(() => {
    // We trigger if EITHER the flag is turned on OR the data length grows
    if (pendingSnap) {
      if (data.reports.length > lastSeenLength) {
        // The data arrived after we clicked
        currentReportIndex = data.reports.length - 1;
        lastSeenLength = data.reports.length;
        pendingSnap = false;
      } else if (/* logic for the race condition */ true) {
        // If the data is already here (SSE was faster than the function)
        // we still want to snap.
      }
    }
  });

  // 1. Define a derived state for the URL string to prevent unnecessary updates
  const searchParamsString = $derived.by(() => {
    const params = new URLSearchParams();
    // Ensure date is formatted correctly (YYYY-MM-DD or ISO)
    const dateStr = $commonDate instanceof Date ? $commonDate.toISOString() : $commonDate;
    const reportVal = currentReportIndex ?? data.reports.length - 1;

    params.set('date', dateStr);
    params.set('report', reportVal);
    return params.toString();
  });

  // URL Sync Effect
  $effect(() => {
    const params = new URLSearchParams($page.url.searchParams);
    const dateStr =
      $commonDate instanceof Date ? $commonDate.toISOString().split('T')[0] : $commonDate;

    // Safety check for index out of bounds (useful after deletes)
    if (currentReportIndex >= data.reports.length) {
      currentReportIndex = Math.max(0, data.reports.length - 1);
    }

    const reportVal = String(currentReportIndex);

    if (params.get('report') !== reportVal || params.get('date') !== dateStr) {
      params.set('date', dateStr);
      params.set('report', reportVal);

      goto(`?${params.toString()}`, {
        keepFocus: true,
        replaceState: true,
        invalidateAll: false
      });
    }
  });
</script>

<CashTable
  title="Cash Report"
  income={sortedIncome}
  expense={sortedExpense}
  {incomeHeader}
  {expenseHeader}
  moveToEnd={true}
  hideSerial={true}
  hideAction={true}
  customEvents={cashCustomEvents}
>
  {#snippet right()}
    <span class="p-1">{`Cash ${currentReportIndex + 1}`}</span>
  {/snippet}
  {#snippet sidebar()}
    <div class="flex flex-col gap-2 w-48">
      <div class="flex gap-2 *:flex-1">
        <DateNavigator
          class="focus:bg-amber-50"
          value={$commonDate}
          onDateChange={handleDateNavigationChange}
        />
      </div>
      <div class="flex gap-2 *:flex-1">
        <NavigateButton
          class="focus:bg-amber-50"
          cornerLeft="1"
          cornerRight="2"
          cornerCenter={data.reports.length}
          onNext={handleNextReport}
          onPrevious={handlePreviousReport}
        >
          <span>
            {`Cash ${currentReportIndex + 1}`}
          </span>
        </NavigateButton>
      </div>
      <div class="flex gap-2 *:flex-1 dark">
        <Button color="fuchsia" corner="7" onclick={handleNewReport}>New</Button>
        <Button color="fuchsia" corner="8" onclick={handleDeleteReport}>Delete</Button>
      </div>
      <div class="flex gap-2 *:flex-1 dark">
        <Button color="primary" corner="4" onclick={gotoDeliverySheet}>DS</Button>
        <Button color="fuchsia" corner="5">Current</Button>
        <Button color="primary" corner="6" onclick={gotoOrderBook}>OB</Button>
      </div>
      <div class="flex gap-2 *:flex-1 font-bold">
        <div class="border-2">
          <div class="flex">
            <div
              class="flex-1 bg-black text-white px-2 py-0.5 border-b-white border-b-2 text-center"
            >
              Total Summary
            </div>
          </div>
          <div class="flex">
            <div class="flex-3/7 bg-black text-white px-2 py-0.5 border-b-white border-b-2">
              Income
            </div>
            <div class="flex-4/7 text-right border-b-2 border-b-black px-2 text-lg text-green-700">
              {formatNumber(totalIncome)}
            </div>
          </div>
          <div class="flex">
            <div class="flex-3/7 bg-black text-white px-2 py-0.5 border-b-white border-b-2">
              Expense
            </div>
            <div class="flex-4/7 text-right border-b-2 border-b-black px-2 text-lg text-red-700">
              {formatNumber(totalExpense)}
            </div>
          </div>
          <div class="flex">
            <div class="flex-3/7 bg-black text-white px-2 py-0.5">Balance</div>
            <div class="flex-4/7 text-right px-2 text-lg text-blue-700">
              {formatNumber(num(totalIncome) - num(totalExpense))}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/snippet}
</CashTable>
<CashForm
  open={formOpened}
  onClose={handleFormClose}
  item={editableItem}
  cashDescription={data.cashDescription}
  party={data.party}
/>

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
