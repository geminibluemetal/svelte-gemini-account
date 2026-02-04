<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { onMount } from 'svelte';

  const { open, onClose } = $props();
</script>

<Model {open} {onClose} autoFocusTabIndex={1}>
  <Form cancel={onClose} class="max-w-lg" title="Create Item">
    <InputField placeholder="Item Name" />
    <InputField placeholder="0.25 Unit Price" />
    <InputField placeholder="0.50 Unit Price" />
    <InputField placeholder="1.00 Unit Price" />
    <InputField placeholder="1.50 Unit Price" />
    <InputField placeholder="2.00 Unit Price" />
  </Form>
</Model>
