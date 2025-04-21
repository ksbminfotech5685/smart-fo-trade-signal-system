import mongoose, { Schema, type Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  zerodhaApiKey?: string;
  zerodhaApiSecret?: string;
  zerodhaAccessToken?: string;
  zerodhaRefreshToken?: string;
  tokenExpiryTime?: Date;
  isAutoTradingEnabled: boolean;
  maxTradesPerDay: number;
  maxCapitalPerTrade: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    zerodhaApiKey: {
      type: String,
      trim: true,
    },
    zerodhaApiSecret: {
      type: String,
      trim: true,
    },
    zerodhaAccessToken: {
      type: String,
      trim: true,
    },
    zerodhaRefreshToken: {
      type: String,
      trim: true,
    },
    tokenExpiryTime: {
      type: Date,
    },
    isAutoTradingEnabled: {
      type: Boolean,
      default: false,
    },
    maxTradesPerDay: {
      type: Number,
      default: 3,
    },
    maxCapitalPerTrade: {
      type: Number,
      default: 5000,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export default mongoose.model<IUser>('User', UserSchema);
