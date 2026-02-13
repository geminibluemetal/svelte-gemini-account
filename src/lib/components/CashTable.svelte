<script>
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import { onDestroy, onMount } from 'svelte';

  const {
    title = '',
    income = [],
    expense = [],
    incomeHeader = [],
    expenseHeader = [],
    customEvents = [],
    doAction = true,
    hideSerial = false,
    hideAction = false,
    bottomSpace = true,
    moveToEnd = true
  } = $props();

  let overRow = $state(-1);
  let overType = $state('expense');
  let container = $state(null);
  let customHandlersMap = $state(new Map());

  const finance = $derived({ income, expense });

  const headersGridColumnsWidth = $derived(
    [...incomeHeader, ...expenseHeader].reduce((acc, header) => {
      return header?.width ? `${acc}${header.width}px ` : `${acc}auto `;
    }, '')
  );

  const gridTemplate = $derived(
    `${hideSerial ? '' : '45px'} ${headersGridColumnsWidth} ${hideAction ? '' : '60px'}`
  );

  function handleCellMouseMove(row, type) {
    overRow = row;
    overType = type;
  }

  // onMount(() => {
  //   if (moveToEnd) {
  //     container.scrollTop = container.scrollHeight;
  //   }
  // });

  // Navigation functions
  const rowUp = () => (doAction ? (overRow = overRow - 1 >= 0 ? overRow - 1 : overRow) : null);
  const rowDown = () =>
    doAction
      ? (overRow = overRow + 1 <= finance[overType].length - 1 ? overRow + 1 : overRow)
      : null;
  const gotoTop = () => (doAction ? (overRow = 0) : null);
  const gotoBottom = () => (doAction ? (overRow = finance[overType].length - 1) : null);
  const jump20Top = () =>
    doAction ? (overRow = overRow - 20 >= 0 ? overRow - 20 : overRow) : null;
  const jump20Bottom = () =>
    doAction
      ? (overRow = overRow + 20 <= finance[overType].length - 1 ? overRow + 20 : overRow)
      : null;

  onMount(() => {
    if (moveToEnd) {
      container.scrollTop = container.scrollHeight;
    }

    // Register navigation events
    keyboardEventBus.on('ArrowUp', rowUp);
    keyboardEventBus.on('ArrowDown', rowDown);
    keyboardEventBus.on('Home', gotoTop);
    keyboardEventBus.on('End', gotoBottom);
    keyboardEventBus.on('PageUp', jump20Top);
    keyboardEventBus.on('PageDown', jump20Bottom);

    // Register custom events
    const handlersMap = new Map();
    customEvents.forEach(({ key, handler }) => {
      const wrappedHandler = () => {
        if (overRow >= 0 && overRow < items.length && doAction) {
          handler(items[overRow]);
        }
      };

      handlersMap.set(key, wrappedHandler);
      keyboardEventBus.on(key, wrappedHandler);
    });

    customHandlersMap = handlersMap;
  });

  onDestroy(() => {
    // Unregister navigation events
    keyboardEventBus.off('ArrowUp', rowUp);
    keyboardEventBus.off('ArrowDown', rowDown);
    keyboardEventBus.off('Home', gotoTop);
    keyboardEventBus.off('End', gotoBottom);
    keyboardEventBus.off('PageUp', jump20Top);
    keyboardEventBus.off('PageDown', jump20Bottom);

    // Unregister custom events
    customHandlersMap.forEach((handler, key) => {
      keyboardEventBus.off(key, handler);
    });
    customHandlersMap.clear();
  });
</script>

<div class="p-2 h-screen flex flex-col">
  <div class="flex-1 overflow-auto border-2 border-black w-fit" bind:this={container}>
    <div class="grid" style="grid-template-columns: {gridTemplate};">
      <div
        class="col-span-10 bg-red-700 text-white text-center font-bold border-b-2 border-white sticky top-0"
      >
        {title}
      </div>

      <div
        class="col-span-5 sticky top-6.5 z-20 bg-black text-white border-r-3 border-white text-center px-1"
      >
        Income
      </div>
      <div
        class="col-span-5 sticky top-6.5 z-20 bg-black text-white border-r-0 border-white text-center px-1"
      >
        Expense
      </div>

      {#each incomeHeader as header, i}
        <div
          class="sticky top-12.5 z-20 bg-black text-white
          {incomeHeader.length - 1 == i ? 'border-r-3' : 'border-r-2'}
          border-white text-center px-1 border-t-2"
        >
          {header.name}
        </div>
      {/each}
      {#each expenseHeader as header, i}
        <div
          class="sticky top-12.5 z-20 bg-black text-white
            {expenseHeader.length - 1 == i ? 'border-r-0' : 'border-r-2'}
            border-white text-center px-1 border-t-2"
        >
          {header.name}
        </div>
      {/each}

      {#each Array.from( { length: income.length > expense.length ? income.length : expense.length } ) as _, row (row)}
        {#each incomeHeader as header, i}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="border-b px-1 text-{header.align || 'left'}
              {overRow == row && overType == 'income' ? 'bg-black/20' : ''}
              {expenseHeader.length - 1 == i
              ? 'border-gray-600 border-r-3'
              : 'border-gray-500 border-r'}"
            onmousemove={() => handleCellMouseMove(row, 'income')}
          >
            {income[row]?.[header.key]}
          </div>
        {/each}
        {#each expenseHeader as header, i}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="border-b px-1 border-gray-500 text-{header.align || 'left'}
              {overRow == row && overType == 'expense' ? 'bg-black/20' : ''}
              {expenseHeader.length - 1 == i ? 'border-r-0' : 'border-r'}"
            onmousemove={() => handleCellMouseMove(row, 'expense')}
          >
            {expense[row]?.[header.key]}
          </div>
        {/each}
      {/each}

      {#if bottomSpace}
        <div class="col-span-full h-[20dvh]"></div>
      {/if}
    </div>
  </div>
</div>

<!-- {overRow == row ? 'bg-black/20' : rowColor?.background}" -->
<!-- onmousemove={() => (overRow = row)} -->
