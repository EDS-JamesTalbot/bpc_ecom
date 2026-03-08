'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, User, Mail, Phone, MapPin, Settings, Edit, Save, X } from 'lucide-react';
import { updateCustomerProfile } from '@/app/actions/customer-profile-actions';
import { updateCustomerAddress } from '@/app/actions/customer-address-actions';
import type { Customer, Order, OrderItem } from '@/src/db/schema';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SHIPPING } from '@/lib/constants';

type OrderWithItems = Order & { items: OrderItem[] };

type CustomerAccountDashboardProps = {
  customer: Customer;
  orders: OrderWithItems[];
};

export function CustomerAccountDashboard({ customer, orders }: CustomerAccountDashboardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isTogglingNewsletter, setIsTogglingNewsletter] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: customer.fullName,
    email: customer.email,
    phoneNumber: customer.phoneNumber || '',
    dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
    gender: customer.gender || '',
    newsletterOptIn: customer.newsletterOptIn,
  });

  const [addressData, setAddressData] = useState({
    defaultShippingAddress: customer.defaultShippingAddress || '',
    defaultShippingIsland: customer.defaultShippingIsland || '',
    defaultShippingCountry: customer.defaultShippingCountry || 'Cook Islands',
  });
  
  const paidOrders = orders.filter(o => o.orderStatus === 'paid');
  const totalSpent = paidOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  // Generate sales trend data (last 6 months)
  const salesTrendData = useMemo(() => {
    const monthsData: { [key: string]: { month: string; sales: number; orders: number } } = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      monthsData[monthKey] = { month: monthName, sales: 0, orders: 0 };
    }
    
    // Aggregate paid orders by month
    paidOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthsData[monthKey]) {
        monthsData[monthKey].sales += parseFloat(order.totalAmount);
        monthsData[monthKey].orders += 1;
      }
    });
    
    return Object.values(monthsData);
  }, [paidOrders]);

  async function handleSave() {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateCustomerProfile(formData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        router.refresh(); // Refresh to get updated data
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber || '',
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
      gender: customer.gender || '',
      newsletterOptIn: customer.newsletterOptIn,
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  }

  async function handleNewsletterToggle(checked: boolean) {
    setIsTogglingNewsletter(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateCustomerProfile({
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber || '',
        dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
        gender: customer.gender || '',
        newsletterOptIn: checked,
      });
      
      if (result.success) {
        setSuccess(checked ? 'Subscribed to newsletter!' : 'Unsubscribed from newsletter');
        router.refresh();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update preference');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsTogglingNewsletter(false);
    }
  }

  async function handleSaveAddress() {
    setIsSavingAddress(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateCustomerAddress(addressData);
      
      if (result.success) {
        setSuccess('Address updated successfully!');
        setIsEditingAddress(false);
        router.refresh();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update address');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSavingAddress(false);
    }
  }

  function handleCancelAddress() {
    setAddressData({
      defaultShippingAddress: customer.defaultShippingAddress || '',
      defaultShippingIsland: customer.defaultShippingIsland || '',
      defaultShippingCountry: customer.defaultShippingCountry || 'Cook Islands',
    });
    setIsEditingAddress(false);
    setError('');
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true);
    setError('');
    setSuccess('');
    
    try {
      const { deleteCustomerAccount } = await import('@/app/actions/customer-account-actions');
      const result = await deleteCustomerAccount();
      
      if (result.success) {
        // Account deleted successfully - redirect to home
        window.location.href = '/';
      } else {
        setError(result.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg bg-green-100 p-4 text-green-800 border border-green-300">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-800 border border-red-300">
          {error}
        </div>
      )}

      {/* Account Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#0c4a6e] flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-[#1DA1F9] text-[#1DA1F9] hover:bg-[#1DA1F9] hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isEditing ? (
              <>
                <div>
                  <p className="text-sm text-[#5A6A3E] mb-1">Full Name</p>
                  <p className="font-medium text-[#0c4a6e]">{customer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5A6A3E] mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium text-[#0c4a6e] text-sm break-all">{customer.email}</p>
                </div>
                {customer.phoneNumber && (
                  <div>
                    <p className="text-sm text-[#5A6A3E] mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="font-medium text-[#0c4a6e]">{customer.phoneNumber}</p>
                  </div>
                )}
                {customer.dateOfBirth && (
                  <div>
                    <p className="text-sm text-[#5A6A3E] mb-1">Date of Birth</p>
                    <p className="font-medium text-[#0c4a6e]">{new Date(customer.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                {customer.gender && (
                  <div>
                    <p className="text-sm text-[#5A6A3E] mb-1">Gender</p>
                    <p className="font-medium text-[#0c4a6e]">
                      {customer.gender.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-xs text-[#5A6A3E]">
                    Member since {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Edit Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-[#0c4a6e] text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="border-primary focus:border-[#1891E0] focus:ring-primary"
                    disabled={isSaving}
                  />
                </div>

                {/* Edit Email */}
                <div>
                  <Label htmlFor="email" className="text-[#0c4a6e] text-sm">
                    <Mail className="h-3 w-3 inline mr-1" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-primary focus:border-[#1891E0] focus:ring-primary"
                    disabled={isSaving}
                  />
                </div>

                {/* Edit Phone */}
                <div>
                  <Label htmlFor="phoneNumber" className="text-[#0c4a6e] text-sm">
                    <Phone className="h-3 w-3 inline mr-1" /> Phone
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="border-primary focus:border-[#1891E0] focus:ring-primary"
                    placeholder="Optional"
                    disabled={isSaving}
                  />
                </div>

                {/* Edit Date of Birth */}
                <div>
                  <Label htmlFor="dateOfBirth" className="text-[#0c4a6e] text-sm">
                    Date of Birth <span className="text-xs text-[#5A6A3E]">(optional)</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="border-primary focus:border-[#1891E0] focus:ring-primary"
                    disabled={isSaving}
                  />
                </div>

                {/* Edit Gender */}
                <div>
                  <Label htmlFor="gender" className="text-[#0c4a6e] text-sm">
                    Gender <span className="text-xs text-[#5A6A3E]">(optional)</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger 
                      id="gender"
                      className="border-primary focus:border-[#1891E0] focus:ring-primary"
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Stats Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-[#0c4a6e] flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-[#1DA1F9]">{paidOrders.length}</p>
                <p className="text-sm text-[#5A6A3E]">Completed Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</p>
                <p className="text-sm text-[#5A6A3E]">Total Spent</p>
              </div>
              {orders.some(o => o.orderStatus === 'pending') && (
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {orders.filter(o => o.orderStatus === 'pending').length}
                  </p>
                  <p className="text-sm text-[#5A6A3E]">Pending Orders</p>
                </div>
              )}
            </div>

            {/* Sales Trend Chart */}
            {paidOrders.length > 0 && (
              <div className="pt-4 border-t-2 border-primary/10">
                <p className="text-sm font-semibold text-[#0c4a6e] mb-3">Sales Trend (Last 6 Months)</p>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={salesTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11, fill: '#5A6A3E' }}
                      stroke="#cbd5e1"
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#5A6A3E' }}
                      stroke="#cbd5e1"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number | undefined) => value !== undefined ? [`$${value.toFixed(2)}`, 'Sales'] : ['$0.00', 'Sales']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#1DA1F9" 
                      strokeWidth={2}
                      dot={{ fill: '#1DA1F9', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-[#0c4a6e] flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold text-[#0c4a6e] text-base">Newsletter Subscription</p>
                <p className="text-sm text-[#5A6A3E] mt-1">
                  {customer.newsletterOptIn ? '✓ Subscribed' : 'Not subscribed'}
                </p>
              </div>
              <Switch
                checked={customer.newsletterOptIn}
                onCheckedChange={handleNewsletterToggle}
                disabled={isTogglingNewsletter}
                className="data-[state=checked]:bg-[#1DA1F9] data-[state=unchecked]:bg-gray-300"
              />
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#1DA1F9]" />
                  <p className="font-semibold text-[#0c4a6e] text-base">Default Shipping Address</p>
                </div>
                {!isEditingAddress ? (
                  <Button
                    onClick={() => setIsEditingAddress(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-[#1DA1F9] text-[#1DA1F9] hover:bg-[#1DA1F9] hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveAddress}
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      disabled={isSavingAddress}
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelAddress}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={isSavingAddress}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {!isEditingAddress ? (
                customer.defaultShippingAddress || customer.defaultShippingIsland || customer.defaultShippingCountry ? (
                  <div className="space-y-2">
                    {customer.defaultShippingAddress && (
                      <div>
                        <p className="text-xs text-[#5A6A3E] mb-1">Street Address</p>
                        <p className="text-sm text-[#0c4a6e] font-medium">{customer.defaultShippingAddress}</p>
                      </div>
                    )}
                    {customer.defaultShippingIsland && (
                      <div>
                        <p className="text-xs text-[#5A6A3E] mb-1">Suburb/Region</p>
                        <p className="text-sm text-[#0c4a6e] font-medium">{customer.defaultShippingIsland}</p>
                      </div>
                    )}
                    {customer.defaultShippingCountry && (
                      <div>
                        <p className="text-xs text-[#5A6A3E] mb-1">Country</p>
                        <p className="text-sm text-[#0c4a6e] font-medium">{customer.defaultShippingCountry}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[#5A6A3E] italic">No default address saved</p>
                    <p className="text-xs text-[#5A6A3E] mt-1">Click Edit to add your default shipping address</p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <Label htmlFor="street" className="text-[#0c4a6e] text-sm">
                      Street Address
                    </Label>
                    <Input
                      id="street"
                      value={addressData.defaultShippingAddress}
                      onChange={(e) => setAddressData({ ...addressData, defaultShippingAddress: e.target.value })}
                      className="border-primary focus:border-[#1891E0] focus:ring-primary"
                      placeholder="123 Main Street"
                      disabled={isSavingAddress}
                    />
                  </div>

                  {/* Suburb/Region */}
                  <div>
                    <Label htmlFor="suburb" className="text-[#0c4a6e] text-sm">
                      Suburb/Region
                    </Label>
                    <Input
                      id="suburb"
                      value={addressData.defaultShippingIsland}
                      onChange={(e) => setAddressData({ ...addressData, defaultShippingIsland: e.target.value })}
                      className="border-primary focus:border-[#1891E0] focus:ring-primary"
                      placeholder="e.g., Rarotonga, Auckland"
                      disabled={isSavingAddress}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <Label htmlFor="country" className="text-[#0c4a6e] text-sm">
                      Country
                    </Label>
                    <Select
                      value={addressData.defaultShippingCountry}
                      onValueChange={(value) => setAddressData({ ...addressData, defaultShippingCountry: value })}
                      disabled={isSavingAddress}
                    >
                      <SelectTrigger 
                        id="country"
                        className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {SHIPPING.COUNTRIES.map((country) => (
                          <SelectItem 
                            key={country} 
                            value={country}
                            className="text-[#0c4a6e] cursor-pointer hover:bg-[#E8F4D7] focus:bg-[#E8F4D7] focus:text-[#0c4a6e]"
                          >
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account Section */}
            <div className="pt-4 border-t-2 border-red-100">
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
                  disabled={isDeletingAccount}
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your order history and data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setIsDeleteDialogOpen(false);
                        await handleDeleteAccount();
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-[#0c4a6e] flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-[#5A6A3E]">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No orders yet</p>
              <p className="text-sm">Your order history will appear here</p>
              <Button asChild className="mt-4 bg-[#1DA1F9] hover:bg-[#0c4a6e]">
                <a href="/shop">Start Shopping</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <p className="font-bold text-[#0c4a6e] text-lg whitespace-nowrap">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-[#5A6A3E] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <ul className="list-none space-y-1 text-sm mt-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-[#0c4a6e]">
                              <span className="font-semibold">{item.productName}</span>
                              <span className="text-[#5A6A3E]"> · Qty: {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-[#1DA1F9]">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.orderStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
