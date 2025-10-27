'use client';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutProvider } from '@stripe/react-stripe-js/checkout';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ShippingFormInputs, CartItemsType } from '@repo/types';
import CheckoutForm from './CheckoutForm';
import useCartStore from '@/stores/cartStore';

const stripe = loadStripe(
  'pk_test_51RBZmeQ7IjnqEjd3bWHJkcfxtriFoZfpug4JYiSf3T6RqyVwFwIOkb8vC5RNMS6IY86de9kxrXzqd6xFmgYwpLcf00eQDOtXlZ'
);

const getClientSecret = async (
  cart: CartItemsType,
  token: string
): Promise<string> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
    {
      method: 'POST',
      body: JSON.stringify({ cart }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    // If the status is 4xx or 5xx, the server might have sent "Internal Server Error" text.
    // Reading it as text prevents the SyntaxError crash.
    const errorBody = await response.text();
    console.error(
      'Failed to fetch client secret. Status:',
      response.status,
      'Response:',
      errorBody
    );

    // Throw an error that the parent component can catch
    throw new Error(
      `Failed to initialize payment (${response.status}): ${errorBody.substring(0, 100)}...`
    );
    
  }

  const json = await response.json();

  if (json.error) {
    console.error('API returned an error in the JSON body:', json.error);
    throw new Error(json.error.message || 'Payment service returned an error.');
  }

  return json.checkoutSessionClientSecret;
};

const StripePaymentForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const { cart } = useCartStore();
  const [token, setToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then((t) => setToken(t));
  }, [getToken]);

  useEffect(() => {
    if (token) {
      getClientSecret(cart, token).then(setClientSecret);
    }
  }, [token, cart]);

  if (!token || !clientSecret) {
    return <p>Loading...</p>;
  }

  return (
    <CheckoutProvider stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutProvider>
  );
};

export default StripePaymentForm;
