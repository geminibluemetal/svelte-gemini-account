<script>
  import CheckBoxField from '$lib/components/CheckBoxField.svelte';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, options } = $props();
  let initialData = {
    orderNumber: '',
    partyName: '',
    address: '',
    deliveryItem: '',
    deliveryQuantity: 0,
    isCancelled: 0,
    amountType1: '',
    // amount1: null,
    // amountType2: '',
    // amount2: null,
  };

  let data = $state(initialData);
  let isAc = $state(false);

  const orderList = $derived(['NO', ...options.orders.map((o) => o.orderNumber.toString())]);
  const partyList = $derived(options.party.map((p) => p.name));
  const addressList = $derived(options.address.map((a) => a.name));
  const itemsList = $derived(options.item.map((i) => i.name));

  function handleClose() {
    onClose();
  }

  function handleOrderHelperText(value) {
    const order = options.orders.find((o) => o.orderNumber == value);
    if (order) {
      return `${order.partyName ? order.partyName + ', ' : ''}
      ${order.address ? order.address + ', ' : ''}
      ${order.item ? order.item + ', ' : ''}
      ${order.amountType}`;
    }
  }

  function handleOrderNumberSelection(value) {
    const selectedOrder = options.orders.find((o) => o.orderNumber == value);
    data.partyName = '';
    data.address = '';
    data.deliveryItem = '';
    if (selectedOrder?.partyName) data.partyName = selectedOrder.partyName;
    if (selectedOrder?.address) data.address = selectedOrder.address;
    if (selectedOrder?.item) data.deliveryItem = selectedOrder.item;
  }

  function handleFormSubmit({ formData }) {
    if (item) {
      formData.set('vehicle', item.vehicle);
      formData.set('sign', item.sign);
      formData.set('amountType2', item.amountType2);
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

  $effect(() => {
    data = { ...item };
    isAc = item?.amountType1 == 'AC';
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
      name="orderNumber"
      value={data.orderNumber}
      placeholder="Order Number"
      autoComplete="off"
      options={orderList}
      optionHelperText={handleOrderHelperText}
      silent={true}
      silentOnValue={item.orderNumber}
      onValueSelected={handleOrderNumberSelection}
    />
    <InputField
      name="partyName"
      value={data.partyName}
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
      name="deliveryItem"
      value={data.deliveryItem}
      placeholder="Item"
      autoComplete="off"
      caseMode="smartTitleChars"
      allowedChars={['+']}
      options={itemsList}
      silent={true}
    />
    <InputField
      name="deliveryQuantity"
      value={data.deliveryQuantity}
      placeholder="Quantity"
      autoComplete="off"
      caseMode="none"
    />

    <CheckBoxField bind:value={isAc} placeholder="Is AC" />
    {#if isAc}
      <input type="hidden" name="amountType1" value="AC" />
    {:else}
      <input type="hidden" name="amountType1" value="" />
    {/if}

    <CheckBoxField name="isCancelled" value={data.isCancelled} placeholder="Is Cancelled" />
  </Form>
</Model>
