const mongoose = require('mongoose');
require('dotenv').config();

const propertyService = require('../server/services/propertyService');

/**
 * Test enhanced filtering functionality
 */
const testFiltering = async () => {
  try {
    console.log('🧪 Testing Enhanced Property Filtering\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Test 1: Filter by bathrooms
    console.log('🚿 Test 1: Filter by bathrooms (2 bathrooms)');
    const bathroomFilter = await propertyService.filterProperties({ bathrooms: 2 });
    console.log(`✅ Found ${bathroomFilter.length} properties with 2 bathrooms`);
    if (bathroomFilter.length > 0) {
      console.log(`   Example: ${bathroomFilter[0].title} - ${bathroomFilter[0].bathrooms} bathrooms\n`);
    }

    // Test 2: Filter by minimum bathrooms
    console.log('🚿 Test 2: Filter by minimum bathrooms (3+ bathrooms)');
    const minBathroomFilter = await propertyService.filterProperties({ 
      bathrooms: 3, 
      minBathrooms: true 
    });
    console.log(`✅ Found ${minBathroomFilter.length} properties with 3+ bathrooms`);
    if (minBathroomFilter.length > 0) {
      console.log(`   Example: ${minBathroomFilter[0].title} - ${minBathroomFilter[0].bathrooms} bathrooms\n`);
    }

    // Test 3: Keyword search in title
    console.log('🔍 Test 3: Keyword search - "penthouse"');
    const keywordFilter = await propertyService.filterProperties({ keyword: 'penthouse' });
    console.log(`✅ Found ${keywordFilter.length} properties matching "penthouse"`);
    keywordFilter.forEach(p => {
      console.log(`   - ${p.title}`);
    });
    console.log('');

    // Test 4: Filter by property type
    console.log('🏠 Test 4: Filter by property type - "Villa"');
    const typeFilter = await propertyService.filterProperties({ property_type: 'Villa' });
    console.log(`✅ Found ${typeFilter.length} villas`);
    typeFilter.forEach(p => {
      console.log(`   - ${p.title} - $${p.price.toLocaleString()}`);
    });
    console.log('');

    // Test 5: Combined filters
    console.log('🎯 Test 5: Combined filters (3+ bedrooms, 2+ bathrooms, under $1M)');
    const combinedFilter = await propertyService.filterProperties({
      bedrooms: 3,
      minBedrooms: true,
      bathrooms: 2,
      minBathrooms: true,
      maxPrice: 1000000,
    });
    console.log(`✅ Found ${combinedFilter.length} properties matching all criteria`);
    combinedFilter.slice(0, 3).forEach(p => {
      console.log(`   - ${p.title}`);
      console.log(`     ${p.bedrooms} bed, ${p.bathrooms} bath, $${p.price.toLocaleString()}`);
    });
    console.log('');

    // Test 6: Keyword + location
    console.log('🔍 Test 6: Keyword "luxury" in New York or California');
    const luxuryFilter = await propertyService.filterProperties({ 
      keyword: 'luxury',
    });
    const luxuryInLocations = luxuryFilter.filter(p => 
      p.location.includes('NY') || p.location.includes('CA')
    );
    console.log(`✅ Found ${luxuryInLocations.length} luxury properties in NY/CA`);
    luxuryInLocations.forEach(p => {
      console.log(`   - ${p.title} - ${p.location}`);
    });
    console.log('');

    // Test 7: Property type distribution
    console.log('📊 Test 7: Property type distribution');
    const allProperties = await propertyService.getAllProperties(1, 100);
    const typeCount = {};
    allProperties.properties.forEach(p => {
      typeCount[p.property_type] = (typeCount[p.property_type] || 0) + 1;
    });
    console.log('Property types in database:');
    Object.entries(typeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n🎉 All filtering tests completed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run tests
testFiltering();
