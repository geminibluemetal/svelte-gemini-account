<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item } = $props();

  let data = $state([...item]);

  // Ensure empty row exists
  $effect(() => {
    // Remove rows where both fields are empty
    const cleaned = data.filter((row, index) => {
      const isLast = index === data.length - 1;
      const empty = !row.vehicle && !row.emptyWeight;

      // keep last row even if empty
      return !empty || isLast;
    });

    let updated = [...cleaned];

    const last = updated[updated.length - 1];

    // ensure last row is always empty
    if (!last || last.vehicle || last.emptyWeight) {
      updated.push({ vehicle: '', emptyWeight: '' });
    }

    if (updated.length !== data.length) {
      data = updated;
    }
  });

  function handleClose() {
    onClose();
  }

  function handleFormSubmit({ formData }) {
    data.forEach((item, index) => {
      if (item.vehicle) {
        formData.set(`data[${index}][vehicle]`, item.vehicle);
        formData.set(`data[${index}][emptyWeight]`, item.emptyWeight);
      }
    });
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
    action="?/emptyWeightUpdate"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title="Vehicle Empty Weight Update"
    enhance={handleFormSubmit}
  >
    <!-- eslint-disable-next-line no-unused-vars -->
    {#each data as row, i (i)}
      <div class="flex items-start gap-3">
        <InputField bind:value={data[i].vehicle} placeholder="Vehicle" autoComplete="off" />
        <InputField
          bind:value={data[i].emptyWeight}
          placeholder="Empty Weight"
          autoComplete="off"
        />
      </div>
    {/each}
  </Form>
</Model>
