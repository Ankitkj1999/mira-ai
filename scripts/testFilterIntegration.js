/**
 * Test Filter Integration
 * Tests the filter endpoint with various criteria
 */

const API_BASE_URL = 'http://localhost:7070';

const tests = [
  {
    name: 'Test 1: Filter by price range and bedrooms',
    filters: {
      minPrice: 300000,
      maxPrice: 600000,
      bedrooms: 3,
      minBedrooms: true,
    },
  },
  {
    name: 'Test 2: Filter by location and property type',
    filters: {
      location: 'New York',
      property_type: 'Apartment',
    },
  },
  {
    name: 'Test 3: Filter with keyword',
    filters: {
      keyword: 'downtown',
    },
  },
  {
    name: 'Test 4: Complex filter',
    filters: {
      minPrice: 300000,
      maxPrice: 600000,
      bedrooms: 3,
      minBedrooms: true,
      bathrooms: 2,
      minBathrooms: true,
      location: 'New York',
      property_type: 'Apartment',
      keyword: 'downtown',
    },
  },
];

async function runTests() {
  console.log('🧪 Testing Filter Integration\n');

  for (const test of tests) {
    console.log(`\n${test.name}`);
    console.log('Filters:', JSON.stringify(test.filters, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.filters),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Success: Found ${data.count} properties`);
        if (data.count > 0) {
          console.log('First result:', {
            title: data.data[0].title,
            price: data.data[0].price,
            location: data.data[0].location,
          });
        }
      } else {
        console.log('❌ Failed:', data.error);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n✅ All tests completed\n');
}

runTests();
