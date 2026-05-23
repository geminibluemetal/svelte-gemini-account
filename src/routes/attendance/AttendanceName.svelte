<script>
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';

  const { attendanceNames, attendanceCategories } = $props();

  let open = $state(true);

  // Category names for autocomplete/options
  let categories = $derived(attendanceCategories.map((c) => c.name));

  // Editable names state
  // eslint-disable-next-line svelte/prefer-writable-derived
  let names = $state([]);

  // Group names by category
  let categorizedNames = $derived.by(() => {
    const categorized = {};

    names.forEach((name) => {
      const category = attendanceCategories.find((c) => c._id === name.categoryId);

      const categoryName = category?.name ?? 'Uncategorized';

      if (!categorized[categoryName]) {
        categorized[categoryName] = [];
      }

      categorized[categoryName].push(name);
    });

    return categorized;
  });

  function handleClose() {
    open = false;
  }

  // Initialize editable state
  $effect(() => {
    names = attendanceNames.map((name) => {
      const category = attendanceCategories.find((c) => c._id === name.categoryId);

      return {
        ...name,
        categoryName: category?.name ?? '',
      };
    });
  });
</script>

<Model {open} onClose={handleClose}>
  <div class="mx-auto w-full max-w-2xl p-5">
    <h1
      class="sticky top-0 z-10 mb-8 flex justify-between border-b-2 border-black bg-white py-3 text-center text-2xl font-bold"
    >
      <span>Attendance Names</span>

      <button
        class="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 bg-red-700 pb-1.5 text-white outline-0 hover:bg-red-800 hover:outline-2 hover:outline-red-800"
        onclick={handleClose}
      >
        &times;
      </button>
    </h1>

    <!-- CATEGORY WISE LIST -->
    {#each Object.entries(categorizedNames) as [category, categoryNames] (category)}
      <div class="mb-8">
        <!-- Category Header -->
        <h2 class="mb-4 border-b border-gray-300 bg-white py-2 text-xl font-bold">
          {category}
        </h2>

        <!-- Names Inside Category -->
        {#each categoryNames as name (name.id)}
          <form method="POST" action="?/editName" use:enhance>
            <input type="hidden" name="nameId" value={name.id} />

            <input type="hidden" name="categoryId" bind:value={name.categoryId} />

            <div class="mb-3 flex items-center gap-2">
              <!-- NAME -->
              <InputField class="mb-0!" placeholder="Name" name="name" value={name.name} />

              <!-- DAY FEE -->
              <InputField
                class="mb-0! w-75!"
                placeholder="Day Fees"
                name="dayFee"
                value={name.dayFee}
              />

              <!-- CATEGORY -->
              <InputField
                class="mb-0!"
                placeholder="Category Name"
                bind:value={name.categoryName}
                options={categories}
                onBlur={(value) => {
                  const selected = attendanceCategories.find((c) => c.name === value);

                  // Update reactive values
                  name.categoryId = selected?._id ?? '';
                  name.categoryName = selected?.name ?? '';

                  // Trigger reactivity
                  names = [...names];
                }}
              />

              <!-- SAVE -->
              <Button class="dark" color="success" type="submit">Save</Button>

              <!-- DELETE -->
              <Button
                class="dark"
                color="danger"
                type="button"
                formaction="?/deleteName"
                name="nameId"
                value={name.id}
              >
                Delete
              </Button>
            </div>
          </form>
        {/each}
      </div>
    {/each}
  </div>
</Model>
