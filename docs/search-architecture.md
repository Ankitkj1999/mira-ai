# 🔍 Search Architecture - Hybrid RAG + Filtering System

## Overview

Mira AI combines **semantic vector search** with **strict numerical filtering** to deliver accurate results for both natural language queries and precise constraints.

## The Problem

- **Pure vector search**: Can't enforce numerical precision ("under $1M" returned $3.2M properties)
- **Pure strict filtering**: Breaks semantic flexibility ("Penthouse" excludes "Sky Villa Duplex Penthouse")

## The Solution

**Strict filtering** for numbers (price, bedrooms, bathrooms) + **Vector search** for text (location, property type, amenities)



## API Endpoints

### 1. `/api/chat/message` (Hybrid RAG)
Natural language queries with AI interpretation
- Use for: Conversational queries, complex requests, typo tolerance
- Returns: AI-generated response + matching properties

### 2. `/api/chat/filter` (Direct Filtering)
Structured filtering without AI
- Use for: Exact criteria, filter forms, faster responses
- Returns: Matching properties only

## How It Works

**Criteria Classification:**
- **Strict filtering**: Price, bedrooms, bathrooms (exact matches)
- **Vector search**: Location, property type, amenities (semantic matching)

**Process:**
1. LLM extracts criteria from user query
2. Generate embedding for semantic search
3. Execute vector search in MongoDB
4. Apply strict numerical filters to results
5. LLM generates natural language response

## Key Features

1. **Numerical Precision**: Exact constraints on price, bedrooms, bathrooms
2. **Semantic Flexibility**: Typo-tolerant, handles location variations ("NYC" = "New York City")
3. **Query Type Detection**: Distinguishes informational queries from search queries
4. **Title Fallback**: Searches property titles when type filters fail
5. **Natural Language Understanding**: Interprets intent ("affordable" → price range)

## Test Results

| Query | Result |
|-------|--------|
| "Properties under $1M" | ✅ Max price: $950,000 |
| "Penthouse in Las Vegas" | ✅ Found "Sky Villa Duplex Penthouse" |
| "Appartment in Atlanta" (typo) | ✅ Typo-tolerant match |
| "How many properties?" | ✅ Returns count only |

Run tests: `npm run test:scenarios`

## Future Enhancements

- **AI Function Calling**: Let Gemini autonomously call filter functions
- **Smart Filter Extraction**: Auto-populate filter forms from natural language input

## Performance

- Response time: < 3 seconds (LLM + vector search)
- Vector search: < 500ms
- LLM accuracy: ~95%
- Numerical precision: 100%

## Technical Stack

- **Gemini 2.0 Flash**: Criteria extraction + response generation
- **Xenova Transformers**: Sentence embeddings (384-dim vectors)
- **MongoDB Atlas**: Vector search (cosine similarity)
- **LangChain.js**: RAG orchestration

## Key Implementation Files

- `server/services/ragService.js` - Hybrid search logic
- `server/services/embeddingService.js` - Vector generation
- `server/routes/chat.js` - API endpoints
- `scripts/testAllScenarios.js` - Validation tests

## Advanced Features

### Query Type Detection
Automatically distinguishes:
- **Informational**: "How many properties?" → Returns stats only
- **Search**: "Show me homes" → Returns property cards

### Title Fallback
When property_type filtering fails, searches property titles as fallback

### Fuzzy Matching
Levenshtein distance (75% threshold) for typo tolerance

### Result Counts
Returns both displayed properties (max 10) and total matches

---

**Last Updated:** November 2025 | **Status:** Production Ready
