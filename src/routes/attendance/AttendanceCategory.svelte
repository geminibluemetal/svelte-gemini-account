<script>
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  const { attendanceCategories } = $props();
  let open = $state(false);

  // eslint-disable-next-line svelte/prefer-writable-derived
  let categories = $state([]);

  function handleClose() {
    open = false;
  }

  $effect(() => {
    categories = attendanceCategories;
  });
</script>

<Model {open} onClose={handleClose}>
  <div class="mx-auto w-full max-w-xl p-5">
    <h1
      class="sticky top-0 z-10 mb-8 flex justify-between border-b-2 border-black bg-white py-3 text-center text-2xl font-bold"
    >
      <span>Attendance Categories</span>
      <button
        class="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 bg-red-700 pb-1.5 text-white outline-0 hover:bg-red-800 hover:outline-2 hover:outline-red-800"
        onclick={handleClose}
      >
        &times;
      </button>
    </h1>
    {#each categories as category (category._id)}
      <form method="POST" action="?/editCategory" use:enhance>
        <input type="hidden" name="categoryId" value={category._id} />
        <div
          class="mx-5 mb-10 flex flex-col gap-4 rounded-lg p-4 shadow-[0_2px_5px_5px_rgba(0,0,0,0.3)]"
        >
          <InputField placeholder="Category Name" name="name" value={category.name} />
          <div class="flex flex-row items-center gap-3">
            <Button
              class="dark"
              onclick={() => {
                category.fields = [
                  ...category.fields,
                  { shortName: '', longName: '', amount: 0, id: crypto.randomUUID() },
                ];
              }}
            >
              Add Field
            </Button>
            <Button class="dark" color="success" type="submit">Save Category</Button>
            <Button class="dark" color="danger">Delete Category</Button>
          </div>
          {#each category.fields as field, index (field.id)}
            <input type="hidden" name={`fields[${index}][id]`} value={field.id} />
            <div class="flex items-center gap-3">
              <InputField
                class="mb-0! w-50!"
                placeholder="Short Name"
                name={`fields[${index}][shortName]`}
                value={field.shortName}
              />
              <InputField
                class="mb-0!"
                placeholder="Long Name"
                name={`fields[${index}][longName]`}
                value={field.longName}
              />
              <InputField
                class="mb-0! w-50!"
                placeholder="Amount"
                name={`fields[${index}][amount]`}
                value={field.amount}
              />
              <div>
                <Button
                  class="dark"
                  onclick={() => {
                    category.fields = category.fields.filter((_, i) => i !== index);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </form>
    {/each}
  </div>
</Model>
