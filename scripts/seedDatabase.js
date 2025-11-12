const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Property = require('../server/models/Property');
const embeddingService = require('../server/services/embeddingService');

/**
 * Read and parse JSON files
 */
const readJSONFile = (filename) => {
  const filePath = path.join(__dirname, '../data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

/**
 * Merge property data from three JSON files
 */
const mergePropertyData = () => {
  console.log('📖 Reading JSON files...');
  
  const basics = readJSONFile('property_basics.json');
  const characteristics = readJSONFile('property_characteristics.json');
  const images = readJSONFile('property_images.json');

  console.log(`✅ Loaded ${basics.length} properties from basics`);
  console.log(`✅ Loaded ${characteristics.length} properties from characteristics`);
  console.log(`✅ Loaded ${images.length} properties from images`);

  // Merge by ID
  const mergedProperties = basics.map((basic) => {
    const char = characteristics.find((c) => c.id === basic.id);
    const img = images.find((i) => i.id === basic.id);

    if (!char || !img) {
      console.warn(`⚠️  Missing data for property ID ${basic.id}`);
    }

    return {
      id: basic.id,
      title: basic.title,
      price: basic.price,
      location: basic.location,
      bedrooms: char?.bedrooms || 0,
      bathrooms: char?.bathrooms || 0,
      size_sqft: char?.size_sqft || 0,
      amenities: char?.amenities || [],
      image_url: img?.image_url || '',
    };
  });

  console.log(`✅ Merged ${mergedProperties.length} properties`);
  return mergedProperties;
};

/**
 * Generate description text for a property
 */
const generateDescription = (property) => {
  return `${property.title} - ${property.location}
Price: $${property.price.toLocaleString()}
${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms
Size: ${property.size_sqft} sqft
Amenities: ${property.amenities.join(', ')}`;
};

/**
 * Seed database with properties and embeddings
 */
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Clear existing data
    console.log('🗑️  Clearing existing properties...');
    await Property.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Merge property data
    const properties = mergePropertyData();
    console.log('');

    // Initialize embedding model
    console.log('🤖 Initializing embedding model...');
    await embeddingService.initializeModel();
    console.log('✅ Embedding model ready\n');

    // Process each property
    console.log('⚙️  Processing properties with embeddings...\n');
    let successCount = 0;
    let errorCount = 0;

    for (const property of properties) {
      try {
        // Generate description
        const description = generateDescription(property);

        // Generate embedding
        console.log(`  Processing ID ${property.id}: ${property.title}`);
        const embedding = await embeddingService.generateEmbedding(description);

        // Create property document
        await Property.create({
          ...property,
          description,
          embedding,
        });

        successCount++;
        console.log(`  ✅ Success (${successCount}/${properties.length})`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error for ID ${property.id}:`, error.message);
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`  ✅ Successfully inserted: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    console.log(`  📦 Total: ${properties.length}`);

    // Verify data
    const count = await Property.countDocuments();
    console.log(`\n✅ Database now contains ${count} properties`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Create Vector Search Index in MongoDB Atlas UI');
    console.log('  2. Go to Atlas → Database → Search → Create Search Index');
    console.log('  3. Use JSON Editor and paste the vector index configuration');
    console.log('  4. Start the server: npm run dev:backend\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the seed script
seedDatabase();
