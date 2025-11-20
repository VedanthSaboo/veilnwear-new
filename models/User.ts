// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'customer' | 'admin';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  role: UserRole;
  wishlist: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Avoid recompiling models in dev / hot reload
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
