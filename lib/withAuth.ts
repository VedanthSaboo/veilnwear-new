// lib/withAuth.ts
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import type { DecodedIdToken } from 'firebase-admin/auth';

import dbConnect from '@/lib/dbConnect';
import { getAdminAuth } from '@/lib/firebaseAdmin';
import UserModel, { IUser } from '@/models/User';

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  firebaseUser: DecodedIdToken;
  appUser: IUser;
}

/**
 * withAuth – API route HOC.
 *
 * - Expects a Firebase ID token in the Authorization header: "Bearer <token>"
 * - Verifies the token using Firebase Admin.
 * - Connects to MongoDB and finds OR creates the corresponding User
 *   (by firebaseUid, using email from the token if available).
 * - Attaches firebaseUser + appUser to the request.
 * - On failure, responds with 401 and does NOT call the handler.
 */
export function withAuth(
  handler: (
    req: AuthenticatedNextApiRequest,
    res: NextApiResponse,
  ) => ReturnType<NextApiHandler>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Missing or invalid Authorization header (expected Bearer token).' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const adminAuth = getAdminAuth();

      // 1) Verify Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(token);

      // 2) Connect to MongoDB
      await dbConnect();

      // 3) Find or create MongoDB user by firebaseUid
      let appUser = await UserModel.findOne({ firebaseUid: decodedToken.uid });

      if (!appUser) {
        const emailFromToken = decodedToken.email || '';
        appUser = await UserModel.create({
          firebaseUid: decodedToken.uid,
          email: emailFromToken,
          // role will default to 'customer' from the schema
        });
      }

      // 4) Attach to request and call the handler
      const authReq = req as AuthenticatedNextApiRequest;
      authReq.firebaseUser = decodedToken;
      authReq.appUser = appUser;

      return handler(authReq, res);
    } catch (error) {
      console.error('withAuth error:', error);
      return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
    }
  };
}
