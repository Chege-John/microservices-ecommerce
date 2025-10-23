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
  const json = await response.json();
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
