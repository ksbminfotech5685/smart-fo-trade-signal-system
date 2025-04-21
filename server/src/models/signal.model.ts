import mongoose, { Schema, type Document } from 'mongoose';

export interface ISignal extends Document {
  type: 'BUY' | 'SELL';
  stock: string;
  option: string;
  currentMarketPrice: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: string;
  generatedAt: Date;
  sentToTelegram: boolean;
  sentAt?: Date;
  executedOrder: boolean;
  executedAt?: Date;
  orderStatus?: 'PENDING' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';
  orderDetails?: {
    orderId?: string;
    orderPrice?: number;
    quantity?: number;
    filledQuantity?: number;
    status?: string;
    statusMessage?: string;
  };
  profitLoss?: number;
  exitPrice?: number;
  exitAt?: Date;
  exitReason?: 'TARGET_HIT' | 'SL_HIT' | 'MANUAL_EXIT' | 'MARKET_CLOSE';
  indicators: {
    rsi?: number;
    macd?: {
      line: number;
      signal: number;
      histogram: number;
    };
    supertrend?: boolean;
    ema20?: number;
    ema50?: number;
    priceAboveVwap?: boolean;
    volume?: number;
    avgVolume?: number;
    highestOI?: string;
    ivChange?: number;
  };
  notes?: string;
}

const SignalSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    stock: {
      type: String,
      required: true,
      trim: true,
    },
    option: {
      type: String,
      required: true,
      trim: true,
    },
    currentMarketPrice: {
      type: Number,
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    stopLoss: {
      type: Number,
      required: true,
    },
    riskRewardRatio: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    sentToTelegram: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
    executedOrder: {
      type: Boolean,
      default: false,
    },
    executedAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'EXECUTED', 'REJECTED', 'CANCELLED'],
    },
    orderDetails: {
      orderId: String,
      orderPrice: Number,
      quantity: Number,
      filledQuantity: Number,
      status: String,
      statusMessage: String,
    },
    profitLoss: {
      type: Number,
    },
    exitPrice: {
      type: Number,
    },
    exitAt: {
      type: Date,
    },
    exitReason: {
      type: String,
      enum: ['TARGET_HIT', 'SL_HIT', 'MANUAL_EXIT', 'MARKET_CLOSE'],
    },
    indicators: {
      rsi: Number,
      macd: {
        line: Number,
        signal: Number,
        histogram: Number,
      },
      supertrend: Boolean,
      ema20: Number,
      ema50: Number,
      priceAboveVwap: Boolean,
      volume: Number,
      avgVolume: Number,
      highestOI: String,
      ivChange: Number,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
SignalSchema.index({ generatedAt: -1 });
SignalSchema.index({ stock: 1, generatedAt: -1 });
SignalSchema.index({ type: 1, generatedAt: -1 });

export default mongoose.model<ISignal>('Signal', SignalSchema);
