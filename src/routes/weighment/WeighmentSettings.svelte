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

<Model {open} onClose={handleClose} autoFocusTabIndex={1}>
  <Form
    action="?/wighmentSettings"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title="Edit Port Settings"
    enhance={handleFormSubmit}
  >
    <InputField
      name="path"
      value={data.path}
      caseMode="upper"
      placeholder="Com Port (COM3)"
      autoComplete="off"
    />
    <InputField
      name="baudRate"
      value={data.baudRate}
      placeholder="Baud Rate (9600)"
      autoComplete="off"
    />
    <InputField
      name="dataBits"
      value={data.dataBits}
      placeholder="Data Bits (8)"
      autoComplete="off"
    />
    <InputField
      name="stopBits"
      value={data.stopBits}
      placeholder="Stop Bits (1)"
      autoComplete="off"
    />
    <InputField
      name="parity"
      value={data.parity}
      caseMode="none"
      placeholder="Parity (none)"
      autoComplete="off"
    />
  </Form>
</Model>
