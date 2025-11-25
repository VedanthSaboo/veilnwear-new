// pages/api/products/index.ts
import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';
import { withAuth, AuthenticatedNextApiRequest } from '@/lib/withAuth';

type Data = { message?: string; products?: any[]; product?: any };

const handler = withAuth(async (req: AuthenticatedNextApiRequest, res: NextApiResponse<Data>) => {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connect failed in /api/products', err);
    return res.status(500).json({ message: 'DB connection failed' });
  }

  if (req.method === 'GET') {
    try {
      const docs = await ProductModel.find().sort({ createdAt: -1 }).lean<IProduct[]>();
      const products = (docs || []).map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        price: p.price,
        images: p.images || [],
        isFeatured: !!p.isFeatured,
        stock: typeof p.stock === 'number' ? p.stock : 0,
      }));
      return res.status(200).json({ products });
    } catch (err) {
      console.error('GET /api/products error', err);
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
  }

  if (req.method === 'POST') {
    if (!req.appUser || req.appUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }

    try {
      const {
        name,
        description = '',
        price,
        sizes = [],
        category = 'uncategorized',
        images = [],
        isFeatured = false,
        stock = 0,
      } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'name is required' });
      }
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ message: 'price must be a positive number (in cents)' });
      }
      if (!Array.isArray(images)) {
        return res.status(400).json({ message: 'images must be an array' });
      }
      const stockNum = Number(stock) || 0;

      const newProduct = await ProductModel.create({
        name,
        description,
        price,
        sizes,
        category,
        images,
        isFeatured,
        stock: Math.max(0, Math.round(stockNum)),
      });

      return res.status(201).json({
        product: {
          id: newProduct._id.toString(),
          name: newProduct.name,
          slug: newProduct.slug,
          price: newProduct.price,
          images: newProduct.images,
          isFeatured: newProduct.isFeatured,
          stock: newProduct.stock,
        },
      });
    } catch (err: any) {
      console.error('POST /api/products error:', err);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: err?.message || 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method Not Allowed' });
});

export default handler;
