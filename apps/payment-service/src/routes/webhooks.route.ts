import { Hono } from 'hono';
import Stripe from 'stripe';
import stripe from '../utils/stripe';
import { producer } from '../utils/kafka';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const webhookRoute = new Hono();

webhookRoute.post('/stripe', async (c) => {
  const body = await c.req.text();
  const sig = c.req.header('Stripe-Signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (error) {
    console.log('Webhook verification failed:', error);
    return c.json(`Webhook Error: ${(error as Error).message}`, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      // TODO: Create Order
      producer.send('payment.successful', {
        value: {
          userId: session.client_reference_id,
          email: session.customer_details?.email,
          amount: session.amount_total,
          status: session.payment_status === 'paid' ? 'success' : 'Failed',
          products: lineItems.data.map((item) => ({
            name: item.description,
            price: item.price?.unit_amount,
            quantity: item.quantity,
          })),
        },
      });

      break;

    default:
      break;
  }
  return c.json({ received: true });
});

export default webhookRoute;
