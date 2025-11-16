# Filter Extraction Fix

## Problem

When users queried for properties with specific constraints (e.g., "Properties under 1000000"), the system had a mismatch between:
- **LLM Response**: Correctly identified properties matching the criteria
- **Properties Array**: Returned semantically similar properties that didn't match the numerical constraints

### Example Issues
1. Query: "Properties under 1000000"
   - LLM correctly listed properties under $1M in the text response
   - But the properties array included a $3.2M property as the first result

2. Query: "Penthouse in Las Vegas"
   - No results returned because strict property_type filter didn't match DB value

3. Query: "Appartment in Atlanta" (typo)
   - No results due to overly strict filtering

## Root Cause

The RAG pipeline only used **vector similarity search**, which finds semantically similar property descriptions but doesn't understand numerical constraints like price ranges or bedroom counts.

## Solution

Added a **hybrid filtering approach** that combines semantic search with numerical constraints:

1. **Extract ONLY Numerical Filters**: Use LLM to parse explicit numerical constraints (price, bedrooms, bathrooms)
2. **Let Semantic Search Handle the Rest**: Location and property type matching is handled by vector similarity
3. **Apply Numerical Filters**: Filter vector search results using only the numerical constraints

### Implementation

```javascript
// Step 1: Extract ONLY numerical filters from natural language
const filters = await extractFilters(userMessage);
// "Properties under 1000000" → {maxPrice: 1000000}
// "Penthouse in Las Vegas" → {} (no numerical constraints)
// "3 bedroom apartments" → {minBedrooms: 3}

// Step 2: Vector search (semantic matching for location/property type)
const relevantProperties = await vectorSearch(queryEmbedding, 20);

// Step 3: Apply ONLY numerical filters
const filteredProperties = applyFilters(relevantProperties, filters);

// Step 4: Return top 5 after filtering
const finalProperties = filteredProperties.slice(0, 5);
```

## Benefits

✅ **Accurate Numerical Constraints**: Price and bedroom/bathroom filters are strictly enforced
✅ **Flexible Semantic Search**: Location and property type matching uses vector similarity (handles typos, synonyms)
✅ **Best of Both Worlds**: Combines precision of structured filters with flexibility of semantic search
✅ **Robust to Typos**: "Appartment" still finds "Apartment" properties
✅ **Property Type Flexibility**: "Penthouse" can match properties labeled as "Villa" if semantically similar

## Testing

Run the test scripts to verify:

```bash
# Test the exact curl scenario
node scripts/testCurlScenario.js

# Test multiple query types
node scripts/testMultipleQueries.js

# Test filter extraction
node scripts/testFilterExtraction.js
```

## Supported Filters (Numerical Only)

- `minPrice` / `maxPrice`: Price range constraints (strict)
- `minBedrooms`: Minimum bedroom count (strict)
- `minBathrooms`: Minimum bathroom count (strict)

**Note**: Location and property type are NOT extracted as filters - they're handled by semantic vector search for maximum flexibility.

## Example Queries

| Query | Extracted Filters | How It Works |
|-------|------------------|--------------|
| "Properties under 1000000" | `{maxPrice: 1000000}` | Strict price filter + semantic search |
| "Penthouse in Las Vegas" | `{}` | Pure semantic search (finds "Sky Villa Duplex Penthouse") |
| "Appartment in Atlanta" | `{}` | Pure semantic search (typo-tolerant) |
| "3 bedroom apartments" | `{minBedrooms: 3}` | Bedroom filter + semantic search for "apartments" |
| "Houses over 500k with 4 beds" | `{minPrice: 500000, minBedrooms: 4}` | Price + bedroom filters + semantic search for "houses" |
| "Luxury properties with pool" | `{}` | Pure semantic search |
