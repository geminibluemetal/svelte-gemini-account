<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, options } = $props();
  let data = $derived({ ...item });
  const partyList = $derived(options.party.map((p) => p.name));
  const amountType = ['Cash', 'Paytm', 'Gpay', 'Bunk Cash', 'Bunk Ac', 'Gemini Ac', 'Cheque'];

  function handleFormSubmit({ formData, cancel }) {
    formData.set('entryType', 'CREDIT');
    if (item) formData.set('sign', item.sign);
    const partyName = formData.get('partyName');
    const party = options.party.find((p) => p.name == partyName);
    if (!party?.id) {
      cancel();
      showToast('Party is required', 'danger');
    } else {
      if (party) formData.set('partyId', party.id);
      return async ({ result }) => {
        if (result.type == 'failure') {
          showToast(result?.data?.message || 'Enter Correct Details', 'danger');
        } else {
          showToast(result?.data?.message || 'Success');
          handleClose();
        }
      };
    }
  }

  function handleClose() {
    onClose();
  }
</script>

<Model {open} onClose={handleClose} autoFocusTabIndex={item ? 2 : 1}>
  <Form
    action="?/oldBalance"
    method="POST"
    cancel={handleClose}
    title={item ? 'Update Old Balance' : 'New Old Balance'}
    isEdit={!!item}
    class="w-sm"
    submitButtonText={['Save', 'Update']}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={data.id} />
    {/if}
    <InputField
      placeholder="Party Name"
      options={partyList}
      silent={true}
      name="partyName"
      value={data.partyName}
    />
    <InputField
      placeholder="Amount Type"
      options={amountType}
      name="amountType"
      value={data.amountType}
    />
    <InputField placeholder="Amount" name="amount" value={data.amount} />
  </Form>
</Model>
