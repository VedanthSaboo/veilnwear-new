// pages/api/users/me.ts
import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedNextApiRequest } from '@/lib/withAuth';

const handler = async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // At this point:
  // - req.firebaseUser is the decoded Firebase token
  // - req.appUser is the MongoDB user (found or newly created)
  return res.status(200).json({ user: req.appUser });
};

export default withAuth(handler);
