<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item } = $props();
  let initialData = {
    amount_type_1: null, // AC, CP, Paytm, Gpay, Bunk
    amount_1: null,
    amount_type_2: null, // AC, CP, Paytm, Gpay, Bunk
    amount_2: null
  };

  let data = $state(initialData);
  const amountType = ['AC', 'CP', 'Paytm', 'Gpay', 'Bunk'];

  function handleClose() {
    onClose();
  }

  function handleFormSubmit({ formData }) {
    if (item) formData.set('sign', item.sign);
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
      options={item?.party_name ? amountType : amountType.filter((x) => x !== 'AC')}
      autoComplete="off"
    />
    <InputField name="amount_1" value={data.amount_1} placeholder="Amount 1" autoComplete="off" />

    <div class="mb-5 mt-2 mx-auto"></div>

    <InputField
      name="amount_type_2"
      value={data.amount_type_2}
      placeholder="Amount Type 2"
      options={item?.party_name ? amountType : amountType.filter((x) => x !== 'AC')}
      autoComplete="off"
    />
    <InputField name="amount_2" value={data.amount_2} placeholder="Amount 2" autoComplete="off" />
  </Form>
</Model>
