# Filter Extraction Fix

## Problem

When users queried for properties with specific constraints (e.g., "Properties under 1000000"), the system had a mismatch between:
- **LLM Response**: Correctly identified properties matching the criteria
- **Properties Array**: Returned semantically similar properties that didn't match the numerical constraints

### Example Issue
Query: "Properties under 1000000"
- LLM correctly listed properties under $1M in the text response
- But the properties array included a $3.2M property as the first result

## Root Cause

The RAG pipeline only used **vector similarity search**, which finds semantically similar property descriptions but doesn't understand numerical or categorical constraints like:
- Price ranges (under/over X amount)
- Exact bedroom/bathroom counts
- Specific locations
- Property types

## Solution

Added a **two-step filtering approach**:

1. **Extract Structured Filters**: Use LLM to parse the natural language query and extract structured filters (price, bedrooms, location, etc.)
2. **Apply Filters**: Filter the vector search results using the extracted constraints

### Implementation

```javascript
// Step 1: Extract filters from natural language
const filters = await extractFilters(userMessage);
// Example: "Properties under 1000000" → {maxPrice: 1000000}

// Step 2: Vector search (get more results to account for filtering)
const relevantProperties = await vectorSearch(queryEmbedding, 20);

// Step 3: Apply extracted filters
const filteredProperties = applyFilters(relevantProperties, filters);

// Step 4: Return top 5 after filtering
const finalProperties = filteredProperties.slice(0, 5);
```

## Benefits

✅ **Accurate Results**: Properties returned now match both semantic similarity AND explicit constraints
✅ **Simple Implementation**: No complex NLP parsing, just LLM-based extraction
✅ **Flexible**: Handles various query types (price ranges, bedrooms, locations, etc.)
✅ **Backward Compatible**: Queries without filters still work using pure vector search

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

## Supported Filters

- `minPrice` / `maxPrice`: Price range constraints
- `bedrooms`: Minimum bedroom count
- `bathrooms`: Minimum bathroom count
- `location`: City or state (partial match)
- `property_type`: Apartment, House, Villa, Condo, etc.

## Example Queries

| Query | Extracted Filters |
|-------|------------------|
| "Properties under 1000000" | `{maxPrice: 1000000}` |
| "3 bedroom apartments in Boston" | `{bedrooms: 3, location: "Boston", property_type: "Apartment"}` |
| "Houses over 500k with 4 beds" | `{minPrice: 500000, bedrooms: 4, property_type: "House"}` |
| "Luxury properties with pool" | `{}` (semantic search only) |
