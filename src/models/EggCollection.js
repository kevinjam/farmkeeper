import mongoose from 'mongoose';

const EggCollectionSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
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
EggCollectionSchema.virtual('efficiency').get(function() {
  if (!this.chickens) return 0;
  return (this.quantity / this.chickens) * 100;
});

// Export the model
export default mongoose.models.EggCollection || 
  mongoose.model('EggCollection', EggCollectionSchema);
