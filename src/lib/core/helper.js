import { fetchSingleAddressByName } from "$lib/entity/address/address.dal";
import { fetchSingleItemByName } from "$lib/entity/items/items.dal";

export function calculateAmount(address, item, qty) {
  address = typeof address === 'object' && address !== null ? address : fetchSingleAddressByName(address)
  item = typeof item === 'object' && item !== null ? item : fetchSingleItemByName(item)

  let creditAmount = 0;
  // Get base item amount based on quantity
  creditAmount = getAmountByItemQuantity(item, qty);

  if (creditAmount == 0) {
    return { success: false, message: `Price is missing for: "${item.name}"` }
  }

  // Only process delivery if address exists
  if (address && address.name && address.name.trim().length > 0) {
    const deliveryCharge = getDeliveryCharge(qty, address);

    if (deliveryCharge === 0) {
      // SET ENTIRE AMOUNT TO 0 when delivery is required but charge is missing
      creditAmount = 0;
      return { success: false, message: `Delivery Charges Missing for Address: "${address.name}"` }
    } else {
      if (creditAmount === 0) {
        return { success: false, message: `Price is Missing for Item: "${item.name}"` }
      } else {
        creditAmount = creditAmount + deliveryCharge;
        console.log(`Credit Amount: ${creditAmount}, Delivery Charge: ${deliveryCharge}`);
      }
    }
  }

  // RoundOff Amount
  creditAmount = roundAmount(creditAmount);
  return { success: true, data: creditAmount }
}

// Helper function to get amount based on item quantity
function getAmountByItemQuantity(item, qty) {
  // Convert qty to number if it's a string
  const quantity = parseFloat(qty) || 0;

  // Determine which price bracket to use based on quantity
  if (quantity <= 0.25) {
    return parseFloat(item.price_025) || 0;
  } else if (quantity <= 0.5) {
    return parseFloat(item.price_050) || 0;
  } else if (quantity <= 1.0) {
    return parseFloat(item.price_100) || 0;
  } else if (quantity <= 1.5) {
    return parseFloat(item.price_150) || 0;
  } else if (quantity <= 2.0) {
    return parseFloat(item.price_200) || 0;
  } else {
    // Handle quantities above 2.0 - you might want to add logic for this
    // For now, return the maximum price or calculate proportionally
    return parseFloat(item.price_200) * (quantity / 2) || 0;
  }
}

// Helper function to get delivery charge based on quantity and address
function getDeliveryCharge(qty, address) {
  const quantity = parseFloat(qty) || 0;

  // Determine which delivery charge bracket to use
  if (quantity <= 0.25) {
    return parseFloat(address.delivery_025) || 0;
  } else if (quantity <= 1.0) {
    // Note: In your address data, you have delivery_050_100 which likely covers 0.5 to 1.0
    return parseFloat(address.delivery_050_100) || 0;
  } else {
    // For quantities above 1.0, use delivery_max
    return parseFloat(address.delivery_max) || 0;
  }
}

// Helper function to round amount (you can customize this based on your needs)
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