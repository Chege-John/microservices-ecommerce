/* eslint-disable @typescript-eslint/no-unused-vars */
import { ShippingFormInputs } from '@/types';
import { PaymentElement, useCheckout } from '@stripe/react-stripe-js/checkout';
import { ConfirmError } from '@stripe/stripe-js';
import React, { useState, useEffect } from 'react';

const CheckoutForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const checkout = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConfirmError | null>(null);

  // CheckoutForm.tsx

  useEffect(() => {
    console.log('Checkout state:', checkout.type);
    if (checkout.type === 'error') {
      console.error('Checkout error:', checkout.error);
    }
    // New Check: Inspect the success object
    if (checkout.type === 'success') {
      // If this is logging repeatedly, the component is likely stuck here
      console.log(
        'STUCK IN SUCCESS STATE. Checkout object:',
        checkout.checkout
      );
    }
  }, [checkout]);

  useEffect(() => {
    console.log('Checkout state:', checkout.type);
    if (checkout.type === 'error') {
      console.error('Checkout error:', checkout.error);
    }
  }, [checkout]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (checkout.type === 'loading') {
      console.log('Checkout still loading...');
      return;
    }

    if (checkout.type === 'error') {
      setError({ message: checkout.error.message } as ConfirmError);
      return;
    }

    const session = checkout.checkout;

    setLoading(true);

    {
      /* try {
      console.log('Updating email...');
      await session.updateEmail(shippingForm.email);

      console.log('Updating shipping address...');
      await session.updateShippingAddress({
        name: 'shipping_address',
        address: {
          line1: shippingForm.address,
          city: shippingForm.city,
          country: 'US',
        },
      });

      console.log('Confirming payment...');
      const res = await session.confirm();

      console.log('Payment result:', res);
      if (res.type === 'error') {
        setError(res.error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError({ message: 'An unexpected error occurred' } as ConfirmError);
    } finally {
      setLoading(false);
    }*/
    }
  };

  console.log('Rendering CheckoutForm, checkout type:', checkout.type);

  if (checkout.type === 'loading') {
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p>Initializing payment form...</p>
        <div className="mt-2 h-2 bg-gray-200 rounded overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (checkout.type === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600 font-medium">Error loading checkout</p>
        <p className="text-red-500 text-sm mt-1">{checkout.error.message}</p>
      </div>
    );
  }

  return (
    <form className="space-y-4">
      <div className="border rounded p-4">
        <PaymentElement options={{ layout: 'accordion' }} />
      </div>

      <button
        type="submit"
        disabled={loading}
        onClick={handleClick}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
