<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item } = $props();
  let initialData = {
    amount_type_1: null,
    amount_1: null,
    amount_type_2: null,
    amount_2: null
  };

  let data = $state(initialData);

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
    data = { ...item };
  });
</script>

<Model {open} onClose={handleClose} autoFocusTabIndex={item ? 2 : 1}>
  <Form
    action="?/amountUpdate"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title="Update Amount"
    submitButtonText={['Update Amount']}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="amount_type_1"
      value={data.amount_type_1}
      placeholder="Amount Type 1"
      autoComplete="off"
    />
    <InputField name="amount_1" value={data.amount_1} placeholder="Amount 1" autoComplete="off" />

    <div class="border mb-5 mt-2 border-gray-500 w-1/2 mx-auto"></div>

    <InputField
      name="amount_type_2"
      value={data.amount_type_2}
      placeholder="Amount Type 2"
      autoComplete="off"
    />
    <InputField name="amount_2" value={data.amount_2} placeholder="Amount 2" autoComplete="off" />
  </Form>
</Model>
