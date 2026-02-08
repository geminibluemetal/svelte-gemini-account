<script>
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, allItems } = $props();
  let initialData = {
    name: '',
    price_025: '',
    price_050: '',
    price_100: '',
    price_150: '',
    price_200: ''
  };

  let nameOptions = $state([]);
  let data = $state(initialData);

  function handleClose() {
    nameOptions = [];
    onClose();
  }

  function handleNameChange(value) {
    if (value.includes(' + ')) {
      const [prefixName, suffixName] = value.split(' + ');
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

  $effect(() => {
    data = { ...item };
  });
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
      name="price_025"
      value={data.price_025}
      type="number"
      placeholder="0.25 Unit Price"
    />
    <InputField
      name="price_050"
      value={data.price_050}
      type="number"
      placeholder="0.50 Unit Price"
    />
    <InputField
      name="price_100"
      value={data.price_100}
      type="number"
      placeholder="1.00 Unit Price"
    />
    <InputField
      name="price_150"
      value={data.price_150}
      type="number"
      placeholder="1.50 Unit Price"
    />
    <InputField
      name="price_200"
      value={data.price_200}
      type="number"
      placeholder="2.00 Unit Price"
    />
  </Form>
</Model>
