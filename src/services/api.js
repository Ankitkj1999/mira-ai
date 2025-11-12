/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = '/api';

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Chat API
 */
export const chatAPI = {
  /**
   * Send a message to the AI chatbot
   * @param {string} message - User's message
   * @returns {Promise<Object>} - AI response with properties
   */
  sendMessage: async (message) => {
    return fetchAPI('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * Filter properties by criteria
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} - Filtered properties
   */
  filterProperties: async (filters) => {
    return fetchAPI('/chat/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },
};

/**
 * Properties API
 */
export const propertiesAPI = {
  /**
   * Get all properties with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Properties list with pagination
   */
  getAll: async (page = 1, limit = 10) => {
    return fetchAPI(`/properties?page=${page}&limit=${limit}`);
  },

  /**
   * Get property by ID
   * @param {number} id - Property ID
   * @returns {Promise<Object>} - Property details
   */
  getById: async (id) => {
    return fetchAPI(`/properties/${id}`);
  },

  /**
   * Compare multiple properties
   * @param {number[]} ids - Array of property IDs
   * @returns {Promise<Object>} - Properties for comparison
   */
  compare: async (ids) => {
    return fetchAPI('/properties/compare', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};

export default {
  chat: chatAPI,
  properties: propertiesAPI,
};
