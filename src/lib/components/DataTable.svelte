<script>
  import { Check, CirclePlus, Funnel, IdCard, Pencil, Search, Table, X } from 'lucide-svelte';
  import Button from './Button.svelte';
  import IconButton from './Button.svelte';
  import Badge from './Badge.svelte';
  import Pagination from './Pagination.svelte';
  import Popover from './Popover.svelte';
  import InputField from './InputField.svelte';
  import { keyboardEventBus } from '$lib/utils/eventBus';
  import FilterModel from './FilterModel.svelte';
  import { timeAgoSmart } from '$lib/utils/relativeTime';
  import { getFormattedTimeStamp } from '$lib/utils/dateTime';
  import Tooltip from './Tooltip.svelte';

  let { items, headers, total, showed, title, openForm, closeForm } = $props();

  const options = $state({ page: 1 });
  let showSearchBar = $state(false);
  let showTable = $state(true);
  let openFilter = $state(false);
  let now = $state(new Date());

  function toggleSearchBar(type = null) {
    showSearchBar = type == null ? !showSearchBar : type;
  }

  function toggleTable(_, type = null) {
    showTable = type == null ? !showTable : type;
  }

  const handleOpenFilter = () => (openFilter = true);
  const handleCloseFilter = () => (openFilter = false);

  $effect(() => {
    const timeSync = setInterval(() => {
      now = new Date();
    }, 1000);

    return () => clearInterval(timeSync);
  });

  $effect(() => {
    keyboardEventBus.on('7', toggleTable);
    keyboardEventBus.on('8', toggleSearchBar);
    keyboardEventBus.on('Alt+F', toggleSearchBar);
    keyboardEventBus.on('9', handleOpenFilter);
    keyboardEventBus.on('0', openForm);
    keyboardEventBus.on('Alt+N', openForm);
    return () => {
      keyboardEventBus.off('7', toggleTable);
      keyboardEventBus.off('8', toggleSearchBar);
      keyboardEventBus.off('Alt+F', toggleSearchBar);
      keyboardEventBus.off('9', handleOpenFilter);
      keyboardEventBus.off('0', openForm);
      keyboardEventBus.on('Alt+N', openForm);
    };
  });
</script>

<div class="h-full font-semibold">
  <div
    class="max-w-11/12 mx-auto bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-xl shadow-xl h-[94dvh] mt-[3dvh] flex flex-col overflow-hidden"
  >
    <!-- Header -->
    <div
      class="sticky top-0 z-20 bg-amber-100/80 dark:bg-amber-950/60 backdrop-blur p-3 flex items-center border-b border-amber-200 dark:border-amber-900"
    >
      <!-- Header Left -->
      <div class="flex-1 flex items-center gap-2">
        <h1 class="text-3xl font-bold tracking-tight text-amber-950 dark:text-amber-50">
          {title || '[No Title]'}
        </h1>
      </div>

      <!-- Header Center -->
      <div class="flex-1 flex items-center gap-2 justify-center"></div>

      <!-- Header Right -->
      <div class="flex-1 flex justify-end gap-2 items-center">
        <!-- <IconButton onclick={toggleTable}>
          {#if showTable}
            <IdCard />
          {:else}
            <Table />
          {/if}
        </IconButton> -->

        <!-- Search Popover -->
        <!-- <Popover
          size="md"
          radius="md"
          position="bottom-center"
          triggerAction="manual"
          popoverClass="w-58"
          show={showSearchBar}
          onClose={() => (showSearchBar = false)}
        >
          {#snippet trigger()}
            <Button onclick={() => (showSearchBar = !showSearchBar)}>
              <Search />
            </Button>
          {/snippet}
          <InputField placeholder="Search..." prefix={Search} />
        </Popover> -->

        <!-- Filter Popover -->
        <!-- <FilterModel open={openFilter} onOpen={handleOpenFilter} onClose={handleCloseFilter}>
          <IconButton><Funnel /></IconButton>
        </FilterModel> -->

        <Button prefix={CirclePlus} color="success" onclick={openForm}>New Entry</Button>
      </div>
    </div>

    <!--  -->
    <!--  -->
    <!-- Body -->
    <!-- Body Start -->
    <div class="p-3 flex-1 overflow-hidden">
      <div
        class="h-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900"
      >
        <table class="w-full">
          <thead
            class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
          >
            <tr class="text-left">
              <th class="px-3 py-1.5 font-semibold">S.No</th>
              {#each headers as header}
                <th class="px-3 py-1.5 font-semibold {`text-${header.align || 'left'}`}">
                  {header.name}
                </th>
              {/each}
              <th class="px-3 py-1.5 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {#each items as item, i}
              <tr
                class="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-900 dark:even:bg-gray-800
                       hover:bg-amber-100 dark:hover:bg-amber-600/30
                        not-last:border-b border-gray-200 dark:border-gray-700"
              >
                <td class="px-2.5 py-1.5 font-medium">{i + 1}</td>
                {#each headers as header}
                  <td class="px-2.5 py-1.5 {`text-${header.align || 'left'}`}">
                    {@render tableCell(header, item)}
                  </td>
                {/each}
                <td class="px-2.5 py-1.5 text-center">
                  <a
                    href={`?editId=${item._id}&openForm=true`}
                    class="size-6 rounded-full bg-amber-600 text-white
                    inline-flex items-center justify-center
                    outline-offset-1
                    focus-visible:outline-2
                    hover:outline-2 cursor-pointer
                    hover:outline-amber-600
                    focus-visible:outline-amber-600"
                  >
                    <span class="leading-none"> <Pencil size="15" strokeWidth="3" /> </span>
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    <!-- Body End -->
    <!--  -->
    <!--  -->

    <!-- Footer -->
    <div
      class="bg-amber-100/80 dark:bg-amber-950/60 p-2 flex items-center border-t border-amber-200 dark:border-amber-900"
    >
      <!-- Footer Left -->
      <div class="flex-1 text-gray-600 dark:text-gray-400">
        <!-- <Button>View</Button> -->
      </div>

      <!-- Footer Center -->
      <div class="flex-1 text-gray-600 dark:text-gray-400 flex justify-center">
        <!-- <Pagination bind:page={options.page} totalItems={showed} /> -->
      </div>

      <!-- Footer Right -->
      <div class="flex-1 flex justify-end gap-2">
        {#if total}
          <Badge>Total: {total}</Badge>
        {/if}
        {#if total != showed && showed}
          <Badge>Showed: {showed}</Badge>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Render Table Cell -->
{#snippet tableCell(header, item)}
  {@const value = item[header.valuePath]}
  {#if typeof value == 'boolean'}
    <!-- Boolean Fields -->
    <span class="flex items-center justify-center {value ? 'text-green-500' : 'text-red-500'}">
      <span class="inline-block border-2 rounded-full mr-1">
        {#if value}
          <Check size="15" strokeWidth="3" />
        {:else}
          <X size="15" strokeWidth="3" />
        {/if}
      </span>
      {value ? 'Yes' : 'No'}
    </span>
  {:else if !value}
    <!-- FallBack For Empty Value -->
    <span class="text-gray-500 inline-block w-full">-</span>
  {:else if header.valuePath == 'createdBy'}
    {@const createdAt = item['createdAt']}
    <!-- CreatedBy Fields -->
    <Tooltip position="auto">
      {#snippet tip()}
        <div class="flex flex-col gap-1 px-3 py-2 text-sm items-start">
          <span>{item.createrName}</span>
          <span>{timeAgoSmart(createdAt, now)}</span>
          <span>{getFormattedTimeStamp(createdAt)}</span>
        </div>
      {/snippet}
      <div class="flex flex-col">
        <div class="text-[14px] -mt-1 p-0">{item.createrName}</div>
        <div class="text-[10px] -mt-1 p-0">
          {timeAgoSmart(createdAt, now)}
        </div>
      </div>
    </Tooltip>
  {:else if header.valuePath == 'updatedBy'}
    {@const updatedAt = item['updatedAt']}
    <!-- UpdatedBy Fields -->
    <Tooltip position="auto">
      {#snippet tip()}
        <div class="flex flex-col gap-1 px-3 py-2 text-sm items-start">
          <span>{item.updaterName}</span>
          <span>{timeAgoSmart(updatedAt, now)}</span>
          <span>{getFormattedTimeStamp(updatedAt)}</span>
        </div>
      {/snippet}
      <div class="flex flex-col">
        <div class="text-[14px] -mt-1 p-0">{item.updaterName}</div>
        <div class="text-[10px] -mt-1 p-0">
          {timeAgoSmart(updatedAt, now)}
        </div>
      </div>
    </Tooltip>
  {:else if header.display == 'datetime'}
    <!-- Date Time Fields -->
    <span title={getFormattedTimeStamp(value)}>
      {timeAgoSmart(value, now)}
    </span>
  {:else}
    <!-- Fallback to exact value -->
    {item[header?.valuePath]}
  {/if}
{/snippet}
