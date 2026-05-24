<script>
  import { getFormattedDate, getWeekdayName } from '$lib/utils/dateTime';
  const { cycle, attendanceCategories, rowsData = [], attendanceNames } = $props();
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
</script>

<div class="flex flex-col gap-5">
  {#each attendanceCategories as category, catIdx (`${category.id}-${catIdx}`)}
    {@const fieldsPerDate = category.fields.length + 2}
    {@const totalDynamicCols = fieldsPerDate * cycle.length}

    <!-- Header Start -->
    <div
      class="grid w-fit max-w-full overflow-auto border-2 *:px-1"
      style:grid-template-columns="max-content 200px repeat({totalDynamicCols}, max-content)"
    >
      <div
        class="sticky left-0 row-span-2 flex items-center justify-center border-r-2 border-b-2 bg-black text-white"
      >
        SN
      </div>
      <div
        class="sticky left-7.75 row-span-2 flex items-center justify-center truncate border-r-2 border-b-2 bg-black text-white"
      >
        {category.name}
      </div>

      {#each cycle as date, dateIdx (date)}
        <div
          class="{cycle.length - 1 !== dateIdx &&
            'border-r-2'} border-b-2 bg-black text-center text-white"
          style:grid-column="span {fieldsPerDate}"
        >
          {getFormattedDate(date)}
          <div class="-mt-1 text-sm text-white/70">{getWeekdayName(date)}</div>
        </div>
      {/each}

      {#each Array.from({ length: cycle.length }) as _, cycleIdx (cycleIdx)}
        <div class="min-w-8 border-r border-b-2 border-b-black bg-black text-center text-white">
          AT
        </div>
        {#each category.fields as field, fieldIdx (fieldIdx)}
          <div class="min-w-8 border-r border-b-2 border-b-black bg-black text-center text-white">
            {field.shortName}
          </div>
        {/each}
        <div
          class="{cycleIdx !== cycle.length - 1 &&
            'border-r-2'} min-w-8 border-b-2 border-b-black bg-black text-center text-white"
        >
          Adv
        </div>
      {/each}
      <!-- Header End -->

      {#each categorizedAttendanceNames[category._id] as row, rowIdx (row.id || rowIdx)}
        <div class="sticky left-0 border-r-2 border-b bg-white text-center">
          {rowIdx + 1}
        </div>

        <div class="sticky left-7.75 truncate border-r-2 border-b bg-white">
          {row.name}
        </div>

        {#each Array.from({ length: cycle.length }) as _, cIdx (cIdx)}
          <div class="border-r border-b border-gray-400 bg-white text-center">1</div>

          {#each category.fields as _, fIdx (fIdx)}
            <div class="border-r border-b border-gray-400 bg-white text-center">2</div>
          {/each}

          <div
            class="{cIdx !== cycle.length - 1 && 'border-r-2'}
              border-b border-b-gray-400 bg-white text-center"
          >
            4
          </div>
        {/each}
      {/each}
    </div>
  {/each}
</div>
