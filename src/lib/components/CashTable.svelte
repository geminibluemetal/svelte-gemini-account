<script>
  import { onMount } from 'svelte';

  const {
    title = '',
    income = [],
    expense = [],
    incomeHeader = [],
    expenseHeader = [],
    hideSerial = false,
    hideAction = false,
    bottomSpace = true,
    moveToEnd = true
  } = $props();

  let overRow = $state(-1);
  let container = $state(null);

  const headersGridColumnsWidth = $derived(
    [...incomeHeader, ...expenseHeader].reduce((acc, header) => {
      return header?.width ? `${acc}${header.width}px ` : `${acc}auto `;
    }, '')
  );

  const gridTemplate = $derived(
    `${hideSerial ? '' : '45px'} ${headersGridColumnsWidth} ${hideAction ? '' : '60px'}`
  );

  onMount(() => {
    if (moveToEnd) {
      container.scrollTop = container.scrollHeight;
    }
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
          <div
            class="border-b px-1 text-{header.align || 'left'}
              {expenseHeader.length - 1 == i
              ? 'border-gray-600 border-r-3'
              : 'border-gray-500 border-r'}"
          >
            {income[row]?.[header.key]}
          </div>
        {/each}
        {#each expenseHeader as header, i}
          <div
            class="border-b px-1 border-gray-500 text-{header.align || 'left'}
              {expenseHeader.length - 1 == i ? 'border-r-0' : 'border-r'}"
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
