const { GoogleGenerativeAI } = require('@google/generative-ai');
const Property = require('../models/Property');
const embeddingService = require('./embeddingService');
require('dotenv').config();

// Initialize Gemini LLM
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

Provide a natural, conversational response using **Markdown formatting**:
- Use **bold** for property names and important details
- Use bullet points (*) for listing amenities or features
- Use headings (##) to organize by location or category when relevant
- Keep your response clear, concise, and well-structured

Highlight the most relevant properties and explain why they match the user's needs.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Error generating LLM response:', error.message);
    throw error;
  }
};

/**
 * Extract structured filters from natural language query using LLM
 * Only extract EXPLICIT numerical constraints, not semantic preferences
 * @param {string} userMessage - User's natural language query
 * @returns {Promise<Object>} - Extracted filters
 */
const extractFilters = async (userMessage) => {
  try {
    const prompt = `Extract ONLY explicit numerical constraints from this query. Return a JSON object with these fields (omit if not explicitly mentioned):
- minPrice: number (only if query says "over", "above", "more than" with a price)
- maxPrice: number (only if query says "under", "below", "less than" with a price)
- minBedrooms: number (only if query explicitly mentions bedroom count)
- minBathrooms: number (only if query explicitly mentions bathroom count)

IMPORTANT: 
- Do NOT extract location or property_type - let semantic search handle those
- Only extract if there's an EXPLICIT numerical constraint
- "Penthouse in Las Vegas" -> {} (no numerical constraints)
- "Apartment in Atlanta" -> {} (no numerical constraints)
- "3 bedroom apartments" -> {"minBedrooms": 3}
- "Properties under 1000000" -> {"maxPrice": 1000000}
- "Houses over 500k with 4 beds" -> {"minPrice": 500000, "minBedrooms": 4}

Query: "${userMessage}"

Return only the JSON object, no other text:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error('⚠️ Error extracting filters:', error.message);
    return {}; // Return empty filters on error
  }
};

/**
 * Apply only numerical filters to properties array
 * Semantic filters (location, property type) are handled by vector search
 * @param {Array} properties - Properties to filter
 * @param {Object} filters - Filter criteria (only numerical)
 * @returns {Array} - Filtered properties
 */
const applyFilters = (properties, filters) => {
  return properties.filter((property) => {
    // Price filters (strict numerical constraints)
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    
    // Bedroom filter (minimum count)
    if (filters.minBedrooms && property.bedrooms < filters.minBedrooms) return false;
    
    // Bathroom filter (minimum count)
    if (filters.minBathrooms && property.bathrooms < filters.minBathrooms) return false;
    
    return true;
  });
};

/**
 * Main RAG pipeline: Process user message and return AI response with properties
 * @param {string} userMessage - User's natural language query
 * @returns {Promise<Object>} - AI response and relevant properties
 */
const processUserMessage = async (userMessage) => {
  try {
    console.log('🔍 Processing user query:', userMessage);

    // Step 1: Extract structured filters from query
    const filters = await extractFilters(userMessage);
    console.log('📋 Extracted filters:', filters);

    // Step 2: Convert user query to embedding
    const queryEmbedding = await embeddingService.generateEmbedding(userMessage);

    // Step 3: Perform vector search (get more results to account for filtering)
    const relevantProperties = await vectorSearch(queryEmbedding, 20);

    // Step 4: Apply only numerical filters (if any) to vector search results
    // Vector search already handles semantic matching for location/property type
    const hasNumericalFilters = Object.keys(filters).length > 0;
    const filteredProperties = hasNumericalFilters
      ? applyFilters(relevantProperties, filters)
      : relevantProperties;

    console.log(`🔢 After filtering: ${filteredProperties.length} properties (from ${relevantProperties.length})`);

    // Step 5: Take top 5 after filtering
    const finalProperties = filteredProperties.slice(0, 5);

    // Step 6: Generate AI response with context
    const aiResponse = await generateResponse(userMessage, finalProperties);

    return {
      response: aiResponse,
      properties: finalProperties.map((p) => {
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
  extractFilters,
  applyFilters,
};
