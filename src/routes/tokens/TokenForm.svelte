<script>
  // import CheckBoxField from '$lib/components/CheckBoxField.svelte';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, options } = $props();

  let data = $derived({ ...item });

  const partyList = $derived(options.party.map((p) => p.name));
  const vehicleList = $derived(options.vehicle.map((v) => v.shortNumber));
  const itemsList = $derived(options.item.map((i) => i.name));

  function handleClose() {
    onClose();
  }

  function handleFormSubmit({ formData }) {
    if (item) {
      formData.set('deliveryItem', item.deliveryItem ? item.deliveryItem : '');
      formData.set('deliveryQuantity', item.deliveryQuantity ? item.deliveryQuantity : '');
    }
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
    title={item ? 'Update Token' : 'Create Token'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="partyName"
      value={data.partyName}
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
      name="tokenItem"
      value={data.tokenItem}
      placeholder="Item"
      autoComplete="off"
      caseMode="smartTitleChars"
      allowedChars={['+']}
      options={itemsList}
      silent={true}
    />
    <InputField
      name="tokenQuantity"
      value={data.tokenQuantity}
      placeholder="Quantity"
      autoComplete="off"
      caseMode="none"
    />
    {#if !!item}
      <!-- <CheckBoxField name="isCancelled" value={data.isCancelled} placeholder="Is Cancelled" /> -->
    {/if}
  </Form>
</Model>
