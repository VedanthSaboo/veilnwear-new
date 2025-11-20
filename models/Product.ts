// models/Product.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IProduct extends Document {
  name: string;
  description?: string;
  category?: string;
  price: number; // stored in cents
  sizes?: string[];
  slug: string;
  images?: string[];
  isFeatured?: boolean;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'uncategorized' },
    price: { type: Number, required: true }, // cents
    sizes: { type: [String], default: [] },
    slug: { type: String, required: true, unique: true, index: true },
    images: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    stock: { type: Number, required: true, default: 0 }, // NEW: stock count (integer)
  },
  { timestamps: true },
);

/**
 * Pre-validate hook: if slug is missing and name exists, create a slug.
 * Ensures uniqueness by appending a numeric suffix when necessary.
 */
ProductSchema.pre('validate', async function (next) {
  if (!this.slug && this.name) {
    const base = slugify(this.name, { lower: true, strict: true });
    let candidate = base;
    let suffix = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ModelRef: any = this.constructor;
    while (await ModelRef.exists({ slug: candidate })) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    // eslint-disable-next-line no-param-reassign
    this.slug = candidate;
  }
  next();
});

const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default ProductModel;
