import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  dob: Date;
  isVerified: boolean;
  profilePic?: string;
  password: string;
  preferences: string[];
  blockedArticles: ObjectId[];
  likedArticles: ObjectId[];
  dislikedArticles: ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    profilePic: { type: String },
    dob: { type: Date, required: true },
    preferences: { type: [String], default: [] },
    dislikedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    blockedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);
