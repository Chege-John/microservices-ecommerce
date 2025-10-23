import { Hono } from 'hono';
import stripe from '../utils/stripe';
import { shouldBeUser } from '../middleware/authMiddleware';

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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      ui_mode: 'custom',
      customer_email: userEmail,
      // The URL of your payment completion page
      return_url:
        'http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}',
    });

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json({ error });
  }
});

export default sessionRoute;
