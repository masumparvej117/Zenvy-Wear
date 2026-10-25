/**
 * Core business and calculation rules for ZENVY WEAR e-commerce
 */

export interface CartCalculationItem {
  price: number;
  discountPrice?: number;
  quantity: number;
}

export interface CartTotalsResult {
  subtotal: number;
  deliveryFee: number;
  total: number;
  isFreeDelivery: boolean;
  qualifiesForFreeThresholdRemaining: number;
}

/**
 * Calculates subtotal, delivery charges, and final order total in BDT
 */
export function calculateCartTotals(
  items: CartCalculationItem[],
  cityZone: 'inside_dhaka' | 'outside_dhaka' = 'inside_dhaka',
  freeShippingThreshold = 2000,
  feeDhaka = 70,
  feeOutside = 130
): CartTotalsResult {
  const subtotal = items.reduce((acc, item) => {
    const unitPrice =
      typeof item.discountPrice === 'number' && item.discountPrice > 0
        ? item.discountPrice
        : item.price;
    const qty = Math.max(0, Math.floor(item.quantity || 0));
    return acc + unitPrice * qty;
  }, 0);

  const isFreeDelivery = subtotal >= freeShippingThreshold && subtotal > 0;
  const baseFee = cityZone === 'inside_dhaka' ? feeDhaka : feeOutside;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : baseFee;
  const total = subtotal + deliveryFee;
  const qualifiesForFreeThresholdRemaining = Math.max(0, freeShippingThreshold - subtotal);

  return {
    subtotal,
    deliveryFee,
    total,
    isFreeDelivery,
    qualifiesForFreeThresholdRemaining,
  };
}

/**
 * Generates an uppercase alphanumeric order reference
 */
export function generateOrderReference(prefix = 'ZW'): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${year}-${randomChars}`;
}

/**
 * Validates Bangladeshi phone numbers (e.g. 01757391262, +8801757391262, 8801757391262)
 */
export function validateBangladeshPhone(rawPhone: string): {
  isValid: boolean;
  formatted: string;
} {
  const cleaned = rawPhone.replace(/[\s\-()]/g, '');
  // Matches +8801[3-9]XXXXXXXX, 8801[3-9]XXXXXXXX, or 01[3-9]XXXXXXXX
  const bdRegex = /^(?:\+?88)?(01[3-9]\d{8})$/;
  const match = cleaned.match(bdRegex);

  if (match && match[1]) {
    return {
      isValid: true,
      formatted: `+880${match[1].slice(1)}`,
    };
  }
  return {
    isValid: false,
    formatted: cleaned,
  };
}

/**
 * Builds a WhatsApp pre-filled order URL for direct communication
 */
export function buildWhatsAppOrderUrl(params: {
  phone: string;
  items: Array<{
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  cityZone?: string;
  total?: number;
}): string {
  const cleanPhone = params.phone.replace(/[^0-9]/g, '');
  let message = `*ZENVY WEAR Order Request*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (params.items.length === 0) {
    message += `Hello ZENVY WEAR, I would like to inquire about your modern fashion collection.\n`;
  } else {
    message += `I want to order the following items:\n\n`;
    params.items.forEach((item, idx) => {
      message += `${idx + 1}. *${item.name}*\n`;
      message += `   Size: ${item.size} | Color: ${item.color}\n`;
      message += `   Qty: ${item.quantity} × ৳${item.price} = ৳${item.quantity * item.price}\n\n`;
    });
  }

  if (typeof params.total === 'number' && params.total > 0) {
    message += `*Total Amount:* ৳${params.total.toLocaleString('en-US')}\n`;
  }

  if (params.customerName) {
    message += `\n*Customer Details:*\n`;
    message += `Name: ${params.customerName}\n`;
    if (params.customerPhone) message += `Phone: ${params.customerPhone}\n`;
    if (params.deliveryAddress) message += `Address: ${params.deliveryAddress}\n`;
    if (params.cityZone) {
      message += `Zone: ${params.cityZone === 'inside_dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}\n`;
    }
  }

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Please confirm my order and availability. Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Validates stock availability for an incoming order
 */
export function validateOrderStock(
  orderItems: Array<{ productId: string; quantity: number }>,
  productCatalog: Array<{ id: string; name: string; stock: number; status: string }>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const item of orderItems) {
    const product = productCatalog.find((p) => p.id === item.productId);
    if (!product) {
      errors.push(`Product with ID "${item.productId}" does not exist.`);
      continue;
    }
    if (product.status !== 'active') {
      errors.push(`Product "${product.name}" is currently inactive.`);
      continue;
    }
    if (product.stock < item.quantity) {
      errors.push(
        `Insufficient stock for "${product.name}". Requested ${item.quantity}, but only ${product.stock} available.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
