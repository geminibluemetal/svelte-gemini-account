<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, allItems } = $props();

  let nameOptions = $state([]);
  let data = $derived(
    item
      ? { ...item }
      : {
          name: '',
          price: {
            unit025: '',
            unit050: '',
            unit100: '',
            unit150: '',
            unit200: '',
          },
        },
  );

  function handleClose() {
    nameOptions = [];
    onClose();
  }

  function handleNameChange(value) {
    if (value.includes(' + ')) {
      const [prefixName] = value.split(' + ');
      const singleItems = allItems.filter((i) => !i.name.includes(' + '));
      nameOptions = singleItems.map((i) => `${prefixName} + ${i.name}`);
    } else {
      nameOptions = [];
    }
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
    title={item ? 'Update Item' : 'Create Item'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="name"
      value={data.name}
      placeholder="Item Name"
      caseMode="smartTitleChars"
      allowedChars={['+']}
      options={nameOptions}
      autoComplete="off"
      onValueChange={handleNameChange}
    />
    <InputField
      name="price[unit025]"
      value={data.price?.unit025}
      type="number"
      placeholder="0.25 Unit Price"
    />
    <InputField
      name="price[unit050]"
      value={data.price?.unit050}
      type="number"
      placeholder="0.50 Unit Price"
    />
    <InputField
      name="price[unit100]"
      value={data.price?.unit100}
      type="number"
      placeholder="1.00 Unit Price"
    />
    <InputField
      name="price[unit150]"
      value={data.price?.unit150}
      type="number"
      placeholder="1.50 Unit Price"
    />
    <InputField
      name="price[unit200]"
      value={data.price?.unit200}
      type="number"
      placeholder="2.00 Unit Price"
    />
  </Form>
</Model>
