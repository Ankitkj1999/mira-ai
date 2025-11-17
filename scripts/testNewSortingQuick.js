/**
 * Quick test for new sorting features
 * Tests bedroom, bathroom, value, and amenity sorting
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:7070';

// Quick focused tests
const testQueries = [
  'Property with most bedrooms',
  'Best value property',
  'Property with most amenities',
  'Most bathrooms',
  'Cheapest property',  // Regression test
  'Largest property',   // Regression test
];

async function testQuery(query) {
  try {
    console.log(`\n🔍 Query: "${query}"`);
    
    const response = await axios.post(`${API_URL}/api/chat/message`, {
      message: query,
    });

    const { properties, response: aiResponse } = response.data.data;
    
    if (properties && properties.length > 0) {
      const p = properties[0];
      console.log(`✅ Got ${properties.length} result(s)`);
      console.log(`   🏠 ${p.title}`);
      console.log(`   💰 Price: $${p.price.toLocaleString()}`);
      console.log(`   📐 Size: ${p.size_sqft} sqft`);
      console.log(`   🛏️  Bedrooms: ${p.bedrooms}, Bathrooms: ${p.bathrooms}`);
      console.log(`   🎁 Amenities: ${p.amenities.length}`);
      console.log(`   💵 Price/sqft: $${(p.price / p.size_sqft).toFixed(2)}`);
    } else {
      console.log(`⚠️  No properties returned`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Quick Sorting Feature Test\n');
  console.log('='.repeat(60));
  
  for (const query of testQueries) {
    await testQuery(query);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Test completed!\n');
}

runTests().catch(console.error);
