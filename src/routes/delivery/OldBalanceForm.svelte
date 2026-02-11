<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, options } = $props();
  let initialData = {
    entry_type: 'CREDIT',
    party_id: '',
    party_name: '',
    amount_type: '', // Cash, Paytm, Gpay, Bunk Cash, Bunk Ac, Gemini Ac, Cheque
    amount: 0
  };
  let data = $state(initialData);
  const partyList = $derived(options.party.map((p) => p.name));
  const amountType = ['Cash', 'Paytm', 'Gpay', 'Bunk Cash', 'Bunk Ac', 'Gemini Ac', 'Cheque'];

  function handleFormSubmit({ formData, cancel }) {
    formData.set('entry_type', 'CREDIT');
    const partyName = formData.get('party_name');
    const party = options.party.find((p) => p.name == partyName);
    if (!party?.id) {
      cancel();
      showToast('Selected Party ID not exist', 'danger');
    }
    formData.set('party_id', party.id);
  }

  function handleClose() {
    onClose();
  }

  $effect(() => {
    data = { ...item };
  });
</script>

<Model {open} onClose={handleClose} autoFocusTabIndex={1}>
  <Form
    action="?/oldBalance"
    method="POST"
    cancel={handleClose}
    title={!!item ? 'Update Old Balance' : 'New Old Balance'}
    isEdit={!!item}
    class="w-sm"
    submitButtonText={['Save', 'Update']}
    enhance={handleFormSubmit}
  >
    <InputField
      placeholder="Party Name"
      options={partyList}
      name="party_name"
      value={data.party_name}
    />
    <InputField
      placeholder="Amount Type"
      options={amountType}
      name="amount_type"
      value={data.amount_type}
    />
    <InputField placeholder="Amount" name="amount" value={data.amount} />
  </Form>
</Model>
