<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item } = $props();
  const amountType = [
    'Cash',
    'Paytm',
    'Gpay',
    'Bunk Cash',
    'Bunk Ac',
    'Gemini Ac',
    'Cheque',
    'Discount',
    'Roundoff',
    'Tip Adjust',
    'Other',
  ];

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
</script>

<Model {open} onClose={handleClose} autoFocusTabIndex={1}>
  <Form
    action="?/amountEdit"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title="Edit Amount"
    submitButtonText={['Edit']}
    enhance={handleFormSubmit}
  >
    {#if item.entryType == 'ADJUST'}
      <InputField
        name="amountType"
        value={item.amountType}
        placeholder="Amount Type"
        options={amountType}
        autoComplete="off"
      />
    {/if}
    <InputField name="amount" value={item.amount} placeholder="Amount" autoComplete="off" />
    <input type="hidden" name="editId" value={item.id} />
  </Form>
</Model>
