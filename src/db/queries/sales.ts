import { db } from '@/src/db';
import { ordersTable, orderItemsTable, productsTable } from '@/src/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';

const PAID_FILTER = and(
  eq(ordersTable.paymentStatus, 'paid'),
  eq(ordersTable.orderStatus, 'paid')
);

/**
 * Product sales summary: all products with total qty sold and total value
 */
export async function getProductSalesSummary(tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();

  const items = await db
    .select({
      productId: orderItemsTable.productId,
      productName: orderItemsTable.productName,
      totalQty: sql<number>`cast(coalesce(sum(${orderItemsTable.quantity}), 0) as int)`,
      totalValue: sql<string>`coalesce(sum(${orderItemsTable.price}::numeric * ${orderItemsTable.quantity}), 0)::text`,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
    .where(and(eq(ordersTable.tenantId, tid), PAID_FILTER))
    .groupBy(orderItemsTable.productId, orderItemsTable.productName);

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      isActive: productsTable.isActive,
    })
    .from(productsTable)
    .where(eq(productsTable.tenantId, tid))
    .orderBy(productsTable.name);

  const salesMap = new Map(
    items.map((i) => [
      i.productId,
      { totalQty: Number(i.totalQty), totalValue: parseFloat(i.totalValue) },
    ])
  );

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: parseFloat(String(p.price)),
    isActive: p.isActive,
    totalQty: salesMap.get(p.id)?.totalQty ?? 0,
    totalValue: salesMap.get(p.id)?.totalValue ?? 0,
  }));
}

/**
 * Top 5 customers by total spent (registered + guests)
 */
export async function getTopCustomers(limit: number = 5, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();

  const orders = await db
    .select({
      customerId: ordersTable.customerId,
      fullName: ordersTable.fullName,
      email: ordersTable.email,
      phoneNumber: ordersTable.phoneNumber,
      totalAmount: ordersTable.totalAmount,
    })
    .from(ordersTable)
    .where(and(eq(ordersTable.tenantId, tid), PAID_FILTER));

  const byKey = new Map<
    string,
    { key: string; fullName: string; email: string | null; totalSpent: number; orderCount: number }
  >();

  for (const o of orders) {
    const key = o.customerId != null ? `cust:${o.customerId}` : `guest:${o.email ?? ''}:${o.fullName}:${o.phoneNumber ?? ''}`;
    const existing = byKey.get(key);
    const amount = parseFloat(String(o.totalAmount));
    if (existing) {
      existing.totalSpent += amount;
      existing.orderCount += 1;
    } else {
      byKey.set(key, {
        key,
        fullName: o.fullName,
        email: o.email,
        totalSpent: amount,
        orderCount: 1,
      });
    }
  }

  const sorted = [...byKey.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  return sorted.slice(0, limit);
}

/**
 * Sales over time for graph (last 12 months by default)
 */
export async function getSalesOverTime(months: number = 12, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();

  const rows = await db
    .select({
      month: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM')`,
      total: sql<string>`sum(${ordersTable.totalAmount}::numeric)::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .where(and(eq(ordersTable.tenantId, tid), PAID_FILTER))
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`);

  const now = new Date();
  const result: { month: string; monthLabel: string; sales: number; orders: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const row = rows.find((r) => r.month === monthKey);
    result.push({
      month: monthKey,
      monthLabel,
      sales: row ? parseFloat(row.total) : 0,
      orders: row ? row.count : 0,
    });
  }

  return result;
}

/**
 * Top selling products (by quantity sold)
 */
export async function getTopSellingProducts(limit: number = 5, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();

  const rows = await db
    .select({
      productId: orderItemsTable.productId,
      productName: orderItemsTable.productName,
      totalQty: sql<number>`cast(sum(${orderItemsTable.quantity}) as int)`,
      totalValue: sql<string>`sum(${orderItemsTable.price}::numeric * ${orderItemsTable.quantity})::text`,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
    .where(and(eq(ordersTable.tenantId, tid), PAID_FILTER))
    .groupBy(orderItemsTable.productId, orderItemsTable.productName)
    .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
    .limit(limit);

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    totalQty: r.totalQty,
    totalValue: parseFloat(r.totalValue),
  }));
}

/**
 * Worst selling products (by quantity - products with fewest sales)
 * Includes products with 0 sales
 */
export async function getWorstSellingProducts(limit: number = 5, tenantId?: string) {
  const summary = await getProductSalesSummary(tenantId);
  const sorted = [...summary].sort((a, b) => a.totalQty - b.totalQty);
  return sorted.slice(0, limit).map((p) => ({
    productId: p.id,
    productName: p.name,
    totalQty: p.totalQty,
    totalValue: p.totalValue,
  }));
}
