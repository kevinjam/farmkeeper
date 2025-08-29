import mongoose, { Document, Schema } from 'mongoose';

export interface IEggCollection extends Document {
  farmId: mongoose.Types.ObjectId;
  date: Date;
  quantity: number;
  chickens: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  efficiency: number; // Virtual property
}

const EggCollectionSchema = new Schema<IEggCollection>({
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
    min: 0
  },
  chickens: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index to prevent duplicate collections for the same farm on the same day
EggCollectionSchema.index({ farmId: 1, date: 1 }, { unique: false });

// Calculate efficiency rate (eggs per chicken)
EggCollectionSchema.virtual('efficiency').get(function(this: IEggCollection) {
  if (!this.chickens) return 0;
  return (this.quantity / this.chickens) * 100;
});

// Export the model
export default mongoose.models.EggCollection || 
  mongoose.model<IEggCollection>('EggCollection', EggCollectionSchema);
