<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/Button.svelte';
  import CashTable from '$lib/components/CashTable.svelte';
  import DateNavigator from '$lib/components/DateNavigator.svelte';
  import NavigateButton from '$lib/components/NavigateButton.svelte';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver.js';
  import { commonDate } from '$lib/stores/common';
  import { HighlightCell } from '$lib/utils/highlight.js';
  import { formatNumber } from '$lib/utils/number.js';
  import { onDestroy, onMount } from 'svelte';

  const { data } = $props();

  const a = {
    time: '02:30 AM',
    serial: '12',
    description: 'Stock yesterday',
    amount: '1888',
    sign: '0'
  };

  const incomeHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '85', display: 'time' },
    { name: 'SN', align: 'center', key: 'serial', width: '35' },
    { name: 'Description', align: 'left', key: 'description', width: '250' },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', color: SignColor, display: 'boolean' }
  ];

  const expenseHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '85' },
    { name: 'SN', align: 'center', key: 'serial', width: '35' },
    { name: 'Description', align: 'left', key: 'description', width: '250' },
    { name: 'Amount', align: 'right', key: 'amount' },
    { name: 'Sign', align: 'center', key: '0' }
  ];

  // const income = Array.from({ length: 10 }).map((_) => a);
  const expense = Array.from({ length: 10 }).map((_) => a);

  // Number Safe
  const num = (value) => Number(value) || 0;

  const totalIncome = $derived(data?.income?.reduce((sum, item) => sum + num(item?.amount), 0));
  const totalExpense = $derived(expense?.reduce((sum, item) => sum + num(item?.amount), 0));

  function SignColor(value) {
    return value ? HighlightCell.green : null;
  }

  function handleDateNavigationChange(value) {
    // 1. Calculate the ISO strings for a stable comparison
    const newDateStr = value.toISOString();
    const urlDateStr = $page.url.searchParams.get('date');

    // 2. Only proceed if the date has actually changed
    if (newDateStr !== urlDateStr) {
      $commonDate = value; // Update store

      // 3. Use { keepFocus: true, replaceState: true } to prevent
      // unnecessary scroll jumps or history bloating
      goto(`?date=${newDateStr}`, { keepFocus: true, replaceState: true });
    }
  }

  onMount(() => {
    // keyboardEventBus.on('0', toggleOpenForm);
    // keyboardEventBus.on('H', toggleHelper);
    syncOn('CASH.LIST');
  });
  onDestroy(() => {
    // keyboardEventBus.off('0', toggleOpenForm);
    // keyboardEventBus.off('H', toggleHelper);
    syncOff('CASH.LIST');
  });
</script>

<CashTable
  title="Cash Report"
  income={data.income}
  {expense}
  {incomeHeader}
  {expenseHeader}
  moveToEnd={true}
  hideSerial={true}
  hideAction={true}
>
  {#snippet right()}
    <span class="p-1">Report 1</span>
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
        <NavigateButton class="focus:bg-amber-50">
          <span>Report 1 </span>
        </NavigateButton>
      </div>
      <div class="flex gap-2 *:flex-1 dark">
        <Button color="fuchsia" corner="3">New</Button>
        <Button color="fuchsia">Delete</Button>
      </div>
      <div class="flex gap-2 *:flex-1 dark">
        <Button color="fuchsia" corner="4">Current</Button>
        <Button color="primary" corner="5">CR</Button>
        <Button color="primary" corner="6">OB</Button>
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
