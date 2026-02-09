<script>
  import CheckBoxField from '$lib/components/CheckBoxField.svelte';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, options } = $props();
  let initialData = {
    order_number: '',
    party_name: '',
    address: '',
    delivery_item: '',
    delivery_quantity: 0,
    is_cancelled: 0,
    amount_type_1: ''
    // amount_1: null,
    // amount_type_2: '',
    // amount_2: null,
  };

  let data = $state(initialData);
  let isAc = $state(false);

  const orderList = $derived(options.orders.map((o) => o.order_number.toString()));
  const partyList = $derived(options.party.map((p) => p.name));
  const addressList = $derived(options.address.map((a) => a.name));
  const vehicleList = $derived(options.vehicle.map((v) => v.short_number));
  const itemsList = $derived(options.item.map((i) => i.name));

  function handleClose() {
    onClose();
  }

  function handleOrderNumberSelection(value) {
    const selectedOrder = options.orders.find((o) => o.order_number == value);
    data.party_name = '';
    data.address = '';
    data.delivery_item = '';
    if (selectedOrder?.party_name) data.party_name = selectedOrder.party_name;
    if (selectedOrder?.address) data.address = selectedOrder.address;
    if (selectedOrder?.item) data.delivery_item = selectedOrder.item;
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
    isAc = item?.amount_type_1 == 'AC';
  });
</script>

<Model {open} onClose={handleClose} autoFocusTabIndex={item ? 2 : 1}>
  <Form
    action="?/form"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title="Delivery Entry"
    submitButtonText={['Entry']}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="order_number"
      value={data.order_number}
      placeholder="Order Number"
      autoComplete="off"
      options={orderList}
      silent={true}
      silentOnValue={item.order_number}
      onValueSelected={handleOrderNumberSelection}
    />
    <InputField
      name="party_name"
      value={data.party_name}
      placeholder="Party"
      autoComplete="off"
      options={partyList}
      silent={true}
    />
    <InputField
      name="address"
      value={data.address}
      placeholder="Address"
      autoComplete="off"
      options={addressList}
      silent={true}
    />
    <InputField
      name="delivery_item"
      value={data.delivery_item}
      placeholder="Item"
      autoComplete="off"
      caseMode="smartTitleChars"
      allowedChars={['+']}
      options={itemsList}
      silent={true}
    />
    <InputField
      name="delivery_quantity"
      value={data.delivery_quantity}
      placeholder="Quantity"
      autoComplete="off"
      caseMode="none"
    />

    <CheckBoxField bind:value={isAc} placeholder="Is AC" />
    {#if isAc}
      <input type="hidden" name="amount_type_1" value="AC" />
    {:else}
      <input type="hidden" name="amount_type_1" value="" />
    {/if}

    <CheckBoxField name="is_cancelled" value={data.is_cancelled} placeholder="Is Cancelled" />
  </Form>
</Model>
