<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item } = $props();

  let data = $derived({ ...item });

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

<Model {open} onClose={handleClose} autoFocusTabIndex={item ? 2 : 1}>
  <Form
    action="?/form"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title={item ? 'Update Address' : 'Create Address'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?._id} />
    {/if}
    <InputField name="name" value={data.name} placeholder="Address Name" autoComplete="off" />
    <InputField
      name="delivery_025"
      value={data.delivery_025}
      type="number"
      placeholder="0.25 Unit Delivery"
    />
    <InputField
      name="delivery_050_100"
      value={data.delivery_050_100}
      type="number"
      placeholder="1.00 Unit Delivery"
    />
    <InputField
      name="delivery_max"
      value={data.delivery_max}
      type="number"
      placeholder="2.00 Unit Delivery"
    />
  </Form>
</Model>
