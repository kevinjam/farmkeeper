import mongoose from 'mongoose';

const EggSaleSchema = new mongoose.Schema({
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
EggSaleSchema.virtual('total').get(function() {
  return this.quantity * this.price;
});

// Export the model
export default mongoose.models.EggSale || 
  mongoose.model('EggSale', EggSaleSchema);
