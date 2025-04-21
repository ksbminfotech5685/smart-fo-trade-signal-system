import mongoose, { Schema, type Document } from 'mongoose';

export interface IStockUniverse extends Document {
  symbol: string;
  name: string;
  instrumentToken: number;
  exchange: string;
  tradingSymbol: string;
  isin: string;
  sector: string;
  marketCap: 'LARGE' | 'MID' | 'SMALL';
  inF1: boolean; // Future and Options 1st month
  inF2: boolean; // Future and Options 2nd month
  inF3: boolean; // Future and Options 3rd month
  lotSize: number;
  tickSize: number;
  expiry: string[];
  strikeGap: number;
  previousDayHigh: number;
  previousDayLow: number;
  previousDayClose: number;
  previousDayVolume: number;
  avgDailyVolume20: number;
  openInterest: {
    current: number;
    change: number;
    changePercentage: number;
  };
  optionData: {
    maxPainStrike: number;
    putCallRatio: number;
    impliedVolatility: number;
    highestOICall: number;
    highestOIPut: number;
  };
  isActive: boolean;
  nifty50: boolean;
  bankNifty: boolean;
  finNifty: boolean;
  isBanned: boolean; // F&O Ban period
  updatedAt: Date;
}

const StockUniverseSchema: Schema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    instrumentToken: {
      type: Number,
      required: true,
      unique: true,
    },
    exchange: {
      type: String,
      required: true,
      trim: true,
    },
    tradingSymbol: {
      type: String,
      required: true,
      trim: true,
    },
    isin: {
      type: String,
      trim: true,
    },
    sector: {
      type: String,
      trim: true,
    },
    marketCap: {
      type: String,
      enum: ['LARGE', 'MID', 'SMALL'],
    },
    inF1: {
      type: Boolean,
      default: false,
    },
    inF2: {
      type: Boolean,
      default: false,
    },
    inF3: {
      type: Boolean,
      default: false,
    },
    lotSize: {
      type: Number,
    },
    tickSize: {
      type: Number,
    },
    expiry: [String],
    strikeGap: {
      type: Number,
    },
    previousDayHigh: {
      type: Number,
    },
    previousDayLow: {
      type: Number,
    },
    previousDayClose: {
      type: Number,
    },
    previousDayVolume: {
      type: Number,
    },
    avgDailyVolume20: {
      type: Number,
    },
    openInterest: {
      current: Number,
      change: Number,
      changePercentage: Number,
    },
    optionData: {
      maxPainStrike: Number,
      putCallRatio: Number,
      impliedVolatility: Number,
      highestOICall: Number,
      highestOIPut: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nifty50: {
      type: Boolean,
      default: false,
    },
    bankNifty: {
      type: Boolean,
      default: false,
    },
    finNifty: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
StockUniverseSchema.index({ symbol: 1 });
StockUniverseSchema.index({ instrumentToken: 1 });
StockUniverseSchema.index({ sector: 1 });
StockUniverseSchema.index({ inF1: 1 });
StockUniverseSchema.index({ isActive: 1 });

export default mongoose.model<IStockUniverse>('StockUniverse', StockUniverseSchema);
