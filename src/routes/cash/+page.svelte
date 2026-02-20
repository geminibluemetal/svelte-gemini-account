<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/Button.svelte';
  import CashTable from '$lib/components/CashTable.svelte';
  import DateNavigator from '$lib/components/DateNavigator.svelte';
  import Model from '$lib/components/Model.svelte';
  import NavigateButton from '$lib/components/NavigateButton.svelte';
  import { keyboardEventBus } from '$lib/core/client/eventBus.js';
  import { syncOff, syncOn } from '$lib/core/client/sseReceiver.js';
  import { commonDate } from '$lib/stores/common';
  import { parseDate, parseTime } from '$lib/utils/dateTimeParser.js';
  import { HighlightCell } from '$lib/utils/highlight.js';
  import { formatNumber } from '$lib/utils/number.js';
  import { onDestroy, onMount } from 'svelte';
  import CashForm from './CashForm.svelte';

  const { data } = $props();

  const a = {
    time: '02:30 AM',
    serial: 'OA-888',
    description: 'Stock yesterday',
    amount: '1888',
    sign: '1'
  };

  const incomeHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '85', display: 'time' },
    { name: 'Pointer', align: 'center', key: 'serial', width: '68' },
    { name: 'Description', align: 'left', key: 'description', width: '250', nowrap: true },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', color: SignColor, display: 'boolean' }
  ];

  const expenseHeader = [
    { name: 'Time', align: 'center', key: 'time', width: '85' },
    { name: 'Pointer', align: 'center', key: 'serial', width: '68' },
    { name: 'Description', align: 'left', key: 'description', width: '250', nowrap: true },
    { name: 'Amount', align: 'right', key: 'amount' },
    { name: 'Sign', align: 'center', key: '0' }
  ];

  const availableOptions = [
    { key: 'H', description: 'List available Shortcut' },
    { key: '0', description: 'Cash Entry both (income and expense)' },
    { key: '1', description: 'Previous Cash Report' },
    { key: '2', description: 'Next Cash Report' },
    { key: '3', description: 'Create New Cash Report' },
    { key: '4', description: 'Go to Delivery Sheet' },
    { key: '5', description: 'Open Current Cash Report' },
    { key: '6', description: 'Go to Order Book' },
    // { key: '7', description: 'Open Old Balance' },
    // { key: '8', description: 'Open Vehicle Summary' },
    { key: '🠈', description: 'Switch focus on Income and Expense' }, // 🠈	🠉	🠊	🠋
    { key: '🠊', description: 'Sign Cash Entry' },
    // { key: 'M', description: 'Mark Delivery Entry' },
    { key: 'E', description: 'Edit Cash Entry' },
    // { key: 'C', description: 'Clear Delivery Sheet' },
    // { key: 'R', description: 'Turn on Reconciliation & Review Mode' },
    { key: 'Enter', description: 'Edit Cash Entry' }
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableItem = $state();

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
    formOpened = false;
  }

  const sortedIncome = $derived(
    data.income.sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time);
    })
  );

  onMount(() => {
    keyboardEventBus.on('0', handleForm);
    keyboardEventBus.on('H', handleHelper);
    keyboardEventBus.on('4', gotoDeliverySheet);
    // keyboardEventBus.on('5', handleHelper);
    keyboardEventBus.on('6', gotoOrderBook);
    syncOn('CASH.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', handleForm);
    keyboardEventBus.off('H', handleHelper);
    keyboardEventBus.off('4', gotoDeliverySheet);
    // keyboardEventBus.off('5', handleHelper);
    keyboardEventBus.off('6', gotoOrderBook);
    syncOff('CASH.LIST');
  });
</script>

<CashTable
  title="Cash Report"
  income={sortedIncome}
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
        <NavigateButton class="focus:bg-amber-50" cornerLeft="1" cornerRight="2">
          <span>Report 1 </span>
        </NavigateButton>
      </div>
      <div class="flex gap-2 *:flex-1 dark">
        <Button color="fuchsia" corner="3">New</Button>
        <Button color="fuchsia">Delete</Button>
      </div>
      <div class="flex gap-2 *:flex-1 dark">
        <Button color="primary" corner="4">DS</Button>
        <Button color="fuchsia" corner="5">Current</Button>
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
