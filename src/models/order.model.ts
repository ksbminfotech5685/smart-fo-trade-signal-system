import mongoose, { Schema, type Document } from 'mongoose';

export interface IOrder extends Document {
  signalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  kiteOrderId: string;
  parentOrderId?: string;
  status: 'OPEN' | 'COMPLETE' | 'CANCELLED' | 'REJECTED';
  transactionType: 'BUY' | 'SELL';
  exchange: string;
  tradingSymbol: string;
  quantity: number;
  price?: number;
  triggerPrice?: number;
  product: 'MIS' | 'CNC' | 'NRML';
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  variety: 'regular' | 'co' | 'iceberg' | 'auction';
  validity: 'DAY' | 'IOC' | 'TTL';
  averagePrice?: number;
  filledQuantity: number;
  pendingQuantity: number;
  orderTimestamp: Date;
  exchangeTimestamp?: Date;
  cancelledQuantity: number;
  statusMessage?: string;
  tag?: string;
  stopLossOrder?: {
    orderId: string;
    triggerPrice: number;
    status: string;
  };
  targetOrder?: {
    orderId: string;
    price: number;
    status: string;
  };
}

const OrderSchema: Schema = new Schema(
  {
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Signal',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    kiteOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    parentOrderId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'COMPLETE', 'CANCELLED', 'REJECTED'],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
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
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
    },
    triggerPrice: {
      type: Number,
    },
    product: {
      type: String,
      enum: ['MIS', 'CNC', 'NRML'],
      required: true,
    },
    orderType: {
      type: String,
      enum: ['MARKET', 'LIMIT', 'SL', 'SL-M'],
      required: true,
    },
    variety: {
      type: String,
      enum: ['regular', 'co', 'iceberg', 'auction'],
      required: true,
    },
    validity: {
      type: String,
      enum: ['DAY', 'IOC', 'TTL'],
      required: true,
    },
    averagePrice: {
      type: Number,
    },
    filledQuantity: {
      type: Number,
      default: 0,
    },
    pendingQuantity: {
      type: Number,
      required: true,
    },
    orderTimestamp: {
      type: Date,
      required: true,
    },
    exchangeTimestamp: {
      type: Date,
    },
    cancelledQuantity: {
      type: Number,
      default: 0,
    },
    statusMessage: {
      type: String,
    },
    tag: {
      type: String,
    },
    stopLossOrder: {
      orderId: String,
      triggerPrice: Number,
      status: String,
    },
    targetOrder: {
      orderId: String,
      price: Number,
      status: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
OrderSchema.index({ signalId: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderTimestamp: -1 });
OrderSchema.index({ kiteOrderId: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
