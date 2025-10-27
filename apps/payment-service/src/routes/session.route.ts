import { Hono } from 'hono';
import stripe from '../utils/stripe';
import { shouldBeUser } from '../middleware/authMiddleware';
import { CartItemsType } from '@repo/types';
import { getStripeProductPrice } from '../utils/stripeProduct';

type CustomVariables = {
  // Custom variable set by shouldBeUser middleware
  user: {
    id: string;
    email: string;
  };
  // Context variable set by clerkMiddleware
  auth: {
    userId: string | null;
    sessionId: string | null;
    sessionClaims: Record<string, any>;
  };
  // Context variable for the Clerk backend client instance
  clerk: any; // Use 'any' as a temporary measure if the exact ClerkClient type import is difficult
};

const sessionRoute = new Hono<{ Variables: CustomVariables }>();

sessionRoute.post('/create-checkout-session', shouldBeUser, async (c) => {
  const userData = c.get('user');

  if (!userData || !userData.email) {
    return c.json({ error: 'User email not found in context' }, 401);
  }

  // Use the correctly retrieved user email
  const userEmail = userData.email;

  console.log('User email:', userEmail);

  const { cart }: { cart: CartItemsType } = await c.req.json();

  console.log('Creating checkout session for cart:', cart);

  const userId = c.get('userId');

  const lineItems = await Promise.all(
    cart.map(async (item) => {
      try {
        const unitAmount = await getStripeProductPrice(item.id);

        console.log(`Fetched price for ${item.id}:`, unitAmount);

        return {
          price_data: {
            currency: 'usd',

            product_data: {
              name: item.name,
            },

            unit_amount: unitAmount as number,
          },

          quantity: item.quantity,
        };
      } catch (err) {
        console.error(`PRICE FETCH ERROR for item ${item.id}:`, err);
        throw err;
      }
    })
  );

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      client_reference_id: userId || undefined,
      mode: 'payment',
      ui_mode: 'custom',
      customer_email: userEmail,
      billing_address_collection: 'auto',
      shipping_address_collection: undefined,
      shipping_options: [],
      return_url:
        'http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}',
    });

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json({ error });
  }
});

sessionRoute.get('/:session_id', async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ['line_items'],
    }
  );

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
  });
});

export default sessionRoute;
