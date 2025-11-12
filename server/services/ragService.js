const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const Property = require('../models/Property');
const embeddingService = require('./embeddingService');
require('dotenv').config();

// Initialize Gemini LLM
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-pro',
  temperature: 0.7,
});

/**
 * Perform vector similarity search in MongoDB
 * @param {number[]} queryEmbedding - Query vector
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Similar properties
 */
const vectorSearch = async (queryEmbedding, limit = 5) => {
  try {
    // Get all properties and calculate cosine similarity
    const properties = await Property.find();

    const results = properties.map((property) => {
      const similarity = cosineSimilarity(queryEmbedding, property.embedding);
      return { property, similarity };
    });

    // Sort by similarity and return top results
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit).map((r) => r.property);
  } catch (error) {
    console.error('❌ Error in vector search:', error.message);
    throw error;
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Generate AI response using LLM with context
 * @param {string} userQuery - User's question
 * @param {Array} properties - Relevant properties
 * @returns {Promise<string>} - AI-generated response
 */
const generateResponse = async (userQuery, properties) => {
  try {
    const context = properties
      .map(
        (p, i) =>
          `Property ${i + 1}:
- Title: ${p.title}
- Location: ${p.location}
- Price: $${p.price.toLocaleString()}
- Bedrooms: ${p.bedrooms}, Bathrooms: ${p.bathrooms}
- Size: ${p.size_sqft} sqft
- Amenities: ${p.amenities.join(', ')}`
      )
      .join('\n\n');

    const prompt = `You are a helpful real estate assistant. Based on the following properties, answer the user's question in a friendly and informative way.

Properties:
${context}

User Question: ${userQuery}

Provide a natural, conversational response that highlights the most relevant properties and explains why they match the user's needs.`;

    const response = await llm.invoke(prompt);
    return response.content;
  } catch (error) {
    console.error('❌ Error generating LLM response:', error.message);
    throw error;
  }
};

/**
 * Main RAG pipeline: Process user message and return AI response with properties
 * @param {string} userMessage - User's natural language query
 * @returns {Promise<Object>} - AI response and relevant properties
 */
const processUserMessage = async (userMessage) => {
  try {
    console.log('🔍 Processing user query:', userMessage);

    // Step 1: Convert user query to embedding
    const queryEmbedding = await embeddingService.generateEmbedding(userMessage);

    // Step 2: Perform vector search
    const relevantProperties = await vectorSearch(queryEmbedding, 5);

    // Step 3: Generate AI response with context
    const aiResponse = await generateResponse(userMessage, relevantProperties);

    return {
      response: aiResponse,
      properties: relevantProperties.map((p) => {
        const obj = p.toObject();
        delete obj.embedding;
        return obj;
      }),
    };
  } catch (error) {
    console.error('❌ Error in RAG pipeline:', error.message);
    throw error;
  }
};

module.exports = {
  vectorSearch,
  generateResponse,
  processUserMessage,
};
