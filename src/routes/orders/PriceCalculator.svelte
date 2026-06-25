<script>
  // import Button from '$lib/components/Button.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import { calculateAmount, getDeliveryCharge } from '$lib/core/helper';
  import { formatNumber } from '$lib/utils/number';

  const { address, items } = $props();

  let data = $state({
    address: '',
    input: [
      { item: '', qty: '', load: 1, tip: '' },
      { item: '', qty: '', load: 1, tip: '' },
    ],
    output: [],
  });

  function addRowIfNeeded() {
    const lastRow = data.input[data.input.length - 1];

    if (lastRow.item && lastRow.qty && lastRow.load) {
      data.input.push({
        item: '',
        qty: '',
        load: 1,
        tip: '',
      });
    }
  }

  function calculatePrice() {
    addRowIfNeeded();
    const addressData = address.find((a) => a.name === data.address);
    const output = [];
    data.input.forEach((input) => {
      const itemData = items.find((i) => i.name === input.item);
      if (itemData && input.qty) {
        const amount = calculateAmount(addressData, itemData, input.qty);
        if (amount.success === false) {
          console.error(amount.message);
        } else {
          output.push({
            item: input.item,
            qty: input.qty,
            load: input.load,
            price: itemData.price.unit100,
            deliveryCharge: addressData ? getDeliveryCharge(input.qty, addressData) : 0,
            tip: addressData ? input.tip : 0,
            amount: amount.data,
            amountWithTip:
              amount.data + (addressData ? (input.tip ? parseFloat(input.tip) : 0) : 0),
            totalAmount:
              (amount.data + (input.tip ? parseFloat(input.tip) : 0)) * parseInt(input.load),
          });
        }
      }
    });
    data.output = output; // ← trigger reactivity
  }
</script>

<div class="w-xl p-5">
  <h1 class="mb-5 text-center text-2xl font-bold">Price Calculator</h1>
  <InputField
    placeholder="Enter Address"
    options={address.map((a) => a.name)}
    bind:value={data.address}
    onBlur={calculatePrice}
  />
  {#each data.input as input, index (index)}
    <div class="flex w-full flex-1 gap-3">
      <InputField
        placeholder="Enter Item"
        options={items.map((i) => i.name)}
        class="w-full"
        bind:value={input.item}
        onBlur={calculatePrice}
      />
      <InputField
        placeholder="Qty"
        class="w-50!"
        caseMode="none"
        bind:value={input.qty}
        onBlur={(value) => {
          input.tip = parseFloat(value) > 1 ? 100 : 50;
          calculatePrice();
        }}
      />
      <InputField
        placeholder="Load"
        class="mb-3! w-50!"
        bind:value={input.load}
        onBlur={calculatePrice}
      />
      <InputField
        tabindex="-1"
        placeholder="Tip"
        class="mb-3! w-50!"
        bind:value={input.tip}
        onBlur={calculatePrice}
      />
    </div>
  {/each}

  {#if data.output.length}
    <div class="my-5 overflow-x-auto">
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-1 text-left">Item</th>
            <th class="border px-1 text-right">Qty</th>
            <th class="border px-1 text-right">Load</th>
            <th class="border px-1 text-right">Price</th>
            <th class="border px-1 text-right">Delivery</th>
            <th class="border px-1 text-right">Tip</th>
            <th class="border px-1 text-right">Amount</th>
            <th class="border px-1 text-right">Amt + Tip</th>
            <th class="border px-1 text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {#each data.output as output, index (index)}
            <tr class="hover:bg-gray-50">
              <td class="border px-1">{output.item}</td>
              <td class="border px-1 text-right">{output.qty}</td>
              <td class="border px-1 text-right">{output.load}</td>
              <td class="border px-1 text-right">{formatNumber(output.price)}</td>
              <td class="border px-1 text-right">{formatNumber(output.deliveryCharge)}</td>
              <td class="border px-1 text-right">{formatNumber(output.tip)}</td>
              <td class="border px-1 text-right">{formatNumber(output.amount)}</td>
              <td class="border px-1 text-right">{formatNumber(output.amountWithTip)}</td>
              <td class="border px-1 text-right">{formatNumber(output.totalAmount)}</td>
            </tr>
          {/each}
        </tbody>

        <tfoot>
          <tr class="bg-gray-100 font-bold">
            <td colspan="3" class="border px-1 text-right"> Grand Total </td>
            <td class="border px-1 text-right">
              {formatNumber(data.output.reduce((sum, row) => sum + row.price, 0))}
            </td>
            <td class="border px-1 text-right">
              {formatNumber(data.output.reduce((sum, row) => sum + row.deliveryCharge, 0))}
            </td>
            <td class="border px-1 text-right">
              {formatNumber(data.output.reduce((sum, row) => sum + row.tip, 0))}
            </td>
            <td class="border px-1 text-right">
              {formatNumber(data.output.reduce((sum, row) => sum + row.amount, 0))}
            </td>
            <td class="border px-1 text-right">
              {formatNumber(data.output.reduce((sum, row) => sum + row.amountWithTip, 0))}
            </td>
            <td class="border px-1 text-right">
              {formatNumber(data.output.reduce((sum, row) => sum + row.totalAmount, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  {/if}

  <!-- <Button class="dark">Copy To Create Order</Button> -->
</div>
