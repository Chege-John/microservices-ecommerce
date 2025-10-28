import { Request, Response } from 'express';
import { prisma, Prisma } from '@repo/product-db';
import { producer } from '../utils/kafka';
import { StripeProductType } from '@repo/types';

export const createProduct = async (req: Request, res: Response) => {
  const data: Prisma.ProductCreateInput = req.body;

  const { colors, images } = data;
  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    return res.status(400).json({ message: 'Colors array is required!' });
  }

  if (!images || typeof images !== 'object') {
    return res.status(400).json({ message: 'Images object is required!' });
  }

  const missingColors = colors.filter((color) => !(color in images));
  if (missingColors.length > 0) {
    return res.status(400).json({
      message: 'Missing images for colors!',
      missingColors,
    });
  }

  const product = await prisma.product.create({ data });

  const stripeProduct: StripeProductType = {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
  };
  producer.send('product.created', { value: stripeProduct });
  res.status(201).json(product);
};
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Prisma.ProductUpdateInput = req.body;

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data,
  });

  return res.status(200).json(updatedProduct);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleteProduct = await prisma.product.delete({
    where: { id: Number(id) },
  });

  producer.send('product.deleted', { value: Number(id) });

  return res.status(200).json(deleteProduct);
};

export const getProducts = async (req: Request, res: Response) => {
  const { sort, category, search, limit } = req.query;

  const orderBy = (() => {
    switch (sort) {
      case 'asc':
        return { price: Prisma.SortOrder.asc };
        break;
      case 'desc':
        return { price: Prisma.SortOrder.desc };
        break;
      case 'oldest':
        return { createdAt: Prisma.SortOrder.asc };
        break;
      default:
        return { createdAt: Prisma.SortOrder.desc };
        break;
    }
  })();

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: category as string,
      },
      name: {
        contains: search as string,
        mode: 'insensitive',
      },
    },
    orderBy,
    take: limit ? Number(limit) : undefined,
  });

  res.status(200).json(products);
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  return res.status(200).json(product);
};

export const getProductPrice = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Log to confirm the request reached this handler
  console.log(`[Product Service] Received price request for ID: ${id}`);

  try {
    const productId = Number(id);

    // Use findUnique to get the product, selecting only the price field
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true }, // Select only the price field for efficiency
    });

    if (!product || product.price === undefined) {
      // Product not found or price is missing
      console.warn(
        `[Product Service] Product ID ${id} not found or price is null/undefined.`
      );
      return res.status(404).json({ message: 'Product price not found.' });
    }

    // Convert the price from dollars/decimals to cents/integer
    const unitAmount = Math.round(product.price * 100);

    // Log success before responding
    console.log(`[Product Service] Price for ID ${id} is: ${unitAmount}`);

    // Respond with the required payload { unitAmount: 2000 }
    return res.status(200).json({ unitAmount });
  } catch (error) {
    // 💥 CRITICAL: This logs the Prisma connection error if it occurs
    console.error(
      '*** PRISMA CONNECTION FAILURE IN getProductPrice ***',
      error
    );

    // The Payment Service will read this 500 and return null for the price
    return res
      .status(500)
      .json({ message: 'Database query failed on Product Service.' });
  }
};
