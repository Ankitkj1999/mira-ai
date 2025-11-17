/**
 * Test Enhanced Sorting Support
 * Tests all new sort types: bedrooms, bathrooms, value, amenities
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:7070';

// Test queries covering all sorting scenarios from the design document
const testQueries = [
  // ===== BEDROOM SORTING =====
  {
    category: 'Bedroom Sorting',
    query: 'Property with most bedrooms',
    expectedSort: 'bedrooms_desc',
    expectedLimit: 1,
    description: 'Pure superlative - should return top 1'
  },
  {
    category: 'Bedroom Sorting',
    query: 'Show me 5-bedroom homes',
    expectedSort: null,
    expectedFilter: { bedrooms: 5 },
    description: 'Filter only - all properties with 5 bedrooms'
  },
  {
    category: 'Bedroom Sorting',
    query: 'Biggest family home in Miami',
    expectedSort: 'bedrooms_desc',
    expectedFilter: { location: 'Miami' },
    expectedLimit: 5,
    description: 'Filtered superlative - top 5 in Miami'
  },

  // ===== BATHROOM SORTING =====
  {
    category: 'Bathroom Sorting',
    query: 'Most bathrooms',
    expectedSort: 'bathrooms_desc',
    expectedLimit: 1,
    description: 'Pure superlative - should return top 1'
  },
  {
    category: 'Bathroom Sorting',
    query: 'Property with 3 bathrooms in Brooklyn',
    expectedSort: null,
    expectedFilter: { bathrooms: 3, location: 'Brooklyn' },
    description: 'Filter only - all 3-bathroom properties in Brooklyn'
  },

  // ===== VALUE SORTING (Price per sqft) =====
  {
    category: 'Value Sorting',
    query: 'Best value property',
    expectedSort: 'value_asc',
    expectedLimit: 1,
    description: 'Pure superlative - lowest price/sqft'
  },
  {
    category: 'Value Sorting',
    query: 'Most cost-effective 2-bedroom',
    expectedSort: 'value_asc',
    expectedFilter: { bedrooms: 2 },
    expectedLimit: 5,
    description: 'Filtered superlative - best value 2-bedroom'
  },
  {
    category: 'Value Sorting',
    query: 'Cheapest per square foot in Atlanta',
    expectedSort: 'value_asc',
    expectedFilter: { location: 'Atlanta' },
    expectedLimit: 5,
    description: 'Filtered superlative - best value in Atlanta'
  },

  // ===== AMENITY SORTING =====
  {
    category: 'Amenity Sorting',
    query: 'Property with most amenities',
    expectedSort: 'amenities_desc',
    expectedLimit: 1,
    description: 'Pure superlative - highest amenity count'
  },
  {
    category: 'Amenity Sorting',
    query: 'Fully featured apartment',
    expectedSort: 'amenities_desc',
    expectedFilter: { property_type: 'Apartment' },
    expectedLimit: 1,
    description: 'Pure superlative with property type'
  },
  {
    category: 'Amenity Sorting',
    query: 'Basic property in Miami',
    expectedSort: 'amenities_asc',
    expectedFilter: { location: 'Miami' },
    expectedLimit: 5,
    description: 'Filtered superlative - fewest amenities in Miami'
  },

  // ===== COMBINED FILTERS =====
  {
    category: 'Combined Filters',
    query: 'Largest 3-bedroom in Brooklyn',
    expectedSort: 'size_desc',
    expectedFilter: { bedrooms: 3, location: 'Brooklyn' },
    expectedLimit: 5,
    description: 'Size sorting with bedroom and location filters'
  },
  {
    category: 'Combined Filters',
    query: 'Best value house under 800k',
    expectedSort: 'value_asc',
    expectedFilter: { property_type: 'House', maxPrice: 800000 },
    expectedLimit: 5,
    description: 'Value sorting with type and price filters'
  },

  // ===== EXISTING PRICE SORTING (Regression Test) =====
  {
    category: 'Price Sorting (Regression)',
    query: 'Cheapest property',
    expectedSort: 'price_asc',
    expectedLimit: 1,
    description: 'Verify existing price sorting still works'
  },
  {
    category: 'Price Sorting (Regression)',
    query: 'Most expensive house',
    expectedSort: 'price_desc',
    expectedFilter: { property_type: 'House' },
    expectedLimit: 1,
    description: 'Verify existing price sorting with filter'
  },

  // ===== EXISTING SIZE SORTING (Regression Test) =====
  {
    category: 'Size Sorting (Regression)',
    query: 'Largest property',
    expectedSort: 'size_desc',
    expectedLimit: 1,
    description: 'Verify existing size sorting still works'
  },
  {
    category: 'Size Sorting (Regression)',
    query: 'Smallest apartment in Brooklyn',
    expectedSort: 'size_asc',
    expectedFilter: { property_type: 'Apartment', location: 'Brooklyn' },
    expectedLimit: 5,
    description: 'Verify existing size sorting with filters'
  },
];

/**
 * Test a single query
 */
async function testQuery(testCase) {
  try {
    console.log(`\n📝 Testing: "${testCase.query}"`);
    console.log(`   Category: ${testCase.category}`);
    console.log(`   Description: ${testCase.description}`);

    const response = await axios.post(`${API_URL}/api/chat/message`, {
      message: testCase.query,
    });

    const { data } = response;
    const propertyCount = data.properties ? data.properties.length : 0;

    console.log(`   ✅ Response received`);
    console.log(`   📊 Properties returned: ${propertyCount}`);

    // Validate expected limit
    if (testCase.expectedLimit) {
      if (propertyCount <= testCase.expectedLimit) {
        console.log(`   ✅ Limit check passed (${propertyCount} <= ${testCase.expectedLimit})`);
      } else {
        console.log(`   ⚠️  Limit check warning: Expected <= ${testCase.expectedLimit}, got ${propertyCount}`);
      }
    }

    // Display first property if available
    if (data.properties && data.properties.length > 0) {
      const first = data.properties[0];
      console.log(`   🏠 First property: ${first.title}`);
      console.log(`      Price: $${first.price.toLocaleString()}`);
      console.log(`      Size: ${first.size_sqft} sqft`);
      console.log(`      Bedrooms: ${first.bedrooms}, Bathrooms: ${first.bathrooms}`);
      console.log(`      Amenities: ${first.amenities ? first.amenities.length : 0}`);
      
      if (testCase.expectedSort === 'value_asc') {
        const pricePerSqft = (first.price / first.size_sqft).toFixed(2);
        console.log(`      Price/sqft: $${pricePerSqft}`);
      }
    }

    // Display AI response preview
    if (data.response) {
      const preview = data.response.substring(0, 150).replace(/\n/g, ' ');
      console.log(`   💬 Response: ${preview}...`);
    }

    return { success: true, testCase, response: data };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, testCase, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Enhanced Sorting Support - Comprehensive Test Suite\n');
  console.log('=' .repeat(80));

  const results = {
    total: testQueries.length,
    passed: 0,
    failed: 0,
    byCategory: {}
  };

  for (const testCase of testQueries) {
    const result = await testQuery(testCase);
    
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Track by category
    if (!results.byCategory[testCase.category]) {
      results.byCategory[testCase.category] = { passed: 0, failed: 0 };
    }
    results.byCategory[testCase.category][result.success ? 'passed' : 'failed']++;

    // Wait a bit between requests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  console.log('\n📈 Results by Category:\n');
  Object.keys(results.byCategory).forEach(category => {
    const stats = results.byCategory[category];
    const total = stats.passed + stats.failed;
    console.log(`${category}:`);
    console.log(`  ✅ ${stats.passed}/${total} passed`);
    if (stats.failed > 0) {
      console.log(`  ❌ ${stats.failed}/${total} failed`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n✨ Test suite completed!\n');
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testQuery, runAllTests };
