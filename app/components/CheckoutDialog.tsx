"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutForm } from "./CheckoutForm";
import { PaymentForm } from "./PaymentForm";

type CheckoutDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type CheckoutStep = "customer-info" | "payment" | "success";

export function CheckoutDialog({ isOpen, onClose, onSuccess }: CheckoutDialogProps) {
  const [step, setStep] = useState<CheckoutStep>("customer-info");
  const [checkoutData, setCheckoutData] = useState<{
    paymentUrl: string;
    orderId: number;
    totalAmount: number;
  } | null>(null);

  const handleCheckoutSubmit = (data: {
    paymentUrl: string;
    orderId: number;
    totalAmount: number;
  }) => {
    setCheckoutData(data);
    setStep("payment");
  };

  const handleClose = () => {
    setStep("customer-info");
    setCheckoutData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-primary flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center text-2xl font-semibold text-[#3A4A1E]">
            {step === "customer-info" && "Checkout"}
            {step === "payment" && "Payment"}
            {step === "success" && "Order Complete!"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto flex-1 pr-2">
          {step === "customer-info" && (
            <CheckoutForm
              onClose={handleClose}
              onSubmitSuccess={handleCheckoutSubmit}
            />
          )}

          {step === "payment" && checkoutData && (
            <PaymentForm
              paymentUrl={checkoutData.paymentUrl}
              orderId={checkoutData.orderId}
              totalAmount={checkoutData.totalAmount}
              onCancel={async () => {
                await fetch('/api/checkout-cancelled', { method: 'POST' });
                setStep("customer-info");
              }}
            />
          )}

          {step === "success" && (
            <div className="py-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-6 border-4 border-green-600">
                  <svg
                    className="h-16 w-16 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#3A4A1E] mb-2">
                Thank you for your order!
              </h3>
              <p className="text-[#5A6A3E]">
                Your payment was successful. We'll contact you shortly to arrange delivery.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

