<script>
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
  import CheckBoxField from '$lib/components/CheckBoxField.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  const { attendanceCategories, open, onClose } = $props();

  // eslint-disable-next-line svelte/prefer-writable-derived
  let categories = $state([]);

  function toCamelCase(str) {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special characters
      .trim()
      .split(/\s+/) // Split by spaces
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  function handleRuleMoveUp(index, categoryId) {
    const category = categories.find((c) => c._id == categoryId);
    const tempRule = category.calculationRule[index];
    category.calculationRule[index] = category.calculationRule[index - 1];
    category.calculationRule[index - 1] = tempRule;
  }
  function handleRuleMoveDown(index, categoryId) {
    const category = categories.find((c) => c._id == categoryId);
    const tempRule = category.calculationRule[index];
    category.calculationRule[index] = category.calculationRule[index + 1];
    category.calculationRule[index + 1] = tempRule;
  }

  $effect(() => {
    categories = attendanceCategories;
  });
</script>

<Model {open} {onClose}>
  <div class="mx-auto w-full max-w-4xl p-5">
    <h1
      class="sticky top-0 z-10 mb-8 flex justify-between border-b-2 border-black bg-white py-3 text-center text-2xl font-bold"
    >
      <span>Attendance Categories</span>
      <button
        class="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 bg-red-700 pb-1.5 text-white outline-0 hover:bg-red-800 hover:outline-2 hover:outline-red-800"
        onclick={onClose}
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
            <!-- <Button class="dark" color="danger">Delete Category</Button> -->
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
              <div class="-mb-3 flex items-center justify-center">
                <CheckBoxField name={`fields[${index}][isHidden]`} value={field.isHidden} />
                <span class="mb-3">isHidden</span>
              </div>
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
          <div class="flex flex-row items-center gap-3">
            <Button
              class="dark"
              onclick={() => {
                category.calculationRule = [
                  ...category.calculationRule,
                  { name: '', key: '', rule: '', id: crypto.randomUUID() },
                ];
              }}
            >
              Add Calculation Rule
            </Button>
          </div>
          {#each category.calculationRule as rule, index (rule.id)}
            <input type="hidden" name={`calculationRule[${index}][id]`} value={rule.id} />
            <div class="flex items-center gap-3">
              <span class="dark flex gap-1">
                <Button disabled={index == 0} onclick={() => handleRuleMoveUp(index, category._id)}>
                  ▲
                </Button>
                <Button
                  disabled={index == category.calculationRule.length - 1}
                  onclick={() => handleRuleMoveDown(index, category._id)}>▼</Button
                >
              </span>
              <InputField
                class="mb-0! w-100!"
                placeholder="Name"
                name={`calculationRule[${index}][name]`}
                value={rule.name}
                onValueChange={(value) => {
                  rule.key = toCamelCase(value);
                }}
              />
              <InputField
                class="mb-0! w-100!"
                placeholder="Key"
                caseMode="none"
                name={`calculationRule[${index}][key]`}
                readonly
                bind:value={rule.key}
              />
              <InputField
                class="mb-0!"
                placeholder="rule"
                caseMode="none"
                name={`calculationRule[${index}][rule]`}
                value={rule.rule}
              />
              <div>
                <Button
                  class="dark"
                  onclick={() => {
                    category.calculationRule = category.calculationRule.filter(
                      (_, i) => i !== index,
                    );
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
