// pages/api/products/[slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';

type Data =
  | { message: string }
  | {
      product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        category: string;
        description: string;
        images: string[];
        sizes: string[];
        stock: number;
        isFeatured: boolean;
        createdAt: string;
        updatedAt: string;
      };
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { slug } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Invalid slug parameter.' });
  }

  try {
    await dbConnect();

    const productDoc = await ProductModel.findOne({ slug }).lean<IProduct | null>();

    if (!productDoc) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = {
      id: productDoc._id.toString(),
      name: productDoc.name,
      slug: productDoc.slug,
      price: productDoc.price,
      category: productDoc.category,
      description: productDoc.description,
      images: productDoc.images || [],
      sizes: productDoc.sizes || [],
      stock: productDoc.stock,
      isFeatured: productDoc.isFeatured,
      createdAt: productDoc.createdAt?.toISOString?.() ?? '',
      updatedAt: productDoc.updatedAt?.toISOString?.() ?? '',
    };

    return res.status(200).json({ product });
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
