import mongoose, { Document, Schema } from 'mongoose';

// Interface for Farm document
export interface IFarm extends Document {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  location: {
    address?: string;
    district?: string;
    country: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  subscription: {
    plan: 'basic' | 'standard' | 'premium';
    status: 'active' | 'trialing' | 'expired' | 'canceled';
    expiresAt: Date;
  };
  settings: {
    currency: string;
    language: string;
    timezone: string;
    notificationsEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Farm Schema
const FarmSchema = new Schema<IFarm>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a farm name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      address: String,
      district: String,
      country: {
        type: String,
        default: 'Uganda',
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        default: 'basic',
      },
      status: {
        type: String,
        enum: ['active', 'trialing', 'expired', 'canceled'],
        default: 'trialing',
      },
      expiresAt: {
        type: Date,
        default: function() {
          // Set default expiry to 30 days from now
          const date = new Date();
          date.setDate(date.getDate() + 30);
          return date;
        },
      },
    },
    settings: {
      currency: {
        type: String,
        default: 'UGX',
      },
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'Africa/Kampala',
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Create unique compound index for name and owner
FarmSchema.index({ name: 1, owner: 1 }, { unique: true });

// Method to generate a unique slug
FarmSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  try {
    // Create slug from farm name
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    
    // Check if slug exists already and make it unique if needed
    const Farm = mongoose.model('Farm');
    let slugExists = await Farm.exists({ slug: this.slug, _id: { $ne: this._id } });
    let counter = 1;
    
    while (slugExists) {
      this.slug = `${this.slug}-${counter}`;
      counter++;
      slugExists = await Farm.exists({ slug: this.slug, _id: { $ne: this._id } });
    }
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Export Farm model if it doesn't exist already
export default mongoose.models.Farm || mongoose.model<IFarm>('Farm', FarmSchema);
