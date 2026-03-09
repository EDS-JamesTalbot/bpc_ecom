import { getCustomerSession } from '@/lib/customer-auth';
import { getTenantSlugForRequest } from '@/lib/tenant-context';
import { withTenantPrefix } from '@/lib/tenant-utils';
import { redirect } from 'next/navigation';
import { CustomerLoginForm } from './CustomerLoginForm';

export default async function CustomerLoginPage() {
  const tenantSlug = await getTenantSlugForRequest();
  
  // If already logged in, redirect to account page
  const session = await getCustomerSession();
  
  if (session) {
    redirect(withTenantPrefix('/my-account', tenantSlug));
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md -mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0c4a6e] mb-2">
              Welcome Back!
            </h1>
            <p className="text-[#475569]">
              Sign in to your customer account
            </p>
          </div>
          
          <CustomerLoginForm />
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-[#475569]">
            <p>
              Don't have an account?{' '}
              <a href={withTenantPrefix('/shop', tenantSlug)} className="text-primary font-semibold hover:underline">
                Create one during checkout
              </a>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <a href={withTenantPrefix('/shop', tenantSlug)} className="text-sm text-[#5A6A3E] hover:underline">
              ← Continue shopping as guest
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
