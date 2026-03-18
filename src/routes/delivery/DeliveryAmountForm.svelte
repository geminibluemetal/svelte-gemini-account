<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item } = $props();
  let data = $derived({ ...item });
  const amountType = ['AC', 'CP', 'Paytm', 'Gpay', 'Bunk'];

  function handleClose() {
    onClose();
  }

  function handleFormSubmit({ formData }) {
    if (item) {
      formData.set('sign', item.sign);
      formData.set('address', item.address);
      formData.set('deliveryItem', item.deliveryItem);
      formData.set('deliveryQuantity', item.deliveryQuantity);
      formData.set('partyName', item.partyName);
      formData.set('paymentAt', item?.paymentAt ? item.paymentAt : '');
    }
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
      name="amountType1"
      value={data.amountType1}
      placeholder="Amount Type 1"
      options={item?.partyName ? amountType : amountType.filter((x) => x !== 'AC')}
      autoComplete="off"
    />
    <InputField
      name="amount1"
      value={data.amount1}
      placeholder="Amount 1"
      autoComplete="off"
      caseMode="smartTitleChars"
      allowedChars={['=', '+']}
    />

    <div class="mx-auto mt-2 mb-5"></div>

    <InputField
      name="amountType2"
      value={data.amountType2}
      placeholder="Amount Type 2"
      options={amountType.filter((x) => x !== 'AC')}
      autoComplete="off"
    />
    <InputField
      name="amount2"
      value={data.amount2}
      placeholder="Amount 2"
      autoComplete="off"
      caseMode="smartTitleChars"
      allowedChars={['=', '+']}
    />
  </Form>
</Model>
