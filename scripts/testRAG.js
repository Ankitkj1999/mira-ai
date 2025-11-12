const mongoose = require('mongoose');
require('dotenv').config();

const ragService = require('../server/services/ragService');
const propertyService = require('../server/services/propertyService');

/**
 * Test RAG functionality
 */
const testRAG = async () => {
  try {
    console.log('🧪 Testing RAG Chatbot Functionality\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Test 1: Check if properties exist
    console.log('📊 Test 1: Checking database...');
    const allProperties = await propertyService.getAllProperties(1, 5);
    console.log(`✅ Found ${allProperties.pagination.total} properties in database`);
    console.log(`   First property: ${allProperties.properties[0].title}\n`);

    // Test 2: Test property filtering
    console.log('🔍 Test 2: Testing traditional filtering...');
    const filteredProps = await propertyService.filterProperties({
      minPrice: 300000,
      maxPrice: 500000,
      bedrooms: 3,
    });
    console.log(`✅ Found ${filteredProps.length} properties with 3 bedrooms, price $300k-$500k\n`);

    // Test 3: Test RAG with different queries
    const testQueries = [
      'Show me affordable homes under $500,000',
      'I want a luxury beachfront property',
      'Find me a family home with a pool',
    ];

    console.log('🤖 Test 3: Testing RAG Pipeline...\n');

    for (const query of testQueries) {
      console.log(`📝 Query: "${query}"`);
      console.log('   Processing...');

      try {
        const result = await ragService.processUserMessage(query);

        console.log(`   ✅ AI Response: ${result.response.substring(0, 150)}...`);
        console.log(`   ✅ Found ${result.properties.length} relevant properties`);

        if (result.properties.length > 0) {
          console.log(`   📍 Top match: ${result.properties[0].title} - $${result.properties[0].price.toLocaleString()}`);
        }
        console.log('');
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log('🎉 All tests completed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run tests
testRAG();
