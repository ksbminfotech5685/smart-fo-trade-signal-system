import mongoose, { Schema, type Document } from 'mongoose';

export interface ICandleStick {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IMarketData extends Document {
  symbol: string;
  instrumentToken: number;
  lastPrice: number;
  dayHigh: number;
  dayLow: number;
  openPrice: number;
  closePrice: number;
  volume: number;
  averagePrice: number;
  lastTradeTime: Date;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  change: number;
  lastUpdated: Date;
  oneMinuteCandlesticks: ICandleStick[];
  fiveMinuteCandlesticks: ICandleStick[];
  fifteenMinuteCandlesticks: ICandleStick[];
}

const CandleStickSchema = new Schema({
  timestamp: {
    type: Date,
    required: true,
  },
  open: {
    type: Number,
    required: true,
  },
  high: {
    type: Number,
    required: true,
  },
  low: {
    type: Number,
    required: true,
  },
  close: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
  },
});

const MarketDataSchema: Schema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    instrumentToken: {
      type: Number,
      required: true,
    },
    lastPrice: {
      type: Number,
      required: true,
    },
    dayHigh: {
      type: Number,
    },
    dayLow: {
      type: Number,
    },
    openPrice: {
      type: Number,
    },
    closePrice: {
      type: Number,
    },
    volume: {
      type: Number,
    },
    averagePrice: {
      type: Number,
    },
    lastTradeTime: {
      type: Date,
    },
    ohlc: {
      open: Number,
      high: Number,
      low: Number,
      close: Number,
    },
    change: {
      type: Number,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    oneMinuteCandlesticks: [CandleStickSchema],
    fiveMinuteCandlesticks: [CandleStickSchema],
    fifteenMinuteCandlesticks: [CandleStickSchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
MarketDataSchema.index({ symbol: 1 });
MarketDataSchema.index({ lastUpdated: 1 });

export default mongoose.model<IMarketData>('MarketData', MarketDataSchema);
