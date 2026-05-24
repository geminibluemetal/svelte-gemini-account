<script>
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';

  // Destructure props cleanly with Svelte 5 runes
  const { attendanceNames, attendanceCategories } = $props();

  let open = $state(false);
  let openForm = $state(false);
  function handleClose() {
    open = false;
  }
  let editableName = $state({
    isDelete: false,
    id: '',
    name: '',
    dayFee: '',
    overallAdvance: '',
    categoryId: '',
  });

  // Pre-calculate categories array for the options dropdown
  const categories = $derived(attendanceCategories.map((c) => c.name));

  /**
   * PERFORMANCE OPTIMIZATION: Computes synchronously only when data changes.
   * Replaced $effect with $derived.by to prevent background processing loops
   * while typing in inputs.
   */
  const categorizedNames = $derived.by(() => {
    const categoriesMap = {};

    // Quick lookup map for categories to completely avoid nested .find() loops
    const categoryLookup = new Map(attendanceCategories.map((c) => [c._id, c.name]));

    attendanceNames.forEach((name) => {
      const mapper = categoryLookup.get(name.categoryId) || 'Uncategorized';

      if (!categoriesMap[mapper]) {
        categoriesMap[mapper] = [];
      }
      categoriesMap[mapper].push({ ...name, categoryName: mapper });
    });

    return categoriesMap;
  });

  function handleEdit(id) {
    const nameToEdit = attendanceNames.find((n) => n.id === id);
    if (nameToEdit) {
      editableName = { ...nameToEdit, isDelete: false };
      openForm = true;
    }
  }
</script>

<Model {open} onClose={handleClose}>
  <div class="mx-auto w-full max-w-4xl p-5">
    <h1
      class="sticky top-0 z-10 mb-8 flex justify-between border-b-2 border-black bg-white py-3 text-center text-2xl font-bold"
    >
      <div>
        <span class="mr-2">Attendance Names</span>
        <Button
          color="success"
          onclick={() => {
            editableName = {
              isDelete: false,
              id: '',
              name: '',
              dayFee: '',
              overallAdvance: '',
              categoryId: '',
            };
            openForm = true;
          }}
        >
          Add
        </Button>
      </div>
      <button
        type="button"
        class="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 bg-red-700 pb-1.5 text-white outline-0 hover:bg-red-800 hover:outline-2 hover:outline-red-800"
        onclick={handleClose}
      >
        &times;
      </button>
    </h1>

    <!-- CATEGORY WISE LIST -->
    {#each Object.entries(categorizedNames) as [category, categoryNames] (category)}
      <div class="mb-8 border">
        <!-- Category Header -->
        <h2 class="border bg-white text-center text-lg font-bold">
          {category}
        </h2>

        <table class="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100 *:border *:px-1">
              <th class="text-left">Name</th>
              <th class="text-left">Day Fee</th>
              <th class="text-left">Overall Advance</th>
              <th class="text-left">Category</th>
            </tr>
          </thead>
          <tbody>
            {#each categoryNames as name (name.id)}
              <tr class="*:border *:px-1 hover:bg-gray-200" onclick={() => handleEdit(name.id)}>
                <td>{name.name}</td>
                <td>{name.dayFee}</td>
                <td>{name.overallAdvance}</td>
                <td>{name.categoryName}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/each}
  </div>
</Model>

<Model open={openForm} onClose={() => (openForm = false)}>
  <form class="max-w-md bg-white p-5" method="POST" use:enhance action="?/editName">
    <h2 class="mb-4 text-center text-xl font-bold">
      {editableName?.id ? 'Update' : 'Add'} Attendance Name
    </h2>
    {#if editableName.id}
      <input type="hidden" name="nameId" value={editableName.id} />
    {/if}
    {#if editableName.isDelete}
      <input type="hidden" name="isDelete" value={editableName.isDelete} />
    {/if}
    <input type="hidden" name="categoryId" value={editableName.categoryId} />
    <InputField placeholder="Name" name="name" required value={editableName.name} />
    <InputField
      placeholder="Day Fee"
      name="dayFee"
      type="number"
      required
      value={editableName.dayFee}
    />
    <InputField
      placeholder="Overall Advance"
      name="overallAdvance"
      type="number"
      value={editableName.overallAdvance}
    />
    <InputField
      placeholder="Category"
      options={categories}
      value={attendanceCategories.find((c) => c._id === editableName.categoryId)?.name || ''}
      onBlur={(value) => {
        const selectedCategory = attendanceCategories.find((c) => c.name === value);
        if (selectedCategory) {
          editableName.categoryId = selectedCategory._id;
        } else {
          editableName.categoryId = null;
        }
      }}
    />
    <div class="mt-4 flex justify-end gap-2">
      <Button
        type="submit"
        color="danger"
        onclick={() => {
          editableName.isDelete = true;
          setTimeout(() => (openForm = false), 100); // Delay to allow form submission
        }}>Delete</Button
      >
      <Button type="button" color="gray" onclick={() => (openForm = false)}>Cancel</Button>
      <Button type="submit" color="primary" onblur={() => (openForm = false)}>
        {editableName?.id ? 'Update' : 'Add'}
      </Button>
    </div>
  </form>
</Model>
