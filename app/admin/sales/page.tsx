import { redirect } from 'next/navigation';
import { requireAdminWithTenantAccess } from '@/lib/admin-auth';
import {
  getProductSalesSummary,
  getTopCustomers,
  getSalesOverTime,
  getTopSellingProducts,
  getWorstSellingProducts,
} from '@/src/db/queries/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesChart } from './SalesChart';

export default async function AdminSalesPage() {
  try {
    await requireAdminWithTenantAccess();
  } catch {
    redirect('/shop');
  }
  let productSummary: Awaited<ReturnType<typeof getProductSalesSummary>>;
  let topCustomers: Awaited<ReturnType<typeof getTopCustomers>>;
  let salesOverTime: Awaited<ReturnType<typeof getSalesOverTime>>;
  let topProducts: Awaited<ReturnType<typeof getTopSellingProducts>>;
  let worstProducts: Awaited<ReturnType<typeof getWorstSellingProducts>>;

  try {
    [productSummary, topCustomers, salesOverTime, topProducts, worstProducts] = await Promise.all([
      getProductSalesSummary(),
      getTopCustomers(5),
      getSalesOverTime(12),
      getTopSellingProducts(5),
      getWorstSellingProducts(5),
    ]);
  } catch (error) {
    console.error('Error loading sales data:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-2xl bg-red-50 p-8 border-2 border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Sales</h1>
          <p className="text-red-800">Failed to load sales data. Check the console for details.</p>
          <p className="text-sm text-red-600 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const grandTotalQty = productSummary.reduce((s, p) => s + p.totalQty, 0);
  const grandTotalValue = productSummary.reduce((s, p) => s + p.totalValue, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-foreground mb-2">Sales</h1>
        <p className="text-lg text-muted-foreground">
          Product sales summary, top customers, and sales trends.
        </p>
      </div>

      {/* Product Summary Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Product Sales Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            All products with total quantity sold and value (paid orders only)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Qty Sold</th>
                  <th className="py-3 px-4 font-semibold text-right">Value</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {productSummary.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-right">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">{p.totalQty}</td>
                    <td className="py-3 px-4 text-right font-medium">${p.totalValue.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold bg-muted/30">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">—</td>
                  <td className="py-3 px-4 text-right">{grandTotalQty}</td>
                  <td className="py-3 px-4 text-right">${grandTotalValue.toFixed(2)}</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Top 5 Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Top 5 Customers</CardTitle>
            <p className="text-sm text-muted-foreground">
              By total spent (registered accounts and guests)
            </p>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-muted-foreground">No paid orders yet.</p>
            ) : (
              <ul className="space-y-3">
                {topCustomers.map((c, i) => (
                  <li
                    key={c.key}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono w-6">{i + 1}.</span>
                      <div>
                        <p className="font-medium">{c.fullName}</p>
                        {c.email && (
                          <p className="text-sm text-muted-foreground">{c.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${c.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{c.orderCount} orders</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sales Trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last 12 months with trendline
            </p>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesOverTime} />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Top 5 Selling Products</CardTitle>
            <p className="text-sm text-muted-foreground">By quantity sold</p>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="space-y-3">
                {topProducts.map((p, i) => (
                  <li
                    key={p.productId}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono w-6">{i + 1}.</span>
                      <span className="font-medium">{p.productName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{p.totalQty}</span> sold · $
                      {p.totalValue.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Worst Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Worst 5 Selling Products</CardTitle>
            <p className="text-sm text-muted-foreground">Lowest quantity sold</p>
          </CardHeader>
          <CardContent>
            {worstProducts.length === 0 ? (
              <p className="text-muted-foreground">No products yet.</p>
            ) : (
              <ul className="space-y-3">
                {worstProducts.map((p, i) => (
                  <li
                    key={p.productId}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono w-6">{i + 1}.</span>
                      <span className="font-medium">{p.productName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{p.totalQty}</span> sold · $
                      {p.totalValue.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
