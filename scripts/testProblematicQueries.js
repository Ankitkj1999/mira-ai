require('dotenv').config();
const mongoose = require('mongoose');
const ragService = require('../server/services/ragService');

async function testQuery(query, expectedProperty = null) {
  console.log('\n' + '='.repeat(70));
  console.log(`🔍 Query: "${query}"`);
  console.log('='.repeat(70));

  const result = await ragService.processUserMessage(query);

  console.log(`\n📊 Found ${result.properties.length} properties:\n`);
  
  if (result.properties.length === 0) {
    console.log('❌ NO PROPERTIES RETURNED');
  } else {
    result.properties.forEach((prop, i) => {
      const marker = expectedProperty && prop.title.includes(expectedProperty) ? '✅' : '  ';
      console.log(`${marker} ${i + 1}. ${prop.title}`);
      console.log(`      $${prop.price.toLocaleString()} - ${prop.location}`);
      console.log(`      Type: ${prop.property_type}, ${prop.bedrooms} bed, ${prop.bathrooms} bath`);
    });
  }

  if (expectedProperty) {
    const found = result.properties.some(p => p.title.includes(expectedProperty));
    console.log(`\n${found ? '✅' : '❌'} Expected property "${expectedProperty}" ${found ? 'FOUND' : 'NOT FOUND'}`);
  }
}

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test the problematic queries
    await testQuery('penthouse in Las vegas', 'Sky Villa');
    await testQuery('Appartment in Atlanta', 'Atlanta'); // typo
    await testQuery('Apartment in Atlanta', 'Atlanta'); // correct spelling
    await testQuery('Atlanta Properties', 'Atlanta');
    await testQuery('Properties under 1000000'); // Should still work

    await mongoose.connection.close();
    console.log('\n✅ All tests completed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
