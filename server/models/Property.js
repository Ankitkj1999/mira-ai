const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    size_sqft: {
      type: Number,
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    image_url: {
      type: String,
    },
    property_type: {
      type: String,
      enum: ['Apartment', 'Condo', 'Villa', 'House', 'Penthouse', 'Studio', 'Townhouse', 'Duplex', 'Loft', 'Bungalow', 'Brownstone', 'Chalet', 'Estate', 'Cabin', 'Mansion', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for vector search
propertySchema.index({ embedding: 1 });

// Compound index for traditional filtering
propertySchema.index({ price: 1, bedrooms: 1, bathrooms: 1, location: 1 });

// Text index for keyword search on title
propertySchema.index({ title: 'text', location: 'text' });

// Index for property type
propertySchema.index({ property_type: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
