import mongoose, { Document, Schema } from 'mongoose';

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
        default: 'active',
      },
      expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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

// Create slug from farm name before saving
FarmSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
  
  next();
});

export default mongoose.models.Farm || mongoose.model<IFarm>('Farm', FarmSchema);
