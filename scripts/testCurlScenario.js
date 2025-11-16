require('dotenv').config();
const mongoose = require('mongoose');
const ragService = require('../server/services/ragService');

async function testCurlScenario() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Exact query from the curl command
    const query = 'Properties Properties under 1000000';
    
    console.log('Testing the exact curl scenario:');
    console.log('Query:', query);
    console.log('─'.repeat(70));

    const result = await ragService.processUserMessage(query);

    console.log('\n✅ LLM Response Preview:');
    console.log('─'.repeat(70));
    console.log(result.response.substring(0, 300) + '...\n');

    console.log('📊 Properties Returned:');
    console.log('─'.repeat(70));
    
    let allUnderMillion = true;
    result.properties.forEach((prop, i) => {
      const isValid = prop.price <= 1000000;
      const status = isValid ? '✅' : '❌';
      console.log(`${status} ${i + 1}. ${prop.title}`);
      console.log(`   Price: $${prop.price.toLocaleString()}`);
      console.log(`   Location: ${prop.location}`);
      console.log(`   Beds: ${prop.bedrooms}, Baths: ${prop.bathrooms}\n`);
      
      if (!isValid) allUnderMillion = false;
    });

    console.log('─'.repeat(70));
    if (allUnderMillion) {
      console.log('✅ SUCCESS: All properties are under $1,000,000');
      console.log('✅ The LLM response matches the actual properties returned');
    } else {
      console.log('❌ FAILURE: Some properties exceed $1,000,000');
    }

    await mongoose.connection.close();
    process.exit(allUnderMillion ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCurlScenario();
