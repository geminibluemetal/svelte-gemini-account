<script>
  import CheckBoxField from '$lib/components/CheckBoxField.svelte';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, allVehicle } = $props();
  let initialData = {
    name: '',
    phone: ''
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

<Model {open} onClose={handleClose} autoFocusTabIndex={!!item ? 2 : 1}>
  <Form
    action="?/form"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title={item ? 'Update Vehicle' : 'Create Vehicle'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="short_number"
      value={data.short_number}
      placeholder="Short Number"
      autoComplete="off"
    />
    <CheckBoxField
      name="is_company_vehicle"
      value={data.is_company_vehicle}
      placeholder="Company Vehicle"
    />
  </Form>
</Model>
