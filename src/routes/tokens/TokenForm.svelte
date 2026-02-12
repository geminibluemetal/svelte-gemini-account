<script>
  import CheckBoxField from '$lib/components/CheckBoxField.svelte';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, options } = $props();
  let initialData = {
    party_name: '',
    token_item: '',
    token_quantity: '',
    vehicle: '',
    is_cancelled: 0
  };

  let data = $state(initialData);

  const partyList = $derived(options.party.map((p) => p.name));
  const vehicleList = $derived(options.vehicle.map((v) => v.short_number));
  const itemsList = $derived(options.item.map((i) => i.name));

  function handleClose() {
    onClose();
  }

  function handleFormSubmit({ formData }) {
    formData.set('delivery_item', item.delivery_item ? item.delivery_item : '');
    formData.set('delivery_quantity', item.delivery_quantity ? item.delivery_quantity : '');
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
    title={item ? 'Update Token' : 'Create Token'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="party_name"
      value={data.party_name}
      placeholder="Party"
      autoComplete="off"
      options={partyList}
      silent={true}
    />
    <InputField
      name="vehicle"
      value={data.vehicle}
      placeholder="Vehicle"
      autoComplete="off"
      options={vehicleList}
      silent={true}
    />
    <InputField
      name="token_item"
      value={data.token_item}
      placeholder="Item"
      autoComplete="off"
      caseMode="smartTitleChars"
      allowedChars={['+']}
      options={itemsList}
      silent={true}
    />
    <InputField
      name="token_quantity"
      value={data.token_quantity}
      placeholder="Quantity"
      autoComplete="off"
      caseMode="none"
    />
    {#if !!item}
      <CheckBoxField name="is_cancelled" value={data.is_cancelled} placeholder="Is Cancelled" />
    {/if}
  </Form>
</Model>
