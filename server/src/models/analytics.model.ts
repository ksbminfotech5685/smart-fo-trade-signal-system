import mongoose, { Schema, type Document } from 'mongoose';

export interface IDailyAnalytics extends Document {
  date: Date;
  totalSignals: number;
  signalsByType: {
    BUY: number;
    SELL: number;
  };
  executedOrders: number;
  successfulTrades: number;
  failedTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  totalCapitalUsed: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  tradeDetails: Array<{
    signalId: mongoose.Types.ObjectId;
    stock: string;
    type: 'BUY' | 'SELL';
    entryPrice: number;
    exitPrice: number;
    profitLoss: number;
    profitLossPercentage: number;
    duration: number; // in minutes
  }>;
}

const DailyAnalyticsSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    totalSignals: {
      type: Number,
      default: 0,
    },
    signalsByType: {
      BUY: {
        type: Number,
        default: 0,
      },
      SELL: {
        type: Number,
        default: 0,
      },
    },
    executedOrders: {
      type: Number,
      default: 0,
    },
    successfulTrades: {
      type: Number,
      default: 0,
    },
    failedTrades: {
      type: Number,
      default: 0,
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    profitLossPercentage: {
      type: Number,
      default: 0,
    },
    totalCapitalUsed: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    averageWin: {
      type: Number,
      default: 0,
    },
    averageLoss: {
      type: Number,
      default: 0,
    },
    largestWin: {
      type: Number,
      default: 0,
    },
    largestLoss: {
      type: Number,
      default: 0,
    },
    tradeDetails: [
      {
        signalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Signal',
        },
        stock: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['BUY', 'SELL'],
          required: true,
        },
        entryPrice: {
          type: Number,
          required: true,
        },
        exitPrice: {
          type: Number,
          required: true,
        },
        profitLoss: {
          type: Number,
          required: true,
        },
        profitLossPercentage: {
          type: Number,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a model for weekly and monthly analytics
export interface IPeriodAnalytics extends Document {
  period: string; // 'WEEK-2023-01', 'MONTH-2023-01'
  periodType: 'WEEK' | 'MONTH';
  startDate: Date;
  endDate: Date;
  totalSignals: number;
  executedOrders: number;
  successfulTrades: number;
  failedTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  totalCapitalUsed: number;
  winRate: number;
  bestPerformingStock: string;
  worstPerformingStock: string;
  dailyAnalytics: Array<mongoose.Types.ObjectId>;
}

const PeriodAnalyticsSchema: Schema = new Schema(
  {
    period: {
      type: String,
      required: true,
      unique: true,
    },
    periodType: {
      type: String,
      enum: ['WEEK', 'MONTH'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalSignals: {
      type: Number,
      default: 0,
    },
    executedOrders: {
      type: Number,
      default: 0,
    },
    successfulTrades: {
      type: Number,
      default: 0,
    },
    failedTrades: {
      type: Number,
      default: 0,
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    profitLossPercentage: {
      type: Number,
      default: 0,
    },
    totalCapitalUsed: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    bestPerformingStock: {
      type: String,
    },
    worstPerformingStock: {
      type: String,
    },
    dailyAnalytics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyAnalytics',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
DailyAnalyticsSchema.index({ date: -1 });
PeriodAnalyticsSchema.index({ period: 1, periodType: 1 });
PeriodAnalyticsSchema.index({ startDate: -1 });

export const DailyAnalytics = mongoose.model<IDailyAnalytics>('DailyAnalytics', DailyAnalyticsSchema);
export const PeriodAnalytics = mongoose.model<IPeriodAnalytics>('PeriodAnalytics', PeriodAnalyticsSchema);
