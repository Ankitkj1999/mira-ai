require('dotenv').config();
const mongoose = require('mongoose');
const ragService = require('../server/services/ragService');

async function testScenario(name, query, expectations) {
  console.log('\n' + '='.repeat(70));
  console.log(`📝 Test: ${name}`);
  console.log(`🔍 Query: "${query}"`);
  console.log('='.repeat(70));

  const result = await ragService.processUserMessage(query);

  console.log(`\n📊 Results: ${result.properties.length} properties found\n`);

  if (result.properties.length > 0) {
    result.properties.forEach((prop, i) => {
      console.log(`${i + 1}. ${prop.title}`);
      console.log(`   $${prop.price.toLocaleString()} - ${prop.location} (${prop.property_type})`);
    });
  } else {
    console.log('❌ NO PROPERTIES RETURNED');
  }

  // Check expectations
  let passed = true;
  console.log('\n📋 Expectations:');

  if (expectations.shouldHaveResults !== undefined) {
    const hasResults = result.properties.length > 0;
    const expectPass = hasResults === expectations.shouldHaveResults;
    console.log(`${expectPass ? '✅' : '❌'} Should have results: ${expectations.shouldHaveResults} (actual: ${hasResults})`);
    if (!expectPass) passed = false;
  }

  if (expectations.shouldInclude) {
    const found = result.properties.some(p => 
      p.title.toLowerCase().includes(expectations.shouldInclude.toLowerCase()) ||
      p.location.toLowerCase().includes(expectations.shouldInclude.toLowerCase())
    );
    console.log(`${found ? '✅' : '❌'} Should include: "${expectations.shouldInclude}" (${found ? 'found' : 'not found'})`);
    if (!found) passed = false;
  }

  if (expectations.maxPrice) {
    const allUnderMax = result.properties.every(p => p.price <= expectations.maxPrice);
    console.log(`${allUnderMax ? '✅' : '❌'} All properties under $${expectations.maxPrice.toLocaleString()} (${allUnderMax ? 'yes' : 'no'})`);
    if (!allUnderMax) passed = false;
  }

  if (expectations.minBedrooms) {
    const allMeetMin = result.properties.every(p => p.bedrooms >= expectations.minBedrooms);
    console.log(`${allMeetMin ? '✅' : '❌'} All properties have at least ${expectations.minBedrooms} bedrooms (${allMeetMin ? 'yes' : 'no'})`);
    if (!allMeetMin) passed = false;
  }

  console.log(`\n${passed ? '✅ PASSED' : '❌ FAILED'}`);
  return passed;
}

async function runAllTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const tests = [
      {
        name: 'Penthouse in Las Vegas',
        query: 'penthouse in Las vegas',
        expectations: {
          shouldHaveResults: true,
          shouldInclude: 'Las Vegas'
        }
      },
      {
        name: 'Apartment in Atlanta (typo)',
        query: 'Appartment in Atlanta',
        expectations: {
          shouldHaveResults: true,
          shouldInclude: 'Atlanta'
        }
      },
      {
        name: 'Apartment in Atlanta (correct)',
        query: 'Apartment in Atlanta',
        expectations: {
          shouldHaveResults: true,
          shouldInclude: 'Atlanta'
        }
      },
      {
        name: 'Atlanta Properties',
        query: 'Atlanta Properties',
        expectations: {
          shouldHaveResults: true,
          shouldInclude: 'Atlanta'
        }
      },
      {
        name: 'Properties under 1 million',
        query: 'Properties under 1000000',
        expectations: {
          shouldHaveResults: true,
          maxPrice: 1000000
        }
      },
      {
        name: '3 bedroom apartments',
        query: '3 bedroom apartments',
        expectations: {
          shouldHaveResults: true,
          minBedrooms: 3
        }
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      const result = await testScenario(test.name, test.query, test.expectations);
      if (result) passed++;
      else failed++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);

    await mongoose.connection.close();
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runAllTests();
