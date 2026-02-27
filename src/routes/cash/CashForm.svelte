<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, cashDescription = [], party = [] } = $props();
  let initialData = {
    order_id: null,
    amount: 0,
    description: '',
    entry_type: 'EXPENSE',
  };

  let data = $state(initialData);
  const descriptionOption = $derived(
    Array.from(
      new Set([...cashDescription.map((cd) => cd.description), ...party.map((p) => p.name)]),
    ),
  );

  function handleClose() {
    onClose();
  }

  function handleFormSubmit() {
    return async ({ result }) => {
      if (result.type == 'failure') {
        showToast(result?.data?.message || 'Enter Correct Details', 'danger');
      } else {
        showToast(result?.data?.message || 'Success');
        handleClose();
      }
    };
  }

  $effect(() => {
    data = item ? { ...item } : initialData;
  });
</script>

<Model {open} onClose={handleClose} autoFocusTabIndex={item ? 3 : 2}>
  <Form
    action="?/form"
    method="POST"
    cancel={handleClose}
    class="max-w-md"
    title={item ? 'Update Entry' : 'Create Entry'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="entry_type"
      value={data.entry_type}
      options={['EXPENSE', 'INCOME']}
      placeholder="Entry Type"
      autoComplete="off"
    />
    <InputField
      name="description"
      newValue="accept"
      value={data.description}
      options={descriptionOption}
      placeholder="Description"
      autoComplete="off"
      silent={true}
    />
    <InputField name="amount" value={data.amount} placeholder="Amount" autoComplete="off" />
  </Form>
</Model>
