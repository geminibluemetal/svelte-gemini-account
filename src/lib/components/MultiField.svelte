<!-- src\lib\components\MultiField.svelte -->

<script>
  import stringCase from '$lib/utils/stringCase';
  let { fields = [], length = 3, title = '', value = $bindable([]), fieldName = '' } = $props();

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
  class="mb-3 overflow-hidden rounded-md border-2 border-gray-400 font-semibold **:border-gray-400"
>
  <div
    class="flex justify-between border-b-2 bg-gray-300/50 px-2 py-1 text-center font-bold dark:bg-gray-800/50"
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
      class="inline-flex size-6 cursor-pointer items-center
         justify-center rounded-full bg-green-600
         text-xl font-bold
         text-white
         outline-offset-1
         hover:outline-2 hover:outline-green-600
         focus-visible:outline-2
         focus-visible:outline-green-600"
    >
      <span class="-mt-1 leading-none">+</span>
    </button>
  </div>

  <table class="w-full border-collapse">
    <thead class="bg-gray-300/50 dark:bg-gray-800/50">
      <tr class="border-b-2">
        <th class="w-0 border-r-2 px-2 py-1">#</th>
        {#each fields as field}
          <th class="border-r-2 px-2 py-1">{field.title}</th>
        {/each}
        <th class="w-0 px-2 py-1">@</th>
      </tr>
    </thead>

    <tbody>
      {#each value as row, i (i)}
        <tr class="not-last:border-b-2">
          <td class="border-r-2 p-1 text-center">{i + 1}</td>
          {#each fields as { placeholder, ...field }, j (j)}
            <td class="border-r-2">
              <input
                class="w-full px-2 py-1 focus:bg-amber-50 focus:outline-2 focus:outline-amber-500 dark:focus:bg-amber-950"
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
              class="inline-flex size-6 cursor-pointer items-center
                justify-center rounded-full bg-amber-600
                text-xl font-bold
                text-white
                outline-offset-1
                hover:outline-2 hover:outline-amber-600
                focus-visible:outline-2
                focus-visible:outline-amber-600"
            >
              <span class="-mt-1 leading-none">-</span>
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
