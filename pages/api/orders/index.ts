// pages/api/orders/index.ts
import type { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { IOrder } from '@/models/Order';
import ProductModel from '@/models/Product';
import { withAuth, AuthenticatedNextApiRequest } from '@/lib/withAuth';

type OrderItemSnapshot = {
  product?: string; // Mapped from productId for Mongoose
  productId?: string;
  name: string;
  slug: string;
  price: number; // in cents
  quantity: number;
  size?: string;
  image?: string;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type OrderResponse = {
  id: string;
  userId: string;
  items: OrderItemSnapshot[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
};

type Data =
  | { message: string; error?: string }
  | { order: OrderResponse }
  | { orders: OrderResponse[] };

function mapOrder(doc: IOrder): OrderResponse {
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    userId: doc.userId.toString(),
    items: (doc.items || []) as unknown as OrderItemSnapshot[],
    totalPrice: doc.totalPrice,
    shippingAddress: doc.shippingAddress as ShippingAddress,
    status: doc.status,
    paymentMethod: doc.paymentMethod,
    isPaid: doc.isPaid,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
  };
}

const handler = withAuth(
  async (req: AuthenticatedNextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method === 'POST') {
      // USER-ONLY: create new order
      const { items, totalPrice, shippingAddress, paymentMethod, isPaid } = req.body as {
        items?: OrderItemSnapshot[];
        totalPrice?: number;
        shippingAddress?: ShippingAddress;
        paymentMethod?: 'cod' | 'card';
        isPaid?: boolean;
      };

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order items are required.' });
      }

      if (typeof totalPrice !== 'number' || totalPrice <= 0) {
        return res.status(400).json({ message: 'Valid totalPrice is required.' });
      }

      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required.' });
      }

      try {
        await dbConnect();

        // Validate stock and decrement
        for (const item of items) {
          // item.product is the ID because we mapped it in checkout/index.tsx
          const productId = item.product || item.productId;
          if (!productId) continue;

          const product = await ProductModel.findById(productId);
          if (!product) {
            return res.status(400).json({ message: `Product not found: ${item.name}` });
          }
          if (product.stock < item.quantity) {
            return res.status(400).json({ message: `Out of stock: ${item.name}` });
          }
          product.stock -= item.quantity;
          await product.save();
        }

        const created = await OrderModel.create({
          userId: req.appUser._id,
          items,
          totalPrice,
          shippingAddress,
          status: 'pending',
          paymentMethod: paymentMethod || 'cod',
          isPaid: isPaid || false,
        });

        return res.status(201).json({ order: mapOrder(created) });
      } catch (error: any) {
        console.error('POST /api/orders error:', JSON.stringify(error, null, 2));
        console.error('Stack:', error.stack);
        return res.status(500).json({ message: error.message || 'Internal server error', error: error.toString() });
      }
    }

    if (req.method === 'GET') {
      // ADMIN-ONLY: list all orders
      if (req.appUser.role !== 'admin') {
        return res
          .status(403)
          .json({ message: 'Forbidden: admin access required.' });
      }

      try {
        await dbConnect();

        const orders = await OrderModel.find()
          .sort({ createdAt: -1 })
          .lean<IOrder[]>();

        const mapped = orders.map(mapOrder);

        return res.status(200).json({ orders: mapped });
      } catch (error) {
        console.error('GET /api/orders error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }

    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  },
);

export default handler;
