<script>
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import { getFormattedDate, getWeekdayName } from '$lib/utils/dateTime';
  import { onMount } from 'svelte';
  const {
    cycle,
    attendanceCategories,
    attendanceNames,
    attendance,
    onEdit = () => {},
    onOverRowChange = () => {},
  } = $props();

  let overRow = $state({ categoryId: null, nameId: null, cIdx: -1 });

  const categorizedAttendanceNames = $derived.by(() => {
    const categorized = {};
    attendanceNames.forEach((name) => {
      if (!Array.isArray(categorized[name.categoryId])) {
        categorized[name.categoryId] = [];
      }
      categorized[name.categoryId].push(name);
    });
    return categorized;
  });

  function handleMouseOver(categoryId, nameId, cIdx, id) {
    overRow = { categoryId, nameId, cIdx, id };
  }

  function scrollToEnd(node, dynamicCondition) {
    // 1. Run on initial mount
    if (dynamicCondition) {
      node.scrollLeft = node.scrollWidth;
    }

    return {
      // 2. Runs automatically whenever the variable passed to use:scrollToEnd updates
      update(newCondition) {
        if (newCondition) {
          // A tiny timeout ensures Svelte has finished updating the DOM sizes
          setTimeout(() => {
            node.scrollLeft = node.scrollWidth;
          }, 0);
        }
      },
    };
  }

  function handleKeyboardNav(e) {
    if (e.key == 't') {
      e.preventDefault();
      const categoryIdList = attendanceCategories.map((ac) => ac._id);
      const currentIndex = categoryIdList.indexOf(overRow.categoryId);
      overRow.categoryId = categoryIdList[currentIndex + 1] || categoryIdList[0];
      overRow.nameId = categorizedAttendanceNames[overRow.categoryId][0].id;
      overRow.cIdx = cycle.list.length - 1;
    }

    if (!overRow.categoryId || !categorizedAttendanceNames[overRow.categoryId]) return;

    if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
      e.preventDefault();
      const currentIndex = categorizedAttendanceNames[overRow.categoryId].findIndex(
        (name) => name.id == overRow.nameId,
      );

      if (currentIndex === -1) {
        return;
      }

      const toNameCategory =
        categorizedAttendanceNames[overRow.categoryId][
          e.key == 'ArrowUp' ? currentIndex - 1 : currentIndex + 1
        ];
      if (toNameCategory?.id) overRow.nameId = toNameCategory.id;
    } else if (e.key == 'ArrowLeft' || e.key == 'ArrowRight') {
      e.preventDefault();
      if (e.key == 'ArrowLeft') {
        const tocIdx = overRow.cIdx - 1;
        if (0 <= tocIdx) overRow.cIdx = tocIdx;
      } else if (e.key == 'ArrowRight') {
        const tocIdx = overRow.cIdx + 1;
        if (cycle.list.length - 1 >= tocIdx) overRow.cIdx = tocIdx;
      }
    }

    // Always Update latest overId
    const fieldData = attendance.find(
      (a) => a.nameId == overRow.nameId && a.date == cycle.list[overRow.cIdx],
    );
    overRow.id = fieldData?.id;

    const gridWrapper = document.querySelector(`[data-identity="${overRow.categoryId}"]`);
    if (gridWrapper) {
      const element = gridWrapper.querySelector(
        `[data-identity="${overRow.categoryId}-${overRow.nameId}-${overRow.cIdx}"]`,
      );

      if (element) {
        // Get the bounding rectangles for both the wrapper and the element
        const wrapperRect = gridWrapper.getBoundingClientRect();
        const elemRect = element.getBoundingClientRect();

        // Check if the element is completely visible horizontally
        const isVisibleLeft = elemRect.left >= wrapperRect.left + 250;
        const isVisibleRight = elemRect.right <= wrapperRect.right;
        const isFullyVisibleHorizontal = isVisibleLeft && isVisibleRight;

        // If it's hidden or cut off, scroll it to the center horizontally
        if (!isFullyVisibleHorizontal) {
          element.scrollIntoView({
            block: 'nearest', // Prevents unnecessary vertical scrolling
            inline: 'center', // Centers the element horizontally
          });
        }
      }
    }
  }

  function handleAttendanceEdit() {
    onEdit(overRow.nameId, cycle.list[overRow.cIdx], overRow.id, overRow.categoryId);
  }

  function displayAT(AT) {
    switch (AT) {
      case 0:
        return 'A';
      case 0.5:
        return 'H';
      case 1:
        return 'P';
      case 1.5:
        return 'PH';
      case 2:
        return 'PP';
      default:
        return '';
    }
  }

  function getAtColorClass(categoryId, rowId, cIdx, value) {
    const staticStyle =
      value == 0
        ? { bg: 'bg-red-300', fg: 'text-red-800' }
        : value == 0.5
          ? { bg: 'bg-amber-300', fg: 'text-amber-800' }
          : value == 1
            ? { bg: 'bg-green-300', fg: 'text-green-800' }
            : value == 1.5 || value == 2
              ? { bg: 'bg-blue-300', fg: 'text-blue-800' }
              : '';
    const overingStyle =
      overRow.categoryId == categoryId
        ? overRow.nameId == rowId
          ? overRow.cIdx == cIdx
            ? { bg: 'bg-amber-400' }
            : { bg: 'bg-gray-300' }
          : { bg: 'bg-white' }
        : { bg: 'bg-white' };
    const finalStyle = { ...overingStyle, ...staticStyle };
    return Object.values(finalStyle).join(' ');
  }

  function getAdvColorClass(categoryId, rowId, cIdx, value) {
    const staticStyle = value ? { fg: 'text-red-800', more: 'border-r-black font-bold' } : '';
    const overingStyle =
      overRow.categoryId == categoryId
        ? overRow.nameId == rowId
          ? overRow.cIdx == cIdx
            ? { bg: 'bg-amber-400' }
            : { bg: 'bg-gray-300' }
          : { bg: 'bg-white' }
        : { bg: 'bg-white' };
    const finalStyle = { ...overingStyle, ...staticStyle };
    return Object.values(finalStyle).join(' ');
  }

  function getFieldColorClass(categoryId, rowId, cIdx) {
    const overingStyle =
      overRow.categoryId == categoryId
        ? overRow.nameId == rowId
          ? overRow.cIdx == cIdx
            ? { bg: 'bg-amber-400' }
            : { bg: 'bg-gray-300' }
          : { bg: 'bg-white' }
        : { bg: 'bg-white' };
    const finalStyle = { ...overingStyle };
    return Object.values(finalStyle).join(' ');
  }

  $effect(() => {
    onOverRowChange(overRow.nameId, cycle.list[overRow.cIdx], overRow.id, overRow.categoryId);
  });

  onMount(() => {
    keyboardEventBus.on('ArrowUp', handleKeyboardNav);
    keyboardEventBus.on('ArrowDown', handleKeyboardNav);
    keyboardEventBus.on('ArrowLeft', handleKeyboardNav);
    keyboardEventBus.on('ArrowRight', handleKeyboardNav);
    keyboardEventBus.on('T', handleKeyboardNav);
    keyboardEventBus.on('Enter', handleAttendanceEdit);
    return () => {
      keyboardEventBus.off('ArrowUp', handleKeyboardNav);
      keyboardEventBus.off('ArrowDown', handleKeyboardNav);
      keyboardEventBus.off('ArrowLeft', handleKeyboardNav);
      keyboardEventBus.off('ArrowRight', handleKeyboardNav);
      keyboardEventBus.off('T', handleKeyboardNav);
      keyboardEventBus.off('Enter', handleAttendanceEdit);
    };
  });
</script>

<div class="flex flex-col gap-5 caret-transparent">
  {#each attendanceCategories as category, catIdx (`${category._id}-${catIdx}`)}
    {@const fieldsPerDate = category.fields.length + 2}
    {@const totalDynamicCols = fieldsPerDate * cycle.list.length}
    <div
      data-identity={category._id}
      class="grid w-fit max-w-full overflow-auto border-2 *:px-1"
      style:grid-template-columns="max-content 200px repeat({totalDynamicCols}, max-content)"
      use:scrollToEnd={cycle.longName}
    >
      <div
        class="sticky left-0 row-span-2 flex items-center justify-center border-r-2 border-b-2 border-b-black bg-black text-white"
      >
        SN
      </div>
      <div
        class="sticky left-7.75 row-span-2 flex items-center justify-center truncate border-r-2 border-b-2 border-b-black bg-black text-white"
      >
        {category.name}
      </div>

      {#each cycle.list as date, dateIdx (date)}
        <div
          class="{cycle.list.length - 1 !== dateIdx &&
            'border-r-2'} border-b-2 bg-black text-center text-white"
          style:grid-column="span {fieldsPerDate}"
        >
          {getFormattedDate(date)}
          <div class="-mt-1 text-sm text-white/70">{getWeekdayName(date)}</div>
        </div>
      {/each}

      <!-- eslint-disable-next-line no-unused-vars -->
      {#each Array.from({ length: cycle.list.length }) as _, cycleIdx (cycleIdx)}
        <div class="min-w-8 border-r border-b-2 border-b-black bg-black text-center text-white">
          AT
        </div>
        {#each category.fields as field, fieldIdx (fieldIdx)}
          <div class="min-w-8 border-r border-b-2 border-b-black bg-black text-center text-white">
            {field.shortName}
          </div>
        {/each}
        <div
          class="{cycleIdx !== cycle.list.length - 1 &&
            'border-r-2'} min-w-8 border-b-2 border-b-black bg-black text-center text-white"
        >
          Adv
        </div>
      {/each}
      {#each categorizedAttendanceNames[category._id] || [] as row, rowIdx (row.id || rowIdx)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="sticky left-0 border-r-2 border-b text-center
          {overRow.categoryId == category._id
            ? row.id == overRow.nameId
              ? 'bg-gray-300'
              : 'bg-white'
            : 'bg-white'}"
          onmousemove={() => handleMouseOver(category._id, row.id, -1)}
        >
          {rowIdx + 1}
        </div>

        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="sticky left-7.75 truncate border-r-2 border-b
          {overRow.categoryId == category._id
            ? row.id == overRow.nameId
              ? 'bg-gray-300'
              : 'bg-white'
            : 'bg-white'}"
          onmousemove={() => handleMouseOver(category._id, row.id, -1)}
        >
          {row.name}
        </div>

        <!-- eslint-disable-next-line no-unused-vars -->
        {#each Array.from({ length: cycle.list.length }) as _, cIdx (cIdx)}
          {@const fieldData = attendance.find((a) => {
            return a.nameId == row.id && a.date == cycle.list[cIdx];
          })}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="border-r border-b border-gray-400 text-center
            {getAtColorClass(category._id, row.id, cIdx, fieldData?.fields?.AT)}"
            onmousemove={() => handleMouseOver(category._id, row.id, cIdx, fieldData?.id)}
          >
            {displayAT(fieldData?.fields?.AT)}
          </div>

          <!-- eslint-disable-next-line no-unused-vars -->
          {#each category.fields as field, fIdx (fIdx)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="border-r border-b border-gray-400 text-center
              {getFieldColorClass(
                category._id,
                row.id,
                cIdx,
                fieldData?.fields?.[field.shortName],
              )}"
              onmousemove={() => handleMouseOver(category._id, row.id, cIdx, fieldData?.id)}
            >
              {fieldData?.fields?.[field.shortName] || ''}
            </div>
          {/each}

          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            data-identity={`${category._id}-${row.id}-${cIdx}`}
            onmousemove={() => handleMouseOver(category._id, row.id, cIdx, fieldData?.id)}
            class="{cIdx !== cycle.list.length - 1 && 'border-r-2'}
              border-b border-b-gray-400 text-center
              {getAdvColorClass(category._id, row.id, cIdx, fieldData?.fields?.Adv)}"
          >
            {fieldData?.fields?.Adv || ''}
          </div>
        {/each}
      {/each}
    </div>
  {/each}
</div>
