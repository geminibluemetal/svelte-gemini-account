<!-- src\lib\components\MultiField.svelte -->

<script>
  import stringCase from '$lib/utils/stringCase';
  let {
    fields = [],
    length = 3,
    title = '',
    value = $bindable([]),
    disabled = false,
    fieldName = ''
  } = $props();

  // Track if we've initialized
  let initialized = $state(false);

  // Initialize rows only once when value changes
  $effect(() => {
    // Skip if already initialized or no fields
    if (initialized || fields.length === 0) return;

    // If value has data, use it
    if (value.length > 0) {
      // Ensure each row has all required fields
      const processedValue = value.map((row) => {
        const processedRow = {};
        for (const f of fields) {
          processedRow[f.name] = row[f.name] ?? '';
        }
        return processedRow;
      });

      // Only update if different
      if (JSON.stringify(processedValue) !== JSON.stringify(value)) {
        value = processedValue;
      }
      length = processedValue.length;
    }
    // Otherwise initialize with empty rows
    else {
      value = Array.from({ length }, () => {
        const row = {};
        for (const f of fields) {
          row[f.name] = '';
        }
        return row;
      });
    }

    initialized = true;
  });

  // Add this function to properly format names for FormData
  function getInputName(index, fieldNameInRow) {
    return `${fieldName}[${index}][${fieldNameInRow}]`;
  }
</script>

<div
  class="overflow-hidden rounded-md border-2 border-gray-400 **:border-gray-400 font-semibold mb-3"
>
  <div
    class="border-b-2 px-2 py-1 text-center font-bold bg-gray-300/50 dark:bg-gray-800/50 flex justify-between"
  >
    <span>{title}</span>
    <button
      type="button"
      onclick={() => {
        const newRow = {};
        for (const f of fields) {
          newRow[f.name] = '';
        }
        value = [...value, newRow];
        length = length + 1;
      }}
      class="size-6 rounded-full bg-green-600 text-white
         inline-flex items-center justify-center
         text-xl font-bold
         outline-offset-1
         focus-visible:outline-2
         hover:outline-2 cursor-pointer
         hover:outline-green-600
         focus-visible:outline-green-600"
    >
      <span class="leading-none -mt-1">+</span>
    </button>
  </div>

  <table class="w-full border-collapse">
    <thead class="bg-gray-300/50 dark:bg-gray-800/50">
      <tr class="border-b-2">
        <th class="px-2 py-1 border-r-2 w-0">#</th>
        {#each fields as field}
          <th class="px-2 py-1 border-r-2">{field.title}</th>
        {/each}
        <th class="px-2 py-1 w-0">@</th>
      </tr>
    </thead>

    <tbody>
      {#each value as row, i (i)}
        <tr class="not-last:border-b-2">
          <td class="border-r-2 p-1 text-center">{i + 1}</td>
          {#each fields as { placeholder, ...field }, j (j)}
            <td class="border-r-2">
              <input
                class="w-full px-2 py-1 focus:outline-amber-500 focus:outline-2 focus:bg-amber-50 dark:focus:bg-amber-950"
                placeholder={`${placeholder} ${i + 1}`}
                {...field}
                bind:value={row[field.name]}
                name={getInputName(i, field.name)}
                oninput={(e) => {
                  row[field.name] = stringCase.smartTitle(e.target.value);
                }}
              />
            </td>
          {/each}
          <td class="text-center">
            <button
              type="button"
              onclick={() => {
                value = value.filter((_, idx) => idx !== i);
                length = length - 1;
              }}
              class="size-6 rounded-full bg-amber-600 text-white
                inline-flex items-center justify-center
                text-xl font-bold
                outline-offset-1
                focus-visible:outline-2
                hover:outline-2 cursor-pointer
                hover:outline-amber-600
                focus-visible:outline-amber-600"
            >
              <span class="leading-none -mt-1">-</span>
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
