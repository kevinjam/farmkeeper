import mongoose, { Document, Schema } from 'mongoose';

export interface IEggSale extends Document {
  farmId: mongoose.Types.ObjectId;
  date: Date;
  quantity: number;
  price: number;
  customer: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  total: number; // Virtual property
}

const EggSaleSchema = new Schema<IEggSale>({
  farmId: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  customer: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'transfer', 'mobile', 'other'],
    default: 'cash'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate total sale amount
EggSaleSchema.virtual('total').get(function(this: IEggSale) {
  return this.quantity * this.price;
});

// Export the model
export default mongoose.models.EggSale || 
  mongoose.model<IEggSale>('EggSale', EggSaleSchema);
