// pages/api/orders/my-orders.ts
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

type OrderSummary = {
  id: string;
  items: OrderItemSnapshot[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  createdAt: string;
};

type Data =
  | { message: string }
  | { orders: OrderSummary[] };

function mapOrderSummary(doc: IOrder): OrderSummary {
  return {
    id: (doc._id as any).toString(),
    items: (doc.items || []) as unknown as OrderItemSnapshot[],
    totalPrice: doc.totalPrice,
    shippingAddress: doc.shippingAddress as ShippingAddress,
    status: doc.status,
    paymentMethod: doc.paymentMethod || 'cod',
    isPaid: doc.isPaid || false,
    createdAt: doc.createdAt?.toISOString?.() ?? '',
  };
}

const handler = withAuth(
  async (req: AuthenticatedNextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
      await dbConnect();

      const orders = await OrderModel.find({ userId: req.appUser._id })
        .sort({ createdAt: -1 })
        .lean<IOrder[]>();

      const mapped = orders.map(mapOrderSummary);

      return res.status(200).json({ orders: mapped });
    } catch (error) {
      console.error('GET /api/orders/my-orders error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
);

export default handler;
