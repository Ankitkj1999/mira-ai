require('dotenv').config();
const mongoose = require('mongoose');
const ragService = require('../server/services/ragService');

async function testQuery(query) {
  console.log('\n' + '='.repeat(70));
  console.log(`🔍 Query: "${query}"`);
  console.log('='.repeat(70));

  const result = await ragService.processUserMessage(query);

  console.log(`\n📊 Found ${result.properties.length} properties:\n`);
  result.properties.forEach((prop, i) => {
    console.log(`${i + 1}. ${prop.title} - $${prop.price.toLocaleString()} (${prop.location})`);
  });
}

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test different query types
    await testQuery('Properties under 1000000');
    await testQuery('3 bedroom apartments');
    await testQuery('Houses in California over 2 million');
    await testQuery('Luxury properties with pool');

    await mongoose.connection.close();
    console.log('\n✅ All tests completed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();
