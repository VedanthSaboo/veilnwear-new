// pages/api/orders/[id].ts
import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { IOrder } from '@/models/Order';
import { withAuth, AuthenticatedNextApiRequest } from '@/lib/withAuth';

type OrderItemSnapshot = {
  productId: string;
  name: string;
  slug: string;
  price: number;
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
  createdAt: string;
  updatedAt: string;
};

type Data =
  | { message: string }
  | { order: OrderResponse };

function mapOrder(doc: IOrder): OrderResponse {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    items: (doc.items || []) as unknown as OrderItemSnapshot[],
    totalPrice: doc.totalPrice,
    shippingAddress: doc.shippingAddress as ShippingAddress,
    status: doc.status,
    createdAt: doc.createdAt?.toISOString?.() ?? '',
    updatedAt: doc.updatedAt?.toISOString?.() ?? '',
  };
}

const ALLOWED_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const handler = withAuth(
  async (req: AuthenticatedNextApiRequest, res: NextApiResponse<Data>) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid order id parameter.' });
    }

    try {
      await dbConnect();

      if (req.method === 'GET') {
        // Owner or admin can view
        const order = await OrderModel.findById(id).lean<IOrder | null>();

        if (!order) {
          return res.status(404).json({ message: 'Order not found.' });
        }

        const isOwner = order.userId.toString() === req.appUser._id.toString();
        const isAdmin = req.appUser.role === 'admin';

        if (!isOwner && !isAdmin) {
          return res.status(403).json({ message: 'Forbidden: access denied.' });
        }

        return res.status(200).json({ order: mapOrder(order) });
      }

      if (req.method === 'PUT') {
        // Admin-only: update status
        if (req.appUser.role !== 'admin') {
          return res
            .status(403)
            .json({ message: 'Forbidden: admin access required.' });
        }

        const { status } = req.body as { status?: string };

        if (!status || !ALLOWED_STATUSES.includes(status)) {
          return res.status(400).json({
            message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
          });
        }

        const updated = await OrderModel.findByIdAndUpdate(
          id,
          { status },
          { new: true, runValidators: true },
        ).lean<IOrder | null>();

        if (!updated) {
          return res.status(404).json({ message: 'Order not found.' });
        }

        return res.status(200).json({ order: mapOrder(updated) });
      }

      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
      console.error('/api/orders/[id] error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
);

export default handler;
