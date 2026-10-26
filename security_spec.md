# Security Specification: ZENVY WEAR Firestore Rules

## 1. Data Invariants
1. Products and Categories: Public read access for customers (`status == 'active'` for products or admin read for all); mutations strictly restricted to authenticated Admins verified in `/admins/$(request.auth.uid)` or bootstrapped admin email (`masumparvej117@gmail.com`, `zenvywear75@gmail.com`).
2. Orders:
   - Create: Anyone (guest or authenticated customer) can place an order, but `orderRef`, `customerName`, `customerPhone`, `deliveryAddress`, `cityZone`, `items`, `total`, and `status == 'Pending'` must satisfy strict type/size bounds.
   - Read: If the order has a `userId`, only that user or an admin can read it. Guests access order confirmations securely via their unique reference or orderId lookup. List queries require `resource.data.userId == request.auth.uid` for customers, or admin privilege.
   - Update: Only Admins can update order status (e.g., from 'Pending' to 'Confirmed', 'Shipped', etc.). Customers cannot modify placed orders.
   - Delete: Orders cannot be deleted by customers; only admins can delete or archive orders.
3. Users (`users/{userId}`):
   - Only the authenticated owner (`request.auth.uid == userId`) or an admin can read/write their profile.
   - Customers cannot escalate their role to `admin` upon create or update.
4. Admins (`admins/{adminId}`):
   - Read: Only authenticated users checking admin status or admins themselves.
   - Write: Only verified system admins.
5. Settings (`settings/{settingId}`):
   - Public read for store display (delivery thresholds, announcements).
   - Write strictly restricted to Admins.

## 2. Dirty Dozen Payloads (Designed to Break Rules)
1. **Payload 1 (Ghost Field Privilege Escalation)**: Attacker sends `{ id: 'u1', name: 'Hacker', email: 'h@h.com', role: 'admin' }` to `/users/hackerUid`. Expected: REJECTED (Role self-assignment forbidden).
2. **Payload 2 (Unauthenticated Product Deletion)**: Unauthenticated client sends DELETE to `/products/prod_m_01`. Expected: REJECTED (Admin required).
3. **Payload 3 (Arbitrary Order Price Manipulation)**: Attacker submits order with negative total `{ total: -500 }`. Expected: REJECTED (Validation bounds fail).
4. **Payload 4 (Order Status Shortcutting by Customer)**: Non-admin sends update to set order status directly to `Delivered`. Expected: REJECTED (Customer cannot modify order status).
5. **Payload 5 (Huge ID Poisoning)**: Document path with 2KB string for `{productId}`. Expected: REJECTED (`isValidId()` constraint).
6. **Payload 6 (PII Order Scraping via Blanket List)**: Authenticated user queries all orders without `where('userId', '==', request.auth.uid)`. Expected: REJECTED (List rule enforces `resource.data.userId == request.auth.uid`).
7. **Payload 7 (Junk Data Injection in Products)**: Admin/attacker sends product without required `price` or with `name` exceeding 200 characters. Expected: REJECTED (`isValidProduct()` schema check).
8. **Payload 8 (Settings Tampering)**: Customer attempts to update `settings/general` to set `deliveryFeeDhaka: 0`. Expected: REJECTED (Admin required).
9. **Payload 9 (Cross-User Profile Read)**: User A attempts to read `users/userB`. Expected: REJECTED (Owner or Admin only).
10. **Payload 10 (Spoofed Unverified Admin)**: Request with token claiming admin email but `email_verified == false`. Expected: REJECTED (`email_verified == true` mandate).
11. **Payload 11 (Shadow Field in Category)**: Write to category with `{ ghostField: 'exploit' }`. Expected: REJECTED (`hasOnly` strict keys).
12. **Payload 12 (Direct Admin Document Creation)**: Non-admin attempts to create a document in `/admins/{uid}`. Expected: REJECTED (Only existing admin can write).
