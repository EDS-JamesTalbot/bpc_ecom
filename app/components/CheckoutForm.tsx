"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart, type CartItem } from "./CartContext";
import { Loader2 } from "lucide-react";
import { SHIPPING } from "@/lib/constants";

type CheckoutFormProps = {
  onClose: () => void;
  onSubmitSuccess?: (data: {
    paymentUrl: string;
    orderId: number;
    totalAmount: number;
  }) => void;
};

export function CheckoutForm({ onClose, onSubmitSuccess }: CheckoutFormProps) {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    shippingCountry: "Cook Islands",
    shippingIsland: "",
    shippingAddress: "",
  });

  // Customer account registration state
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  // Fetch customer data if logged in
  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const response = await fetch('/api/customer-data');
        const data = await response.json();
        
        if (data.isLoggedIn && data.customer) {
          setIsLoggedIn(true);
          
          // Pre-populate form with customer data
          setFormData({
            fullName: data.customer.fullName || "",
            phoneNumber: data.customer.phoneNumber || "",
            email: data.customer.email || "",
            shippingCountry: data.customer.defaultShippingCountry || "Cook Islands",
            shippingIsland: data.customer.defaultShippingIsland || "",
            shippingAddress: data.customer.defaultShippingAddress || "",
          });
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setIsLoadingCustomerData(false);
      }
    }
    
    fetchCustomerData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Email validation - required if creating account
    if (createAccount) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required to create an account";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation if creating account
    if (createAccount) {
      if (!password.trim()) {
        newErrors.password = "Password is required";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      const { processCheckout } = await import("@/app/actions/checkout-actions");

      const result = await processCheckout({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        shippingCountry: formData.shippingCountry.trim() || undefined,
        shippingIsland: formData.shippingIsland.trim() || undefined,
        shippingAddress: formData.shippingAddress.trim() || undefined,
        items: cartItems,
        totalAmount: totalPrice,
        // Customer account creation
        createAccount: createAccount,
        password: createAccount ? password : undefined,
        dateOfBirth: createAccount && dateOfBirth ? dateOfBirth : undefined,
        gender: createAccount && gender ? gender : undefined,
      });

      if (result.success && result.paymentUrl && result.orderId) {
        onSubmitSuccess?.({
          paymentUrl: result.paymentUrl,
          orderId: result.orderId,
          totalAmount: totalPrice,
        });
      } else {
        setErrors({ general: result.error || "Failed to process checkout" });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading indicator while fetching customer data
  if (isLoadingCustomerData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-[#0c4a6e]">Loading checkout...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-[#bfdbfe] p-4">
        <h3 className="mb-2 text-lg font-semibold text-[#0c4a6e]">Order Summary</h3>
        <div className="space-y-1 text-sm text-[#0c4a6e]">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>
                {item.productName} x {item.quantity}
              </span>
              <span className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t border-[#0c4a6e]/30 pt-2 text-base font-bold text-[#0c4a6e]">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800">
            {errors.general}
          </div>
        )}

        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="text-[#0c4a6e] font-semibold">
            Full Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`border-primary focus:border-[#1891E0] focus:ring-primary bg-white ${
              errors.fullName ? "border-red-500" : ""
            }`}
            placeholder="John Doe"
            disabled={isProcessing}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phoneNumber" className="text-[#0c4a6e] font-semibold">
            Phone Number <span className="text-red-600">*</span>
          </Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className={`border-primary focus:border-[#1891E0] focus:ring-primary bg-white ${
              errors.phoneNumber ? "border-red-500" : ""
            }`}
            placeholder="+682 12345"
            disabled={isProcessing}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Email (Optional unless creating account) */}
        <div>
          <Label htmlFor="email" className="text-[#0c4a6e] font-semibold">
            Email {createAccount ? (
              <span className="text-red-600">*</span>
            ) : (
              <span className="text-sm text-[#5A6A3E]">(optional)</span>
            )}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`border-primary focus:border-[#1891E0] focus:ring-primary bg-white ${
              errors.email ? "border-red-500" : ""
            }`}
            placeholder="john@example.com"
            disabled={isProcessing}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Logged In Status or Create Account Section */}
        {isLoggedIn ? (
          <div className="space-y-4 pt-4 border-t-2 border-primary/20">
            <div className="flex items-center space-x-2 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Signed in - Your information has been pre-filled
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t-2 border-primary/20">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="create-account"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={isProcessing}
              />
              <div className="flex-1">
                <Label htmlFor="create-account" className="text-[#0c4a6e] font-semibold cursor-pointer">
                  Create an account to track your orders
                </Label>
                <p className="text-sm text-[#5A6A3E] mt-1">
                  Save your information for faster checkout and view your order history
                </p>
              </div>
            </div>

            {createAccount && (
              <div className="space-y-4 bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border-2 border-primary/20">
                <p className="text-sm font-medium text-[#0c4a6e]">
                  ✨ Create your customer account
                </p>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-[#0c4a6e] font-semibold">
                    Password <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`border-primary focus:border-[#1891E0] focus:ring-primary bg-white ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    placeholder="At least 8 characters"
                    disabled={isProcessing}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirm-password" className="text-[#0c4a6e] font-semibold">
                    Confirm Password <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`border-primary focus:border-[#1891E0] focus:ring-primary bg-white ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    placeholder="Re-enter your password"
                    disabled={isProcessing}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <Label htmlFor="dob" className="text-[#0c4a6e] font-semibold">
                    Date of Birth <span className="text-sm text-[#5A6A3E]">(optional)</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
                    disabled={isProcessing}
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="text-[#0c4a6e] font-semibold">
                    Gender <span className="text-sm text-[#5A6A3E]">(optional)</span>
                  </Label>
                  <Select
                    value={gender}
                    onValueChange={setGender}
                    disabled={isProcessing}
                  >
                    <SelectTrigger 
                      id="gender"
                      className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
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
          </div>
        )}

        {/* Shipping Address Section */}
        <div className="space-y-4 pt-4 border-t-2 border-primary/20">
          <h3 className="text-lg font-semibold text-[#0c4a6e]">
            Shipping Address <span className="text-sm font-normal text-[#5A6A3E]">(optional)</span>
          </h3>

          {/* Street Address */}
          <div>
            <Label htmlFor="shippingAddress" className="text-[#0c4a6e] font-semibold">
              Street Address
            </Label>
            <Textarea
              id="shippingAddress"
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
              placeholder="123 Main Street"
              disabled={isProcessing}
              rows={3}
            />
          </div>

          {/* Suburb/Region */}
          <div>
            <Label htmlFor="shippingIsland" className="text-[#0c4a6e] font-semibold">
              Suburb/Region
            </Label>
            <Input
              id="shippingIsland"
              value={formData.shippingIsland}
              onChange={(e) => setFormData({ ...formData, shippingIsland: e.target.value })}
              className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
              placeholder="Tupapa, Rarotonga"
              disabled={isProcessing}
            />
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="shippingCountry" className="text-[#0c4a6e] font-semibold">
              Country
            </Label>
            <Select
              value={formData.shippingCountry}
              onValueChange={(value) =>
                setFormData({ 
                  ...formData, 
                  shippingCountry: value,
                })
              }
              disabled={isProcessing}
            >
              <SelectTrigger className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white">
                <SelectValue />
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

        {/* Payment Info Notice */}
        <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>Secure Payment:</strong> You will be redirected to our secure payment page to complete your purchase.
          </p>
          <p className="text-xs text-blue-700 mt-2">
            🔒 Payment is processed securely by our payment provider.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded-full border-2 border-primary !bg-primary !text-white hover:!bg-secondary-foreground hover:!border-secondary-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
            className="flex-1 rounded-full !bg-primary !text-white hover:!bg-secondary-foreground shadow-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

