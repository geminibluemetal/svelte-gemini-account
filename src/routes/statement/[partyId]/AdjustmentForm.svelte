<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, partyId } = $props();
  let data = $derived({ ...item });
  const adjustmentType = ['Discount', 'Roundoff', 'Tip Adjust', 'Other'];

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
    action="?/adjustment"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title="Add Adjustment"
    submitButtonText={['Add']}
    enhance={handleFormSubmit}
  >
    <InputField
      name="amountType"
      value={data.amountType}
      placeholder="Adjustment Type"
      options={adjustmentType}
      autoComplete="off"
    />
    <InputField
      name="amount"
      value={data.amount}
      placeholder="Amount"
      autoComplete="off"
      caseMode="smartTitleChars"
      allowedChars={['=', '-']}
    />
    <input type="hidden" name="partyId" value={partyId} />
    <input type="hidden" name="entryType" value="ADJUST" />
  </Form>
</Model>
