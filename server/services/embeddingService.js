const { pipeline } = require('@xenova/transformers');

let embeddingModel = null;

/**
 * Initialize the embedding model (Xenova sentence-transformers)
 * Model: all-MiniLM-L6-v2 (384 dimensions)
 */
const initializeModel = async () => {
  if (!embeddingModel) {
    console.log('🔄 Loading embedding model...');
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded');
  }
  return embeddingModel;
};

/**
 * Generate embedding for a single text
 * @param {string} text - Text to convert to embedding
 * @returns {Promise<number[]>} - 384-dimensional vector
 */
const generateEmbedding = async (text) => {
  try {
    const model = await initializeModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('❌ Error generating embedding:', error.message);
    throw error;
  }
};

/**
 * Generate embeddings for multiple texts (batch processing)
 * @param {string[]} texts - Array of texts
 * @returns {Promise<number[][]>} - Array of embeddings
 */
const batchGenerateEmbeddings = async (texts) => {
  try {
    const embeddings = await Promise.all(texts.map((text) => generateEmbedding(text)));
    return embeddings;
  } catch (error) {
    console.error('❌ Error in batch embedding generation:', error.message);
    throw error;
  }
};

module.exports = {
  initializeModel,
  generateEmbedding,
  batchGenerateEmbeddings,
};
