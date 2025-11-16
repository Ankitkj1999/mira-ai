require('dotenv').config();
const mongoose = require('mongoose');
const ragService = require('../server/services/ragService');

async function simulateCurlRequest(query) {
  console.log('\n' + '='.repeat(70));
  console.log(`curl -X POST /api/chat/message -d '{"message":"${query}"}'`);
  console.log('='.repeat(70));

  const result = await ragService.processUserMessage(query);

  // Simulate API response
  const response = {
    success: true,
    data: {
      response: result.response.substring(0, 200) + '...',
      properties: result.properties.map(p => ({
        _id: p._id,
        id: p.id,
        title: p.title,
        price: p.price,
        location: p.location,
        property_type: p.property_type,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms
      }))
    }
  };

  console.log('\n📤 Response:');
  console.log(JSON.stringify(response, null, 2));

  // Validation
  console.log('\n✅ Validation:');
  if (response.data.properties.length === 0) {
    console.log('❌ NO PROPERTIES RETURNED');
    return false;
  } else {
    console.log(`✅ ${response.data.properties.length} properties returned`);
    response.data.properties.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} - $${p.price.toLocaleString()} (${p.location})`);
    });
    return true;
  }
}

async function runCurlTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const scenarios = [
      'Properties under 1000000',
      'penthouse in Las vegas',
      'Appartment in Atlanta',
      'Apartment in Atlanta',
      'Atlanta Properties'
    ];

    let passed = 0;
    let failed = 0;

    for (const query of scenarios) {
      const result = await simulateCurlRequest(query);
      if (result) passed++;
      else failed++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passed}/${scenarios.length}`);
    console.log(`❌ Failed: ${failed}/${scenarios.length}`);

    if (failed === 0) {
      console.log('\n🎉 All curl scenarios working correctly!');
    }

    await mongoose.connection.close();
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runCurlTests();
