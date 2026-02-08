<script>
  import CheckBoxField from '$lib/components/CheckBoxField.svelte';
  import Form from '$lib/components/Form.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import Model from '$lib/components/Model.svelte';
  import { showToast } from '$lib/stores/toast';

  const { open, onClose, item, allItems, options } = $props();
  let initialData = {
    party_name: '',
    address: '',
    phone: '',
    item: '',
    total_qty: '',
    amount_type: '', // COD, AC, Cash, Paytm, Gpay,
    amount: '',
    advance: '',
    discount: '',
    balance: '',
    sign: '',
    delivered_qty: '',
    balance_qty: '',
    notes: '',
    status: '',
    delivery_sheet_verified: ''
  };

  let data = $state(initialData);

  const partyList = $derived(options.party.map((p) => p.name));
  const addressList = $derived(options.address.map((a) => a.name));
  const itemsList = $derived(options.items.map((i) => i.name));
  const amountType = ['COD', 'AC', 'Cash', 'Paytm', 'Gpay'];

  function handleClose() {
    data = { ...initialData };
    onClose();
  }

  function handlePartyChange(value) {
    const selectedParty = options.party.find((p) => p.name === value);
    if (selectedParty) {
      data.phone = selectedParty.phone;
    } else {
      data.phone = '';
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
    data = item ? { ...item } : initialData;
  });
</script>

<Model {open} onClose={handleClose} autoFocusTabIndex={item ? 2 : 1}>
  <Form
    action="?/form"
    method="POST"
    cancel={handleClose}
    class="max-w-lg"
    title={item ? 'Update Order' : 'Create Order'}
    isEdit={!!item}
    enhance={handleFormSubmit}
  >
    {#if !!item}
      <input type="hidden" name="editId" value={item?.id} />
    {/if}
    <InputField
      name="party_name"
      value={data.party_name}
      placeholder="Select Party"
      autoComplete="off"
      options={partyList}
      silent={true}
      onValueSelected={handlePartyChange}
    />
    <InputField
      name="address"
      value={data.address}
      placeholder="Select Address"
      autoComplete="off"
      silent={true}
      options={addressList}
    />
    <InputField name="phone" value={data.phone} placeholder="Phone" autoComplete="off" />
    <InputField
      name="item"
      value={data.item}
      placeholder="Select Item"
      autoComplete="off"
      silent={true}
      options={itemsList}
      caseMode="smartTitleChars"
      allowedChars={['+']}
    />
    <InputField
      name="total_qty"
      inputmode="decimal"
      caseMode="none"
      value={data.total_qty}
      placeholder="Total Quantity"
      autoComplete="off"
    />
    <InputField
      name="amount_type"
      bind:value={data.amount_type}
      placeholder="Amount Type"
      autoComplete="off"
      options={amountType}
    />
    {#if amountType?.includes(data.amount_type) && data.amount_type !== 'AC'}
      <InputField
        caseMode="none"
        name="amount"
        value={data.amount}
        placeholder="Amount"
        autoComplete="off"
      />
      <InputField
        caseMode="none"
        name="advance"
        value={data.advance}
        placeholder="Advance"
        autoComplete="off"
      />
      <InputField
        caseMode="none"
        name="discount"
        value={data.discount}
        placeholder="Discount"
        autoComplete="off"
      />
    {/if}
    <InputField
      name="notes"
      value={data.notes}
      placeholder="Note"
      autoComplete="off"
      caseMode="para"
    />
    <CheckBoxField
      name="is_owner_order"
      value={data.is_owner_order}
      placeholder="Is Owner Order?"
    />
    <CheckBoxField name="tracktor_only" value={data.tracktor_only} placeholder="Tractor Only" />
  </Form>
</Model>
