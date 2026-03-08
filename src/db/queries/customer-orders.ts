import { db } from '@/src/db';
import { ordersTable, orderItemsTable } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';

/**
 * Get all orders for a specific customer with their items
 */
export async function getCustomerOrders(customerId: number, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const orders = await db
    .select()
    .from(ordersTable)
    .where(and(
      eq(ordersTable.tenantId, tid),
      eq(ordersTable.customerId, customerId)
    ))
    .orderBy(desc(ordersTable.createdAt));
  
  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));
      
      return { ...order, items };
    })
  );
  
  return ordersWithItems;
}

/**
 * Get order with items for a customer
 */
export async function getCustomerOrderWithItems(customerId: number, orderId: number, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(
      eq(ordersTable.id, orderId),
      eq(ordersTable.tenantId, tid)
    ));
  
  if (!order || order.customerId !== customerId) {
    return null;
  }
  
  // Get order items
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));
  
  return { ...order, items };
}
