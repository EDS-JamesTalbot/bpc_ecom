'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { customerLogin } from '@/app/actions/customer-auth-actions';
import { useRouter } from 'next/navigation';

export function CustomerLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await customerLogin(formData);
      
      if (result.success) {
        // Redirect to account page
        router.push('/my-account');
        router.refresh();
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800 border border-red-300">
          {errors.general}
        </div>
      )}

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-[#0c4a6e] font-semibold">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
          placeholder="your@email.com"
          disabled={isLoading}
          required
        />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password" className="text-[#0c4a6e] font-semibold">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
          placeholder="Enter your password"
          disabled={isLoading}
          required
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-[#1DA1F9] hover:bg-[#0c4a6e] text-white font-semibold py-6 text-lg gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}
