import { StripeProductType } from '@repo/types';
import stripe from './stripe';

export const createStripeProduct = async (item: StripeProductType) => {
  try {
    const res = await stripe.products.create({
      id: item.id,
      name: item.name,
      default_price_data: {
        currency: 'usd',
        unit_amount: item.price * 100, // $10.00
      },
    });
    return res;
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    throw error;
  }
};

{
  /*export const getStripeProductPrice = async (productId: number) => {
  try {
    const res = await stripe.prices.list({
      product: productId.toString(),
    });
    return res.data[0]?.unit_amount;
  } catch (error) {
    console.error('Error getting Stripe product price:', error);
    throw error;
  }
};*/
}

// Payment Service: This logic communicates via HTTP
export const getStripeProductPrice = async (
  productId: number
): Promise<number | null> => {
  const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL;

  try {
    const response = await fetch(
      `${PRODUCT_SERVICE_URL}/products/price/${productId}`
    );

    console.log(
      `Fetching price for product ID ${productId} from ${PRODUCT_SERVICE_URL}`
    );

    if (!response.ok) {
      console.error(
        `Product Service failed for ID ${productId}: ${response.status}`
      );
      return null;
    }

    const data = await response.json();

    // Assume Product Service returns { unitAmount: 2000 }
    return data.unitAmount || null;
  } catch (error) {
    console.error('Network failure connecting to Product Service:', error);
    return null;
  }
};

export const deleteStripeProduct = async (productId: string) => {
  try {
    const res = await stripe.products.del(productId.toString());
    return res;
  } catch (error) {
    console.error('Error deleting Stripe product:', error);
    throw error;
  }
};
