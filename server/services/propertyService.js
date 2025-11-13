const Property = require('../models/Property');

/**
 * Get all properties with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - Properties and pagination info
 */
const getAllProperties = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const properties = await Property.find().skip(skip).limit(limit).select('-embedding');
    const total = await Property.countDocuments();

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('❌ Error fetching properties:', error.message);
    throw error;
  }
};

/**
 * Get property by ID
 * @param {number} id - Property ID
 * @returns {Promise<Object>} - Property details
 */
const getPropertyById = async (id) => {
  try {
    const property = await Property.findOne({ id }).select('-embedding');
    return property;
  } catch (error) {
    console.error('❌ Error fetching property:', error.message);
    throw error;
  }
};

/**
 * Filter properties by criteria
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} - Filtered properties
 */
const filterProperties = async (filters) => {
  try {
    const query = {};

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    // Bedrooms filter (exact match or minimum)
    if (filters.bedrooms) {
      if (filters.minBedrooms) {
        query.bedrooms = { $gte: filters.bedrooms };
      } else {
        query.bedrooms = filters.bedrooms;
      }
    }

    // Bathrooms filter (exact match or minimum)
    if (filters.bathrooms) {
      if (filters.minBathrooms) {
        query.bathrooms = { $gte: filters.bathrooms };
      } else {
        query.bathrooms = filters.bathrooms;
      }
    }

    // Location filter (case-insensitive partial match)
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    // Property type filter
    if (filters.property_type) {
      query.property_type = filters.property_type;
    }

    // Keyword search in title (uses text index)
    if (filters.keyword) {
      query.$text = { $search: filters.keyword };
    }

    const properties = await Property.find(query).select('-embedding');
    return properties;
  } catch (error) {
    console.error('❌ Error filtering properties:', error.message);
    throw error;
  }
};

/**
 * Format property for response (remove sensitive fields)
 * @param {Object} property - Property document
 * @returns {Object} - Formatted property
 */
const formatPropertyForResponse = (property) => {
  const formatted = property.toObject ? property.toObject() : property;
  delete formatted.embedding;
  delete formatted.__v;
  return formatted;
};

/**
 * Compare multiple properties
 * @param {number[]} ids - Array of property IDs
 * @returns {Promise<Array>} - Array of properties
 */
const compareProperties = async (ids) => {
  try {
    const properties = await Property.find({ id: { $in: ids } }).select('-embedding');
    return properties;
  } catch (error) {
    console.error('❌ Error comparing properties:', error.message);
    throw error;
  }
};

/**
 * Get filter metadata (distinct values for filter options)
 * @returns {Promise<Object>} - Filter metadata
 */
const getFilterMetadata = async () => {
  try {
    // Get distinct values for each filter field
    const [locations, propertyTypes, bedroomOptions, bathroomOptions, prices] = await Promise.all([
      Property.distinct('location'),
      Property.distinct('property_type'),
      Property.distinct('bedrooms'),
      Property.distinct('bathrooms'),
      Property.find().select('price').lean(),
    ]);

    // Calculate price range
    const priceValues = prices.map((p) => p.price);
    const priceRange = {
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
    };

    return {
      locations: locations.sort(),
      propertyTypes: propertyTypes.sort(),
      bedrooms: bedroomOptions.sort((a, b) => a - b),
      bathrooms: bathroomOptions.sort((a, b) => a - b),
      priceRange,
    };
  } catch (error) {
    console.error('❌ Error fetching filter metadata:', error.message);
    throw error;
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  filterProperties,
  formatPropertyForResponse,
  compareProperties,
  getFilterMetadata,
};
