// pages/api/products/[id].ts
import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';
import { withAuth, AuthenticatedNextApiRequest } from '@/lib/withAuth';

type Data = { message?: string; product?: any };

const handler = withAuth(async (req: AuthenticatedNextApiRequest, res: NextApiResponse<Data>) => {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connect failed in /api/products/[id]', err);
    return res.status(500).json({ message: 'DB connection failed' });
  }

  const { id } = req.query as { id?: string };

  if (!id) return res.status(400).json({ message: 'Missing id' });

  if (req.method === 'GET') {
    try {
      const doc = await ProductModel.findById(id).lean<IProduct | null>();
      if (!doc) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json({
        product: {
          id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          price: doc.price,
          images: doc.images || [],
          sizes: doc.sizes || [],
          category: doc.category,
          isFeatured: !!doc.isFeatured,
          stock: typeof doc.stock === 'number' ? doc.stock : 0,
        },
      });
    } catch (err) {
      console.error('GET /api/products/[id] error', err);
      return res.status(500).json({ message: 'Failed to fetch product' });
    }
  }

  if (req.method === 'PUT') {
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
      const stockNum = Math.max(0, Math.round(Number(stock) || 0));

      const updated = await ProductModel.findByIdAndUpdate(
        id,
        {
          name,
          description,
          price,
          sizes,
          category,
          images,
          isFeatured,
          stock: stockNum,
        },
        { new: true },
      ).lean<IProduct | null>();

      if (!updated) return res.status(404).json({ message: 'Not found' });

      return res.status(200).json({
        product: {
          id: updated._id.toString(),
          name: updated.name,
          slug: updated.slug,
          price: updated.price,
          images: updated.images,
          isFeatured: updated.isFeatured,
          stock: updated.stock,
        },
      });
    } catch (err: any) {
      console.error('PUT /api/products/[id] error:', err);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: err?.message || 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ message: 'Method Not Allowed' });
});

export default handler;
