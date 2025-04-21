import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define User schema interface
export interface IUser extends mongoose.Document {
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

// Create User schema
const userSchema = new mongoose.Schema(
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
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    zerodhaApiKey: {
      type: String,
      default: null,
    },
    zerodhaApiSecret: {
      type: String,
      default: null,
    },
    zerodhaAccessToken: {
      type: String,
      default: null,
    },
    zerodhaRefreshToken: {
      type: String,
      default: null,
    },
    tokenExpiryTime: {
      type: Date,
      default: null,
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
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export User model
const User = mongoose.model<IUser>('User', userSchema);
export default User;
