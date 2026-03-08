import { getCustomerSession } from '@/lib/customer-auth';
import { redirect } from 'next/navigation';
import { getCustomerById } from '@/src/db/queries/customers';
import { getCustomerOrders } from '@/src/db/queries/customer-orders';
import { CustomerAccountDashboard } from './CustomerAccountDashboard';

export default async function MyAccountPage() {
  // Require authentication
  const session = await getCustomerSession();
  
  if (!session) {
    redirect('/customer-login');
  }
  
  // Fetch customer data and orders
  const [customer, orders] = await Promise.all([
    getCustomerById(session.customerId),
    getCustomerOrders(session.customerId),
  ]);
  
  if (!customer) {
    // Session exists but customer not found - clear session
    redirect('/customer-login');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0c4a6e] mb-2">
            My Account
          </h1>
          <p className="text-lg text-[#475569]">
            Welcome back, {customer.fullName}!
          </p>
        </div>
        
        <CustomerAccountDashboard customer={customer} orders={orders} />
      </div>
    </div>
  );
}
