<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  let { open, onClose, item, scaleData } = $props();
  let data = $derived({ ...item });
  const type = ['Chakka', 'Normal'];

  function handleClose() {
    onClose();
  }

  function handleFormSubmit({ formData }) {
    formData.set('firstWeight', scaleData);
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

<Model {open} onClose={handleClose} autoFocusTabIndex={2}>
  <Form
    action="?/weightment"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title="First Weight"
    enhance={handleFormSubmit}
  >
    <InputField
      name="type"
      value="Normal"
      caseMode="upper"
      options={type}
      placeholder="Type"
      autoComplete="off"
    />
    <InputField name="vehicle" value={data.vehicle} placeholder="Vehicle" autoComplete="off" />
    <InputField bind:value={scaleData} disabled={true} />
    <!-- <InputField
      name="emptyWeight"
      value={data.emptyWeight}
      placeholder="Empty Weight"
      autoComplete="off"
    />
    <InputField
      name="loadWeight"
      value={data.loadWeight}
      placeholder="Load Weight"
      autoComplete="off"
    /> -->
  </Form>
</Model>
