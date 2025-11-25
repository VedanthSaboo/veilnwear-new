// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';
import { withAuth, AuthenticatedNextApiRequest } from '@/lib/withAuth';

type ProductResponse = {
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

type Data =
  | { message: string }
  | { product: ProductResponse };

function mapProduct(doc: IProduct): ProductResponse {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    category: doc.category,
    description: doc.description,
    images: doc.images || [],
    sizes: doc.sizes || [],
    stock: doc.stock,
    isFeatured: doc.isFeatured,
    createdAt: doc.createdAt?.toISOString?.() ?? '',
    updatedAt: doc.updatedAt?.toISOString?.() ?? '',
  };
}

const handler = withAuth(
  async (req: AuthenticatedNextApiRequest, res: NextApiResponse<Data>) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid product id parameter.' });
    }

    // Admin-only protection
    if (req.appUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access required.' });
    }

    if (req.method === 'PUT') {
      const {
        name,
        description,
        category,
        stock,
        price,
        sizes,
        images,
        isFeatured,
      } = req.body as Partial<{
        name: string;
        description: string;
        category: string;
        stock: number;
        price: number;
        sizes: string[];
        images: string[];
        isFeatured: boolean;
      }>;

      try {
        await dbConnect();

        const update: Partial<IProduct> = {};

        if (typeof name === 'string') update.name = name;
        if (typeof description === 'string') update.description = description;
        if (typeof category === 'string') update.category = category;
        if (typeof stock === 'number') update.stock = stock;
        if (typeof price === 'number') update.price = price;
        if (Array.isArray(sizes)) update.sizes = sizes;
        if (Array.isArray(images)) update.images = images;
        if (typeof isFeatured === 'boolean') update.isFeatured = isFeatured;

        const updatedDoc = await ProductModel.findByIdAndUpdate(id, update, {
          new: true,
          runValidators: true,
        }).lean<IProduct | null>();

        if (!updatedDoc) {
          return res.status(404).json({ message: 'Product not found.' });
        }

        return res.status(200).json({ product: mapProduct(updatedDoc) });
      } catch (error) {
        console.error('PUT /api/products/[id] error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }

    if (req.method === 'DELETE') {
      try {
        await dbConnect();

        const deletedDoc = await ProductModel.findByIdAndDelete(id).lean<IProduct | null>();

        if (!deletedDoc) {
          return res.status(404).json({ message: 'Product not found.' });
        }

        return res.status(200).json({ product: mapProduct(deletedDoc) });
      } catch (error) {
        console.error('DELETE /api/products/[id] error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  },
);

export default handler;
