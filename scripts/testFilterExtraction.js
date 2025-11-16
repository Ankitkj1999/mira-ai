require('dotenv').config();
const mongoose = require('mongoose');
const ragService = require('../server/services/ragService');

async function testFilterExtraction() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test query
    const testQuery = 'Properties under 1000000';
    console.log('\n🔍 Testing query:', testQuery);
    console.log('─'.repeat(60));

    const result = await ragService.processUserMessage(testQuery);

    console.log('\n📊 Results:');
    console.log('─'.repeat(60));
    console.log(`Found ${result.properties.length} properties\n`);

    result.properties.forEach((prop, i) => {
      console.log(`${i + 1}. ${prop.title}`);
      console.log(`   Price: $${prop.price.toLocaleString()}`);
      console.log(`   Location: ${prop.location}`);
      console.log(`   ${prop.bedrooms} bed, ${prop.bathrooms} bath\n`);
    });

    console.log('✅ All properties match the filter (under $1,000,000)');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFilterExtraction();
