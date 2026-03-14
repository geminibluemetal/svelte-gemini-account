<script>
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import CashTable from '$lib/components/CashTable.svelte';
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
  import { resolve } from '$app/paths';
  import { getFormattedDate } from '$lib/utils/dateTime';
  import { updateParams } from '$lib/core/client/urlParams';
  import { page } from '$app/stores';

  const { data } = $props();

  const incomeHeader = [
    { name: 'Time', align: 'center', key: 'createdAt', width: '85', display: 'time' },
    { name: 'Reference', align: 'left', key: 'reference', width: '82', color: ReferanceColor },
    { name: 'Description', align: 'left', key: 'description', width: '250', nowrap: true },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', color: SignColor, display: 'sign' },
  ];

  const expenseHeader = [
    { name: 'Time', align: 'center', key: 'createdAt', width: '85', display: 'time' },
    { hide: true },
    { name: 'Description', align: 'left', key: 'description', width: '250', nowrap: true },
    { name: 'Amount', align: 'right', key: 'amount', display: 'currency' },
    { name: 'Sign', align: 'center', key: 'sign', color: SignColor, display: 'sign' },
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
    { key: '9', description: 'Open Tokens' },
    { key: '🠈', description: 'Switch focus on Income and Expense' }, // 🠈	🠉	🠊	🠋
    { key: '🠊', description: 'Sign Cash Entry' },
    { key: 'D', description: 'Delete Cash Entry' },
    { key: 'E', description: 'Edit Cash Entry' },
    { key: 'S', description: 'Enter stock amount' },
    // { key: 'R', description: 'Turn on Reconciliation & Review Mode' },
    { key: 'Enter', description: 'Edit Cash Entry' },
  ];

  let formOpened = $state(false);
  let helperOpened = $state(false);
  let editableItem = $state();
  // let reportIndex = $state(data.reports.length > 0 ? data.reports.length - 1 : 0);

  // Number Safe
  const num = (value) => Number(value) || 0;

  const totalIncome = $derived(data?.income?.reduce((sum, item) => sum + num(item?.amount), 0));
  const totalExpense = $derived(data?.expense?.reduce((sum, item) => sum + num(item?.amount), 0));
  const currentDate = $derived($page.url.searchParams.get('date') || getFormattedDate());
  const reportIndex = $derived(
    $page.url.searchParams.get('reportIndex')
      ? num($page.url.searchParams.get('reportIndex'))
      : data.reports.length - 1,
  );

  function SignColor(value) {
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

  // function handleFocusSwitch() {
  //   changeOverType(); // Calling client componet function
  // }

  function gotoDeliverySheet() {
    goto(resolve(`/delivery?date=${currentDate}`));
  }

  function gotoOrderBook() {
    goto(resolve(`/orders?date=${currentDate}`));
  }

  const gotoToken = () => goto(resolve(`/tokens?date=${currentDate}`));

  function handleFormClose() {
    editableItem = null;
    formOpened = false;
  }

  const sortedIncome = $derived(
    data.income.sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time);
    }),
  );

  const sortedExpense = $derived(
    data.expense.sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time);
    }),
  );

  function handleCashEdit(item) {
    formOpened = true;
    editableItem = item;
  }

  function handleCashSign(item) {
    if (item.reference) {
      showToast('Referance record can not sign here', 'danger');
      return;
    }
    transportAction('?/sign', { id: item.id });
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

  function gotoCurrentReport() {
    updateParams({ reportIndex: null, date: null });
  }

  function handleNextReport() {
    if (reportIndex < data.reports.length - 1) {
      updateParams({ reportIndex: reportIndex + 1 });
    }
  }

  function handlePreviousReport() {
    if (reportIndex > 0) {
      updateParams({ reportIndex: reportIndex - 1 });
    }
  }

  async function handleStockUpdate() {
    let stock = prompt('Stock Amount?');
    stock = Number(stock);
    if (stock) {
      const data = {
        entryType: 'INCOME',
        description: 'Stock',
        amount: stock,
      };
      const result = await transportAction('?/form', data);
      console.log(result);
    }
  }

  async function handleNewReport() {
    await transportAction('?/newReport');
    goto(resolve(window.location.pathname));
  }

  function handleDeleteReport() {
    if (!data.income.length && !data.expense.length) {
      if (data.reports[reportIndex]?.id === 'current') {
        transportAction('?/deleteReport', {
          id: data.reports[reportIndex - 1]?.id,
        });
      } else {
        transportAction('?/deleteReport', { id: data.reports[reportIndex]?.id });
      }
      goto(resolve(window.location.pathname));
    } else {
      showToast('Only empty reports can be deleted', 'danger');
    }
  }

  async function handleCashDelete(item) {
    if (item.reference) {
      showToast('Reference record can not delete here', 'danger');
      return;
    }
    const confirmed = confirm(
      `Are you sure to Delete? ${item.description} - ${formatNumber(item.amount)}`,
    );
    if (!confirmed) return;
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
    { key: 'D', handler: handleCashDelete },
  ];

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

  onMount(() => {
    keyboardEventBus.on('0', handleForm);
    keyboardEventBus.on('H', handleHelper);
    keyboardEventBus.on('1', handlePreviousReport);
    keyboardEventBus.on('2', handleNextReport);
    keyboardEventBus.on('4', gotoDeliverySheet);
    keyboardEventBus.on('5', gotoCurrentReport);
    keyboardEventBus.on('6', gotoOrderBook);
    keyboardEventBus.on('7', handleNewReport);
    keyboardEventBus.on('8', handleDeleteReport);
    keyboardEventBus.on('9', gotoToken);
    keyboardEventBus.on('S', handleStockUpdate);
    syncOn('CASH.LIST');
  });
  onDestroy(() => {
    keyboardEventBus.off('0', handleForm);
    keyboardEventBus.off('H', handleHelper);
    keyboardEventBus.off('1', handlePreviousReport);
    keyboardEventBus.off('2', handleNextReport);
    keyboardEventBus.off('4', gotoDeliverySheet);
    keyboardEventBus.off('5', gotoCurrentReport);
    keyboardEventBus.off('6', gotoOrderBook);
    keyboardEventBus.off('7', handleNewReport);
    keyboardEventBus.off('8', handleDeleteReport);
    keyboardEventBus.off('9', gotoToken);
    keyboardEventBus.off('S', handleStockUpdate);
    syncOff('CASH.LIST');
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
    <span class="p-1">{`Cash ${reportIndex + 1}`}</span>
  {/snippet}
  {#snippet sidebar()}
    <div class="flex w-48 flex-col gap-2">
      <div class="flex gap-2 *:flex-1">
        <NavigateButton
          class="focus:bg-amber-50"
          onNext={handleNextDate}
          onPrevious={handlePreviewsDate}
          onClick={handleTodayDate}
        >
          {currentDate}
        </NavigateButton>
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
            {`Cash ${reportIndex + 1}`}
          </span>
        </NavigateButton>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button color="fuchsia" corner="7" onclick={handleNewReport}>New</Button>
        <Button color="fuchsia" corner="8" onclick={handleDeleteReport}>Delete</Button>
      </div>
      <div class="dark flex gap-2 *:flex-1">
        <Button color="primary" corner="4" onclick={gotoDeliverySheet}>DS</Button>
        <Button color="fuchsia" corner="5" onclick={gotoCurrentReport}>Current</Button>
        <Button color="primary" corner="6" onclick={gotoOrderBook}>OB</Button>
      </div>
      <div class="flex gap-2 font-bold *:flex-1">
        <div class="border-2">
          <div class="flex">
            <div
              class="flex-1 border-b-2 border-b-white bg-black px-2 py-0.5 text-center text-white"
            >
              Total Summary
            </div>
          </div>
          <div class="flex">
            <div class="flex-3/7 border-b-2 border-b-white bg-black px-2 py-0.5 text-white">
              Income
            </div>
            <div class="flex-4/7 border-b-2 border-b-black px-2 text-right text-lg text-green-700">
              {formatNumber(totalIncome)}
            </div>
          </div>
          <div class="flex">
            <div class="flex-3/7 border-b-2 border-b-white bg-black px-2 py-0.5 text-white">
              Expense
            </div>
            <div class="flex-4/7 border-b-2 border-b-black px-2 text-right text-lg text-red-700">
              {formatNumber(totalExpense)}
            </div>
          </div>
          <div class="flex">
            <div class="flex-3/7 bg-black px-2 py-0.5 text-white">Balance</div>
            <div class="flex-4/7 px-2 text-right text-lg text-blue-700">
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
