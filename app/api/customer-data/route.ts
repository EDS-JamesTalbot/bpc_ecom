import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import { getCustomerById } from '@/src/db/queries/customers';

export async function GET() {
  try {
    const session = await getCustomerSession();
    
    if (!session) {
      return NextResponse.json({
        isLoggedIn: false,
        customer: null,
      });
    }

    const customer = await getCustomerById(session.customerId);
    
    if (!customer) {
      return NextResponse.json({
        isLoggedIn: false,
        customer: null,
      });
    }

    // Return customer data (excluding sensitive information)
    return NextResponse.json({
      isLoggedIn: true,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        defaultShippingAddress: customer.defaultShippingAddress,
        defaultShippingIsland: customer.defaultShippingIsland,
        defaultShippingCountry: customer.defaultShippingCountry,
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
      },
    });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return NextResponse.json({
      isLoggedIn: false,
      customer: null,
    });
  }
}
