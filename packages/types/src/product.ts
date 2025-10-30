import type { Product, Category } from '@repo/product-db';
import z from 'zod';

export type ProductType = Product;

export type ProductsType = ProductType[];

export type StripeProductType = {
  id: string;
  name: string;
  price: number;
};

export type CategoryType = Category;

export const CategoryFormSchema = z.object({
  name: z
    .string({ message: 'Name is Required!' })
    .min(1, { message: 'Name is Required!' }),
  slug: z
    .string({ message: 'Slug is Required!' })
    .min(1, { message: 'Slug is Required!' }),
});
