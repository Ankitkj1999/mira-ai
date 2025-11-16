require('dotenv').config();
const mongoose = require('mongoose');
const ragService = require('../server/services/ragService');

async function testTypoCase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('Testing typo: "Appartment in Atlanta" (with typo)');
    console.log('='.repeat(70));
    
    const result = await ragService.processUserMessage('Appartment in Atlanta');
    
    console.log(`\nFound ${result.properties.length} properties:`);
    result.properties.forEach((prop, i) => {
      console.log(`${i + 1}. ${prop.title} - ${prop.location}`);
    });

    const hasAtlanta = result.properties.some(p => p.location.includes('Atlanta'));
    console.log(`\n${hasAtlanta ? '✅' : '❌'} Atlanta property ${hasAtlanta ? 'found' : 'not found'}`);

    if (result.properties.length > 0) {
      console.log('\n✅ Query with typo still returns results (semantic search is working)');
    } else {
      console.log('\n❌ Query with typo returns no results');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTypoCase();
