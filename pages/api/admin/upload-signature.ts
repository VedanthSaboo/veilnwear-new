// pages/api/admin/upload-signature.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { withAuth, AuthenticatedNextApiRequest } from '@/lib/withAuth';

// Ensure these env vars exist in your server env (.env.local for dev)
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

type Payload = {
  api_key: string;
  cloud_name: string;
  timestamp: number;
  signature: string;
  folder?: string;
};

const handler = withAuth(
  async (req: AuthenticatedNextApiRequest, res: NextApiResponse<Payload | { message: string }>) => {
    // Accept only GET (client expects GET)
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Admin-only
    if (!req.appUser || req.appUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error('Cloudinary env missing', { CLOUD_NAME, API_KEY: !!API_KEY, API_SECRET: !!API_SECRET });
      return res.status(500).json({ message: 'Cloudinary not configured on server' });
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || ''; // optional folder

      // Build params to sign
      const params: Record<string, string | number> = { timestamp };
      if (folder) params.folder = folder;

      // Canonical string: keys sorted lexicographically
      const toSign = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&');

      const signature = crypto.createHash('sha1').update(`${toSign}${API_SECRET}`).digest('hex');

      const payload: Payload = {
        api_key: API_KEY,
        cloud_name: CLOUD_NAME,
        timestamp,
        signature,
      };
      if (folder) payload.folder = folder;

      return res.status(200).json(payload);
    } catch (err) {
      console.error('upload-signature error', err);
      return res.status(500).json({ message: 'Failed to generate signature' });
    }
  },
);

export default handler;
