"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type PaymentFormProps = {
  paymentUrl: string;
  orderId: number;
  totalAmount: number;
  onCancel: () => void;
};

/**
 * BPC Redirect: show "Continue to payment" and redirect to BPC hosted page.
 * No card data is collected on our site.
 */
export function PaymentForm({
  paymentUrl,
  orderId,
  totalAmount,
  onCancel,
}: PaymentFormProps) {
  const handleContinueToPayment = () => {
    window.location.href = paymentUrl;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-[#3A4A1E] mb-2">
          Secure Payment
        </h3>
        <p className="text-sm text-[#5A6A3E]">
          You will be redirected to our secure payment page to complete your order.
        </p>
      </div>

      <div className="rounded-lg bg-[#bfdbfe] p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-[#0c4a6e]">Total:</span>
          <span className="text-2xl font-bold text-[#0c4a6e]">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary/20 bg-white p-4 text-center text-sm text-[#5A6A3E]">
        <p>Order #{orderId}</p>
        <p className="mt-1">Powered by BPC Payment Gateway</p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-full border-2 border-[#1DA1F9] bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] hover:border-[#0c4a6e]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleContinueToPayment}
          className="flex-1 rounded-full bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] shadow-md gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
