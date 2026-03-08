import { db } from '@/src/db';
import { ordersTable, orderItemsTable } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';

/**
 * Create a new order with items
 */
export async function createOrder(
  orderData: {
    customerId?: number; // Link to customer account if they created one
    fullName: string;
    phoneNumber: string;
    email?: string;
    shippingCountry?: string;
    shippingIsland?: string;
    shippingAddress?: string;
    totalAmount: string;
  },
  items: {
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
  }[],
  tenantId?: string
) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [order] = await db
    .insert(ordersTable)
    .values({
      tenantId: tid,
      customerId: orderData.customerId || null,
      fullName: orderData.fullName,
      phoneNumber: orderData.phoneNumber,
      email: orderData.email || null,
      shippingCountry: orderData.shippingCountry || null,
      shippingIsland: orderData.shippingIsland || null,
      shippingAddress: orderData.shippingAddress || null,
      totalAmount: orderData.totalAmount,
      orderStatus: 'pending',
      paymentStatus: 'pending',
    })
    .returning();

  if (!order) {
    throw new Error('Failed to create order');
  }

  // Insert order items
  const orderItems = await db
    .insert(orderItemsTable)
    .values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        price: item.price.toString(),
        quantity: item.quantity,
      }))
    )
    .returning();

  return { order, orderItems };
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: number, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.tenantId, tid)));
  return order ?? null;
}

/**
 * Update order payment status (gateway-agnostic: BPC, etc.)
 */
export async function updateOrderPaymentStatus(
  orderId: number,
  data: {
    paymentStatus: string;
    orderStatus: string;
    gatewayPaymentId?: string;
    gatewayChargeId?: string;
    paymentGateway?: string;
  },
  tenantId?: string
) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updatedOrder] = await db
    .update(ordersTable)
    .set({
      paymentStatus: data.paymentStatus,
      orderStatus: data.orderStatus,
      gatewayPaymentId: data.gatewayPaymentId,
      gatewayChargeId: data.gatewayChargeId,
      paymentGateway: data.paymentGateway ?? 'bpc',
      updatedAt: new Date(),
    })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.tenantId, tid)))
    .returning();
  return updatedOrder;
}

/**
 * Set gateway session/payment ID on order (after creating BPC session)
 */
export async function updateOrderGatewayPaymentId(orderId: number, gatewayPaymentId: string, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updated] = await db
    .update(ordersTable)
    .set({ gatewayPaymentId, updatedAt: new Date() })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.tenantId, tid)))
    .returning();
  return updated ?? null;
}

/**
 * Get order by gateway session/payment ID (for webhooks)
 */
export async function getOrderByGatewayPaymentId(gatewayPaymentId: string) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.gatewayPaymentId, gatewayPaymentId));
  return order ?? null;
}

/**
 * Get order with items
 */
export async function getOrderWithItems(orderId: number) {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return { ...order, items };
}

