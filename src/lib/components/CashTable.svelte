<script>
  import display from '$lib/core/client/display';
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
    sidebar = () => {},
    hideSerial = false,
    hideAction = false,
    bottomSpace = true,
    moveToEnd = true,
    left = () => {},
    right = () => {},
  } = $props();

  let overRow = $state(-1);
  let overType = $state('expense');
  let container = $state(null);
  let customHandlersMap = $state(new Map());

  const finance = $derived({ income, expense });

  const headersGridColumnsWidth = $derived(
    [...incomeHeader, ...expenseHeader].reduce((acc, header) => {
      return header?.width ? `${acc}${header.width}px ` : `${acc}auto `;
    }, ''),
  );

  const gridTemplate = $derived(
    `${hideSerial ? '' : '45px'} ${headersGridColumnsWidth} ${hideAction ? '' : '60px'}`,
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

  function changeOverType() {
    overType = overType == 'income' ? 'expense' : 'income';
  }

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
    keyboardEventBus.on('ArrowLeft', changeOverType);

    // Register custom events
    const handlersMap = new Map();
    customEvents.forEach(({ key, handler }) => {
      const wrappedHandler = () => {
        if (overRow >= 0 && overRow < finance[overType].length && doAction) {
          const data = finance[overType][overRow];
          data.entry_type = overType == 'income' ? 'INCOME' : 'EXPENSE';
          handler(data);
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
    keyboardEventBus.off('ArrowLeft', changeOverType);

    // Unregister custom events
    customHandlersMap.forEach((handler, key) => {
      keyboardEventBus.off(key, handler);
    });
    customHandlersMap.clear();
  });
</script>

<div class="flex h-screen flex-row gap-2 p-2">
  <div class="w-fit overflow-auto border-2 border-black" bind:this={container}>
    <div class="grid" style="grid-template-columns: {gridTemplate};">
      <div
        class="sticky top-0 col-span-10 flex border-b-2 border-white bg-red-700 text-center font-bold text-white"
      >
        <div class="flex flex-1 text-left">{@render left()}</div>
        <div class="flex-1 text-center">{title}</div>
        <div class="flex-1 text-right">{@render right()}</div>
      </div>

      <div
        class="sticky top-6.5 z-20 col-span-5 border-r-3 border-white bg-black px-1 text-center text-white"
      >
        Income
      </div>
      <div
        class="sticky top-6.5 z-20 col-span-5 border-r-0 border-white bg-black px-1 text-center text-white"
      >
        Expense
      </div>

      {#each incomeHeader as header, i}
        <div
          class="sticky top-12.5 z-20 bg-black text-white
          {incomeHeader.length - 1 == i ? 'border-r-3' : 'border-r-2'}
          border-t-2 border-white px-1 text-center"
        >
          {header.name}
        </div>
      {/each}
      {#each expenseHeader as header, i}
        {#if header?.hide}
          <div class="sticky top-12.5 z-20 w-0"></div>
        {:else}
          <div
            class="sticky top-12.5 z-20 bg-black text-white
            {expenseHeader.length - 1 == i ? 'border-r-0' : 'border-r-2'}
            border-t-2 border-white px-1 text-center"
          >
            {header.name}
          </div>
        {/if}
      {/each}

      {#each Array.from( { length: income.length > expense.length ? income.length : expense.length }, ) as _, row (row)}
        {#each incomeHeader as header, i}
          {@const color = header?.color
            ? header.color(income[row]?.[header.key], income[row])
            : null}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            title={income[row]?.[header.key]}
            class="border-b px-1 text-{header.align || 'left'}
            {header?.nowrap ? 'overflow-hidden text-ellipsis whitespace-nowrap' : ''}
              {color?.background
              ? color?.background
              : overRow == row && overType == 'income'
                ? 'bg-black/20'
                : ''}
              {incomeHeader.length - 1 == i
              ? 'border-r-3 border-gray-600'
              : 'border-r border-gray-500'}
              {color?.foreground || ''}"
            onmousemove={() => handleCellMouseMove(row, 'income')}
          >
            <!-- {income[row]?.[header.key]} -->
            {#if header?.display && header.display instanceof Function}
              {header.display(income[row]?.[header.key], income[row])}
            {:else if income[row]?.[header.key] != null && income[row]?.[header.key] !== '' && income[row]?.[header.key] !== 0 && income[row]?.[header.key] !== '0'}
              {#if header?.display}
                {display(header.display, income[row]?.[header.key])}
              {:else}
                {income[row]?.[header.key]}
              {/if}
            {/if}
          </div>
        {/each}
        {#each expenseHeader as header, i}
          {#if header?.hide}
            <div class="sticky top-12.5 z-20 w-0"></div>
          {:else}
            {@const color = header?.color
              ? header.color(expense[row]?.[header.key], expense[row])
              : null}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              title={expense[row]?.[header.key]}
              class="border-b border-gray-500 px-1 text-{header.align || 'left'}
              {header?.nowrap ? 'overflow-hidden text-ellipsis whitespace-nowrap' : ''}
              {color?.background
                ? color?.background
                : overRow == row && overType == 'expense'
                  ? 'bg-black/20'
                  : ''}
              {expenseHeader.length - 1 == i
                ? 'border-r-0 border-gray-600'
                : 'border-r border-gray-500'}
              {color?.foreground || ''}"
              onmousemove={() => handleCellMouseMove(row, 'expense')}
            >
              <!-- {expense[row]?.[header.key]} -->
              {#if header?.display && header.display instanceof Function}
                {header.display(expense[row]?.[header.key], expense[row])}
              {:else if expense[row]?.[header.key] != null && expense[row]?.[header.key] !== '' && expense[row]?.[header.key] !== 0 && expense[row]?.[header.key] !== '0'}
                {#if header?.display}
                  {display(header.display, expense[row]?.[header.key])}
                {:else}
                  {expense[row]?.[header.key]}
                {/if}
              {/if}
            </div>
          {/if}
        {/each}
      {/each}

      {#if bottomSpace}
        <div class="col-span-full h-[20dvh]"></div>
      {/if}
    </div>
  </div>

  {#if sidebar}
    {@render sidebar()}
  {/if}
</div>
