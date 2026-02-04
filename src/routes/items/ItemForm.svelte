<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';
  import { onMount } from 'svelte';

  const { open, onClose, item } = $props();

  let data = $state({
    name: '',
    price_025: '',
    price_050: '',
    price_100: '',
    price_150: '',
    price_200: ''
  });

  function handleFormSubmit() {
    return async ({ result }) => {
      if (result.type == 'failure') {
        showToast(result?.data?.message || 'Enter Correct Details', 'danger');
      }
    };
  }

  $effect(() => {
    data = { ...item };
  });
</script>

<Model {open} {onClose} autoFocusTabIndex={1}>
  <Form
    action="?/form"
    method="POST"
    cancel={onClose}
    class="max-w-lg"
    title={item ? 'Update Item' : 'Create Item'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField name="name" value={data.name} placeholder="Item Name" />
    <InputField name="price_025" value={data.price_025} placeholder="0.25 Unit Price" />
    <InputField name="price_050" value={data.price_050} placeholder="0.50 Unit Price" />
    <InputField name="price_100" value={data.price_100} placeholder="1.00 Unit Price" />
    <InputField name="price_150" value={data.price_150} placeholder="1.50 Unit Price" />
    <InputField name="price_200" value={data.price_200} placeholder="2.00 Unit Price" />
  </Form>
</Model>
