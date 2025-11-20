// pages/admin/products/edit/[id].tsx
import React, { useState, useEffect } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';
import AdminLayout from '@/components/admin/AdminLayout';
import { withAdminAuth } from '@/components/admin/withAdminAuth';
import { useAuth } from '@/context/AuthContext';

type EditProductForm = {
  name: string;
  description?: string;
  price: number; // rupees (form)
  sizes?: string;
  category?: string;
  isFeatured?: boolean;
  imageUrls?: string;
  stock?: number | string;
};

interface EditPageProps {
  product: {
    id: string;
    name?: string | null;
    description?: string | null;
    price?: number | null; // cents
    sizes?: string[] | null;
    category?: string | null;
    images: string[];
    isFeatured?: boolean;
    slug?: string | null;
    stock?: number;
  } | null;
}

const EditProductPageBase: NextPage<EditPageProps> = ({ product }) => {
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const { register, handleSubmit, reset } = useForm<EditProductForm>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      sizes: '',
      category: '',
      isFeatured: false,
      imageUrls: '',
      stock: 0,
    },
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price ? Number((product.price as number) / 100) : 0,
        sizes: (product.sizes || []).join(', '),
        category: product.category ?? '',
        isFeatured: !!product.isFeatured,
        imageUrls: '',
        stock: product.stock ?? 0,
      });
      setUploadedImages(product.images ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleFileUpload = async (file: File) => {
    if (!firebaseUser) {
      toast.error('Please login as admin');
      return;
    }
    try {
      setUploading(true);
      const token = await firebaseUser.getIdToken();

      const sigRes = await fetch('/api/admin/upload-signature', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!sigRes.ok) {
        let body = null;
        try { body = await sigRes.json(); } catch { body = await sigRes.text().catch(() => null); }
        throw new Error(`Signature endpoint error: ${sigRes.status} ${JSON.stringify(body)}`);
      }

      const sig = await sigRes.json();
      const cloudName = sig.cloud_name || sig.cloudName || sig.cloud_name;
      const apiKey = sig.api_key || sig.apiKey || sig.api_key;
      const signature = sig.signature;
      const timestamp = sig.timestamp;
      const folder = sig.folder;

      if (!cloudName || !apiKey || !signature || !timestamp) {
        throw new Error('Invalid signature response from server (missing fields)');
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', String(apiKey));
      fd.append('timestamp', String(timestamp));
      fd.append('signature', String(signature));
      if (folder) fd.append('folder', String(folder));

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: fd });

      if (!uploadRes.ok) {
        const txt = await uploadRes.text().catch(() => '');
        throw new Error(`Cloudinary upload failed: ${uploadRes.status} ${txt}`);
      }

      const data = await uploadRes.json();
      const url = data.secure_url || data.url;
      if (!url) throw new Error('Upload succeeded but no URL returned');

      setUploadedImages((prev) => [...prev, url]);
      toast.success('Image uploaded');
      return url;
    } catch (err: any) {
      console.error('Upload error', err);
      toast.error(err?.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await handleFileUpload(files[i]);
      } catch (err) {
        // continue
      }
    }
  };

  const removeUploadedImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((u) => u !== url));
  };

  const onSubmit = async (values: EditProductForm) => {
    if (!product) {
      toast.error('No product loaded');
      return;
    }
    if (!firebaseUser) {
      toast.error('You must be logged in as admin to edit products.');
      return;
    }

    try {
      setSubmitting(true);

      const pasted = (values.imageUrls || '').split(',').map((s) => s.trim()).filter(Boolean);
      const images = [...uploadedImages, ...pasted];

      if (!values.name || values.name.trim().length === 0) {
        throw new Error('Product name is required');
      }
      if (!values.price || Number(values.price) <= 0) {
        throw new Error('Valid product price is required');
      }

      const payload = {
        name: values.name,
        description: values.description || '',
        price: Math.round(Number(values.price) * 100),
        sizes: (values.sizes || '').split(',').map((s) => s.trim()).filter(Boolean),
        category: values.category || 'uncategorized',
        images,
        isFeatured: !!values.isFeatured,
        stock: Math.max(0, Math.round(Number(values.stock ?? 0) || 0)),
      };

      const token = await firebaseUser.getIdToken();

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => '');
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }

      if (!res.ok) {
        console.error('Update product failed', { status: res.status, body: parsed });
        toast.error(`Update failed: ${parsed?.message ?? parsed ?? 'Server error'}`);
        return;
      }

      toast.success('Product updated');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Update error', err);
      toast.error(err?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <>
      <Head>
        <title>Edit Product | Admin - Veilnwear</title>
      </Head>

      <AdminLayout>
        <div className="max-w-3xl">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-neutral-50">Edit Product</h1>
            <p className="text-sm text-neutral-400">Edit the product details and images.</p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-300">Name</label>
              <input {...register('name', { required: true })} className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-neutral-300">Description</label>
              <textarea {...register('description')} rows={4} className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100" />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-neutral-300">Price (₹)</label>
              <input type="number" step="0.01" {...register('price', { required: true, min: 0 })} className="mt-1 w-40 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100" />
              <p className="text-xs text-neutral-500 mt-1">Enter price in rupees. It will be converted to paise automatically.</p>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-medium text-neutral-300">Stock (units)</label>
              <input type="number" min="0" step="1" {...register('stock')} className="mt-1 w-40 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100" />
              <p className="text-xs text-neutral-500 mt-1">Available inventory count. Enter 0 if out of stock.</p>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-medium text-neutral-300">Sizes (comma separated)</label>
              <input {...register('sizes')} className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100" placeholder="S, M, L, XL" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-neutral-300">Category</label>
              <input {...register('category')} className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100" placeholder="e.g., abayas, veils, essentials" />
            </div>

            {/* Is Featured */}
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('isFeatured')} id="isFeatured" />
              <label htmlFor="isFeatured" className="text-sm text-neutral-300">Mark as featured</label>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">Upload Images</label>

              <input id="imageUploadInput" type="file" accept="image/*" multiple onChange={onFilesSelected} className="hidden" disabled={uploading} />

              <button type="button" onClick={() => { const input = document.getElementById('imageUploadInput') as HTMLInputElement; input?.click(); }} className="rounded-md bg-neutral-800 border border-neutral-600 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Choose Images'}
              </button>

              <p className="text-xs text-neutral-500 mt-2">You can also paste image URLs below.</p>

              {uploadedImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedImages.map((u) => (
                    <div key={u} className="relative w-28 overflow-hidden rounded-md border border-neutral-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="uploaded" className="h-28 w-28 object-cover" />
                      <button type="button" onClick={() => removeUploadedImage(u)} className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl-md hover:bg-red-700">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paste image URLs */}
            <div>
              <label className="block text-xs font-medium text-neutral-300">Image URLs (comma separated)</label>
              <input {...register('imageUrls')} className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100" placeholder="https://res.cloudinary.com/..." />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={submitting} className="w-full rounded-md bg-neutral-800 border border-neutral-600 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

const EditProductPage = withAdminAuth(EditProductPageBase);
export default EditProductPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.params || {};
    if (!id || typeof id !== 'string') {
      return { notFound: true };
    }

    await dbConnect();
    const doc = await ProductModel.findById(id).lean<IProduct | null>();
    if (!doc) return { notFound: true };

    const product = {
      id: doc._id.toString(),
      name: doc.name ?? null,
      description: doc.description ?? null,
      price: typeof doc.price === 'number' ? doc.price : null,
      sizes: Array.isArray(doc.sizes) ? doc.sizes : [],
      category: doc.category ?? null,
      images: Array.isArray(doc.images) ? doc.images : [],
      isFeatured: !!doc.isFeatured,
      slug: doc.slug ?? null,
      stock: typeof doc.stock === 'number' ? doc.stock : 0,
    };

    return { props: { product } };
  } catch (err) {
    console.error('getServerSideProps edit product error', err);
    return { notFound: true };
  }
};
