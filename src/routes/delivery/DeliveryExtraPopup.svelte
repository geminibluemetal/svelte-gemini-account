<script>
  import { deserialize } from '$app/forms';
  import { getFormattedDate } from '$lib/utils/dateTime';
  import { formatFixed, formatNumber } from '$lib/utils/number';
  import { timeAgoSmart } from '$lib/utils/relativeTime';

  const { overRowRect = null, overRowItem = {}, item = [], address = [] } = $props();

  let position = $state('bottom');
  let topPositioin = $state(0);
  let popupElement = $state(null);
  let displayData = $state({});

  function quantityMap(quantity) {
    if (quantity > 0 && ![0.25, 0.5, 1, 1.5, 2].includes(quantity)) {
      return null;
    }
    if (quantity <= 0.25) {
      return 'unit025';
    } else if (quantity <= 0.5) {
      return 'unit050';
    } else if (quantity <= 1.0) {
      return 'unit100';
    } else if (quantity <= 1.5) {
      return 'unit150';
    } else if (quantity <= 2.0) {
      return 'unit200';
    } else {
      return null;
    }
  }

  function chargeMap(quantity) {
    if (quantity <= 0.25) {
      return 'chargeHalf';
    } else if (quantity <= 1.0) {
      return 'chargeSingle';
    } else if (quantity > 1.0) {
      return 'chargeMax';
    } else {
      return null;
    }
  }

  function roundAmount(amount) {
    if (!amount) return 0;

    const rounded = Math.floor(amount);
    const remainder = rounded % 100;

    if (remainder <= 20) {
      return rounded - remainder;
    } else if (remainder <= 70) {
      return rounded - remainder + 50;
    } else {
      return rounded - remainder + 100;
    }
  }

  async function reUpdatePosition() {
    const popupRect = popupElement?.getBoundingClientRect();
    const halfSplit = screen.availHeight / 2;
    if (overRowRect) {
      position = overRowRect.top < halfSplit ? 'top' : 'bottom';
      topPositioin =
        overRowRect.top < halfSplit
          ? overRowRect.top + 35
          : overRowRect.top - popupRect?.height - 10;
    }

    if (overRowItem.deliveryItem && overRowItem.deliveryQuantity && !overRowItem.orderNumber) {
      displayData.order = null;
      const amountData = {};
      const Item = overRowItem.deliveryItem;
      const Address = overRowItem.address;
      const Quantity = overRowItem.deliveryQuantity;
      const itemDetail = item.find((i) => i.name == Item);
      const addressDetail = address.find((a) => a.name == Address);
      const itemPrice =
        itemDetail.price[quantityMap(Quantity)] || itemDetail.price.unit100 * Quantity;
      const deliveryCharge =
        addressDetail?.deliveryCharges[chargeMap(Quantity)] * Math.ceil(Quantity);

      amountData.Item = Item;
      if (Address) amountData.Address = Address;
      if (Quantity) amountData.Quantity = Quantity;
      amountData['space1'] = 'SPACE';
      if (Item) amountData['Item Price (1 Unit)'] = formatNumber(itemDetail.price.unit100);
      if (Address)
        amountData['Delivery Charge (1 Unit)'] = formatNumber(
          addressDetail?.deliveryCharges.chargeSingle,
        );
      if (Address)
        amountData['Delivery Charge (2 Unit)'] = formatNumber(
          addressDetail?.deliveryCharges.chargeMax,
        );
      amountData['space2'] = 'SPACE';
      if (Item) amountData['Meterial Amount'] = formatNumber(itemPrice);
      if (Address) amountData['Delivery Charge'] = formatNumber(deliveryCharge);
      amountData['Total Amount'] = formatNumber(itemPrice + (deliveryCharge || 0));
      amountData['Final Amount with (Rounding)'] = formatNumber(
        roundAmount(itemPrice + (deliveryCharge || 0)),
      );
      displayData.amount = amountData;
    } else {
      displayData.amount = null;
      let result = await transportAction('?/deliveryOverRow', {
        orderNumber: overRowItem.orderNumber,
      });
      if (result.type == 'success') {
        if (result.data.order) {
          displayData.order = {
            'Order date': `${getFormattedDate(result.data.order.createdAt)} (${timeAgoSmart(result.data.order.createdAt)})`,
            'Order number': result.data.order.orderNumber,
            'Party name': result.data.order.partyName,
            Address: result.data.order.address,
            // Phone: result.data.order.phone,
            Item: result.data.order.item,
            'Total Quantity': formatFixed(result.data.order.totalQty),
            'Delivered Quantity': formatFixed(result.data.order.deliveredQty),
            'Balance Quantity': formatFixed(result.data.order.balanceQty),
            'Amount Type': result.data.order.amountType,
          };

          if (result.data.order.amount)
            displayData.order.Amount = formatNumber(result.data.order.amount);
          if (result.data.order.advance)
            displayData.order.Advance = formatNumber(result.data.order.advance);
          if (result.data.order.discount)
            displayData.order.Discount = formatNumber(result.data.order.discount);
          if (result.data.order.balance)
            displayData.order.Balance = formatNumber(result.data.order.balance);

          displayData.order = {
            ...displayData.order,
            Status: result.data.order.status,
            Sign: result.data.order.sign ? 'Yes' : 'No',
            'Is Owner Order': result.data.order.isOwnerOrder ? 'Yes' : 'No',
            'Tracktor Only': result.data.order.tracktorOnly ? 'Yes' : 'No',
            Notes: result.data.order.notes,
            DSV: result.data.order.deliverySheetVerified,
          };
        } else {
          displayData.order = null;
        }
      } else {
        displayData.order = null;
        displayData.amount = null;
      }
    }
  }

  async function transportAction(url, data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return deserialize(await response.text());
  }

  $effect(() => {
    reUpdatePosition();
  });
</script>

{#if displayData?.order || displayData?.amount}
  <div class="absolute left-1/4 z-50 w-sm" style:top={`${topPositioin}px`} bind:this={popupElement}>
    <div class="rounded-lg bg-white p-3 shadow-[0_0_20px_10px_rgba(0,0,0,0.3)]">
      <div class="flex gap-2">
        {#if displayData?.order}
          <div class="flex-1 rounded border-2 p-2">
            <div class="pb-1 text-center font-bold">Coresponding Order</div>
            {#each Object.entries(displayData.order) as [key, value] (key)}
              <div class="flex justify-between border-t border-gray-400">
                <span>{key}</span> <span>{value}</span>
              </div>
            {/each}
          </div>
        {/if}
        {#if displayData?.amount}
          <div class="flex-1 rounded border-2 p-2">
            <div class="pb-1 text-center font-bold">Amount Calculation</div>
            {#each Object.entries(displayData.amount) as [key, value] (key)}
              {#if value == 'SPACE'}
                <div class="mb-10 w-full border-t border-gray-400"></div>
              {:else}
                <div class="flex justify-between border-t border-gray-400">
                  <span>{key}</span> <span>{value}</span>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    </div>
    {#if position == 'top'}
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-10 border-transparent border-t-white border-l-white shadow-[-15px_-15px_15px_5px_rgba(0,0,0,0.1)]"
      ></div>
    {:else}
      <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 border-10 border-transparent border-r-white border-b-white shadow-[15px_15px_15px_5px_rgba(0,0,0,0.1)]"
      ></div>
    {/if}
  </div>
{/if}
