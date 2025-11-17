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
 * Generate informational response (no property listing)
 * @param {string} userQuery - User's question
 * @param {Array} allProperties - All properties for context
 * @returns {Promise<string>} - AI-generated response
 */
const generateInformationalResponse = async (userQuery, allProperties) => {
  try {
    const stats = {
      total: allProperties.length,
      avgPrice: Math.round(allProperties.reduce((sum, p) => sum + p.price, 0) / allProperties.length),
      maxPrice: Math.max(...allProperties.map(p => p.price)),
      minPrice: Math.min(...allProperties.map(p => p.price)),
      locations: [...new Set(allProperties.map(p => p.location))].slice(0, 5)
    };

    const prompt = `You are a helpful real estate assistant. Answer this informational question about our property database.

Database Stats:
- Total Properties: ${stats.total}
- Price Range: $${stats.minPrice.toLocaleString()} - $${stats.maxPrice.toLocaleString()}
- Average Price: $${stats.avgPrice.toLocaleString()}
- Sample Locations: ${stats.locations.join(', ')}

User Question: ${userQuery}

Provide a clear, factual answer using **Markdown formatting**. Do NOT list individual properties unless specifically asked.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Error generating informational response:', error.message);
    throw error;
  }
};

/**
 * Generate AI response using LLM with context
 * @param {string} userQuery - User's question
 * @param {Array} properties - Relevant properties
 * @returns {Promise<string>} - AI-generated response
 */
const generateResponse = async (userQuery, properties, totalMatches = null) => {
  try {
    // If no properties, provide helpful response
    if (properties.length === 0) {
      const prompt = `You are a helpful real estate assistant. The user asked: "${userQuery}"

Unfortunately, we don't have any properties matching those criteria in our database. 

Provide a friendly, apologetic response suggesting they:
1. Try broader search criteria
2. Adjust their filters
3. Check back later for new listings

Use **Markdown formatting** for a clear response.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }

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

    const countInfo = totalMatches !== null && totalMatches > properties.length
      ? `Note: Showing ${properties.length} of ${totalMatches} total matching properties.`
      : `Note: Found ${properties.length} matching ${properties.length === 1 ? 'property' : 'properties'}.`;

    const prompt = `You are a helpful real estate assistant. Based on the following properties, answer the user's question in a friendly and informative way.

${countInfo}

Properties:
${context}

User Question: ${userQuery}

Provide a natural, conversational response using **Markdown formatting**:
- Use **bold** for property names and important details
- Use bullet points (*) for listing amenities or features
- Use headings (##) to organize by location or category when relevant
- IMPORTANT: Mention the actual count (${totalMatches || properties.length} properties) if relevant to the query
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
 * Extract BOTH numerical constraints AND semantic filters (location, property type)
 * @param {string} userMessage - User's natural language query
 * @returns {Promise<Object>} - Extracted filters and query type
 */
const extractFilters = async (userMessage) => {
  try {
    const prompt = `Analyze this real estate query and extract information. Return a JSON object with:

1. "queryType": one of:
   - "informational" - Questions about property count, general info, comparisons (no property list needed)
   - "search" - User wants to see specific properties

2. "filters": object with these fields (omit if not mentioned):
   - minPrice: number (e.g., "over 500k" -> 500000)
   - maxPrice: number (e.g., "under 1M" -> 1000000)
   - bedrooms: number (exact count, e.g., "3 bedrooms" -> 3)
   - bathrooms: number (exact count)
   - location: string (city/state/neighborhood, e.g., "Miami", "Brooklyn", "Atlanta")
   - property_type: string (e.g., "Apartment", "House", "Villa", "Penthouse", "Condo")

Examples:
- "How many properties do you have?" -> {"queryType": "informational", "filters": {}}
- "Show me properties in Miami" -> {"queryType": "search", "filters": {"location": "Miami"}}
- "3 bedroom apartments under 500k in Brooklyn" -> {"queryType": "search", "filters": {"bedrooms": 3, "maxPrice": 500000, "location": "Brooklyn", "property_type": "Apartment"}}
- "What's the most expensive property?" -> {"queryType": "informational", "filters": {}}
- "Penthouse in Las Vegas" -> {"queryType": "search", "filters": {"location": "Las Vegas", "property_type": "Penthouse"}}

Query: "${userMessage}"

Return ONLY the JSON object, no other text:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        queryType: parsed.queryType || 'search',
        filters: parsed.filters || {}
      };
    }
    return { queryType: 'search', filters: {} };
  } catch (error) {
    console.error('⚠️ Error extracting filters:', error.message);
    return { queryType: 'search', filters: {} }; // Default to search on error
  }
};

/**
 * Apply filters to properties array
 * Handles both numerical constraints and semantic filters
 * @param {Array} properties - Properties to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered properties
 */
const applyFilters = (properties, filters) => {
  return properties.filter((property) => {
    // Price filters (strict numerical constraints)
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    
    // Bedroom filter (exact count)
    if (filters.bedrooms && property.bedrooms !== filters.bedrooms) return false;
    
    // Bathroom filter (exact count)
    if (filters.bathrooms && property.bathrooms !== filters.bathrooms) return false;
    
    // Location filter (case-insensitive partial match - STRICT)
    if (filters.location) {
      const locationMatch = property.location.toLowerCase().includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
    }
    
    // Property type filter (fuzzy match for typo tolerance)
    if (filters.property_type) {
      const filterType = filters.property_type.toLowerCase();
      const propertyType = property.property_type.toLowerCase();
      const propertyTitle = property.title.toLowerCase();
      
      // Direct match or contains
      const directMatch = propertyType.includes(filterType) || propertyTitle.includes(filterType);
      
      // Typo tolerance: check if similar (e.g., "appartment" vs "apartment")
      const similarity = calculateStringSimilarity(filterType, propertyType);
      const titleSimilarity = calculateStringSimilarity(filterType, propertyTitle);
      
      const fuzzyMatch = similarity > 0.75 || titleSimilarity > 0.75;
      
      if (!directMatch && !fuzzyMatch) return false;
    }
    
    return true;
  });
};

/**
 * Calculate string similarity using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
const calculateStringSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Main RAG pipeline: Process user message and return AI response with properties
 * @param {string} userMessage - User's natural language query
 * @returns {Promise<Object>} - AI response and relevant properties
 */
const processUserMessage = async (userMessage) => {
  try {
    console.log('🔍 Processing user query:', userMessage);

    // Step 1: Extract filters and determine query type
    const { queryType, filters } = await extractFilters(userMessage);
    console.log('📋 Query type:', queryType);
    console.log('📋 Extracted filters:', filters);

    // Step 2: Handle informational queries (no property listing needed)
    if (queryType === 'informational') {
      const allProperties = await Property.find();
      const aiResponse = await generateInformationalResponse(userMessage, allProperties);
      return {
        response: aiResponse,
        properties: [], // No properties for informational queries
      };
    }

    // Step 3: For search queries, start with vector search
    const queryEmbedding = await embeddingService.generateEmbedding(userMessage);
    let relevantProperties = await vectorSearch(queryEmbedding, 30); // Get more for filtering

    // Step 4: Apply filters (numerical + semantic)
    const hasFilters = Object.keys(filters).length > 0;
    if (hasFilters) {
      relevantProperties = applyFilters(relevantProperties, filters);
      console.log(`🔢 After filtering: ${relevantProperties.length} properties match criteria`);
    }

    // Step 5: If no results after filtering AND we have property_type filter,
    // try relaxing property_type (it might be in the title instead)
    if (relevantProperties.length === 0 && hasFilters && filters.property_type) {
      console.log('⚠️ No results with property_type filter, trying title-based search...');
      
      // Try again without property_type filter, but check title instead
      const filtersWithoutType = { ...filters };
      delete filtersWithoutType.property_type;
      
      const allProperties = await Property.find();
      const titleMatches = allProperties.filter(p => {
        // Check if property title contains the query words
        const queryLower = userMessage.toLowerCase();
        const titleLower = p.title.toLowerCase();
        
        // Split query into words and check if title contains them
        const queryWords = queryLower.split(/\s+/);
        const titleContainsQuery = queryWords.some(word => 
          word.length > 3 && titleLower.includes(word)
        );
        
        return titleContainsQuery;
      });
      
      // Apply remaining filters (location, price, etc.) to title matches
      relevantProperties = applyFilters(titleMatches, filtersWithoutType);
      console.log(`🔢 Found ${relevantProperties.length} properties with title-based search`);
    }

    // Step 6: If still no results after filtering, try getting ALL properties and filter those
    if (relevantProperties.length === 0 && hasFilters) {
      console.log('⚠️ No results from vector search, trying direct filter on all properties...');
      const allProperties = await Property.find();
      relevantProperties = applyFilters(allProperties, filters);
      console.log(`🔢 Found ${relevantProperties.length} properties with direct filtering`);
    }

    // Step 7: Return appropriate number of results
    const finalProperties = relevantProperties.slice(0, Math.min(relevantProperties.length, 10));

    // Step 8: Generate AI response with actual count
    const aiResponse = await generateResponse(userMessage, finalProperties, relevantProperties.length);

    return {
      response: aiResponse,
      properties: finalProperties.map((p) => {
        const obj = p.toObject();
        delete obj.embedding;
        return obj;
      }),
      totalMatches: relevantProperties.length,
    };
  } catch (error) {
    console.error('❌ Error in RAG pipeline:', error.message);
    throw error;
  }
};

module.exports = {
  vectorSearch,
  generateResponse,
  generateInformationalResponse,
  processUserMessage,
  extractFilters,
  applyFilters,
};
