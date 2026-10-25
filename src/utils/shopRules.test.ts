import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  generateOrderReference,
  validateBangladeshPhone,
  buildWhatsAppOrderUrl,
  validateOrderStock,
} from './shopRules';

test('calculateCartTotals computes subtotal and applies delivery fee for inside Dhaka', () => {
  const items = [
    { price: 650, quantity: 2 }, // 1300
    { price: 1200, discountPrice: 950, quantity: 1 }, // 950
  ];
  // Subtotal = 2250, threshold = 2000 -> Free delivery
  const res = calculateCartTotals(items, 'inside_dhaka', 2000, 70, 130);
  assert.equal(res.subtotal, 2250);
  assert.equal(res.deliveryFee, 0);
  assert.equal(res.isFreeDelivery, true);
  assert.equal(res.total, 2250);
});

test('calculateCartTotals charges delivery fee below threshold for outside Dhaka', () => {
  const items = [{ price: 800, quantity: 1 }];
  const res = calculateCartTotals(items, 'outside_dhaka', 2000, 70, 130);
  assert.equal(res.subtotal, 800);
  assert.equal(res.deliveryFee, 130);
  assert.equal(res.isFreeDelivery, false);
  assert.equal(res.total, 930);
  assert.equal(res.qualifiesForFreeThresholdRemaining, 1200);
});

test('generateOrderReference produces formatted order reference string', () => {
  const ref = generateOrderReference('ZW');
  assert.match(ref, /^ZW-\d{2}-[A-Z0-9]{5}$/);
});

test('validateBangladeshPhone handles valid and invalid phone numbers', () => {
  const valid1 = validateBangladeshPhone('01757391262');
  assert.equal(valid1.isValid, true);
  assert.equal(valid1.formatted, '+8801757391262');

  const valid2 = validateBangladeshPhone('+8801812345678');
  assert.equal(valid2.isValid, true);
  assert.equal(valid2.formatted, '+8801812345678');

  const invalid = validateBangladeshPhone('12345');
  assert.equal(invalid.isValid, false);
});

test('buildWhatsAppOrderUrl encodes message and includes items and total', () => {
  const url = buildWhatsAppOrderUrl({
    phone: '+8801757391262',
    items: [
      {
        name: "Men's Heavyweight Cotton T-Shirt",
        size: 'L',
        color: 'Onyx Black',
        quantity: 2,
        price: 850,
      },
    ],
    total: 1770,
    customerName: 'Rahim Khan',
  });
  assert.ok(url.startsWith('https://wa.me/8801757391262?text='));
  assert.ok(url.includes('Rahim%20Khan'));
  assert.ok(url.includes('Heavyweight'));
});

test('validateOrderStock catches missing products, inactive status, and insufficient quantity', () => {
  const catalog = [
    { id: 'p1', name: 'Tee A', stock: 10, status: 'active' },
    { id: 'p2', name: 'Tee B', stock: 2, status: 'active' },
    { id: 'p3', name: 'Tee C', stock: 5, status: 'inactive' },
  ];

  const good = validateOrderStock([{ productId: 'p1', quantity: 3 }], catalog);
  assert.equal(good.isValid, true);
  assert.equal(good.errors.length, 0);

  const outOfStock = validateOrderStock([{ productId: 'p2', quantity: 5 }], catalog);
  assert.equal(outOfStock.isValid, false);
  assert.match(outOfStock.errors[0], /Insufficient stock/);

  const inactive = validateOrderStock([{ productId: 'p3', quantity: 1 }], catalog);
  assert.equal(inactive.isValid, false);
  assert.match(inactive.errors[0], /inactive/);
});
