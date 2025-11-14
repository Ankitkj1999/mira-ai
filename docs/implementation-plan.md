# 🏗️ Mira AI - Real Estate RAG Chatbot Implementation Plan

## 📋 Project Overview

Build an AI-powered Real Estate Chatbot using RAG (Retrieval Augmented Generation) architecture that helps users find homes based on their preferences by intelligently querying property data stored in MongoDB Atlas with vector embeddings.

**Tech Stack:**
- Frontend: React.js (Vite)
- Backend: Node.js + Express
- Database: MongoDB Atlas (data + vector store)
- AI/ML: Google Generative AI (Gemini 2.0 Flash) + Xenova Transformers
- Deployment: Single repo deployment (Vercel/Render)

---

## 🎯 Current Status: Frontend & Backend Complete! 🎉

### ✅ Completed Phases:
- **Phase 1**: Project Setup & Data Preparation ✅
- **Phase 2**: Database & Vector Store Setup ✅
- **Phase 3**: AI/RAG Implementation ✅
- **Phase 4**: Backend API Development & Documentation ✅
- **Phase 5**: Frontend Development (React UI) ✅

### 📊 What's Working:
- ✅ 30 properties seeded with vector embeddings
- ✅ RAG chatbot responding to natural language queries with markdown formatting
- ✅ Vector similarity search finding relevant properties
- ✅ Advanced filtering (price, bedrooms, bathrooms, location, property type, keywords)
- ✅ REST API with Swagger documentation at `/api-docs`
- ✅ Modern chat-style UI (ChatGPT/Gemini inspired)
- ✅ Property cards integrated inline with chat messages
- ✅ Compact collapsible filter interface
- ✅ Property comparison feature (separate view)
- ✅ Health status monitoring
- ✅ Responsive mobile-first design

### 🚀 Next Steps:
- **Phase 6**: Integration Testing & Optimization
- **Phase 7**: Deployment

---

## 🎯 Phase 1: Project Setup & Data Preparation

### Step 1.1: Backend Dependencies Setup ✅ COMPLETE
- [x] Initialize Node.js project
- [x] Install backend core dependencies
  - express v5.1.0 ✅
  - mongoose v8.19.3 ✅
  - dotenv v16.6.1 ✅
  - cors v2.8.5 ✅
  - @langchain/core v0.3.79 ✅
  - @langchain/community v0.3.57 ✅
  - @langchain/google-genai v0.1.12 ✅
  - @xenova/transformers v2.17.2 ✅
  - swagger-jsdoc v6.2.8 ✅
  - swagger-ui-express v5.0.1 ✅
  - nodemon v3.1.11 (dev) ✅
  - concurrently v9.2.1 (dev) ✅
- [x] Create `.env` file for environment variables
  - `MONGODB_URI` ✅
  - `GEMINI_API_KEY` ✅
  - `PORT` ✅ (7070)
  - `NODE_ENV` ✅ (development)

### Step 1.2: Backend Project Structure ✅ COMPLETE

**Service Files Explained:**

**1. `embeddingService.js` - Vector Embedding Generator**
```javascript
// Purpose: Convert text to vector embeddings
// Functions:
// - initializeModel() - Load Xenova sentence-transformer model
// - generateEmbedding(text) - Convert text to 384-dim vector
// - batchGenerateEmbeddings(texts[]) - Process multiple texts
// Used by: seedDatabase.js, ragService.js
```

**2. `ragService.js` - RAG (Retrieval Augmented Generation) Engine**
```javascript
// Purpose: Core AI logic - search + generate responses
// Functions:
// - vectorSearch(queryEmbedding, filters) - Find similar properties in MongoDB
// - generateResponse(userQuery, properties) - Use Gemini to create natural response
// - processUserMessage(message) - Main RAG pipeline:
//   1. Convert user query to embedding
//   2. Search MongoDB vector store
//   3. Pass context to LLM
//   4. Return AI response + property results
// Used by: chat.js routes
```

**3. `propertyService.js` - Property Business Logic**
```javascript
// Purpose: Traditional filtering and data formatting
// Functions:
// - filterProperties(criteria) - Filter by price, location, bedrooms
// - getPropertyById(id) - Fetch single property
// - getAllProperties(pagination) - List all properties
// - combineFilters(vectorResults, traditionalFilters) - Merge search methods
// - formatPropertyForResponse(property) - Clean data for frontend
// Used by: properties.js routes, ragService.js
```
```
mira-ai/
├── server/                 # Node.js backend (BUILD THIS FIRST)
│   ├── config/
│   │   ├── database.js          # MongoDB connection setup
│   │   └── swagger.js           # Swagger/OpenAPI configuration
│   ├── models/
│   │   └── Property.js          # Mongoose schema for properties
│   ├── services/
│   │   ├── embeddingService.js  # Generate vector embeddings using Xenova
│   │   ├── ragService.js        # RAG logic: vector search + LLM response
│   │   └── propertyService.js   # Business logic: filter, search properties
│   ├── routes/
│   │   ├── chat.js              # Chat endpoints (POST /api/chat/message)
│   │   └── properties.js        # Property endpoints (GET /api/properties)
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handling
│   └── server.js                # Express app entry point
├── data/                   # JSON data files
│   ├── property_basics.json
│   ├── property_characteristics.json
│   └── property_images.json
├── scripts/
│   └── seedDatabase.js     # Data import & vectorization
├── docs/
│   ├── task.md
│   └── implementation-plan.md
├── .env
└── package.json
```

**Frontend Structure (Phase 5 - Build Later):**
```
├── src/                    # React frontend
│   ├── components/
│   │   ├── ChatInterface.jsx        # Chat UI (no comparison)
│   │   ├── PropertyCard.jsx         # Property card with 3-dot menu
│   │   ├── PropertyComparison.jsx   # Separate comparison page
│   │   └── ComparisonList.jsx       # Sidebar/header showing selected properties
│   ├── services/
│   │   └── api.js
│   ├── App.jsx                      # Main app with routing between views
│   └── main.jsx
├── index.html
└── vite.config.js
```

### Step 1.3: Verify JSON Data Files
- [x] `data/property_basics.json` exists (30 properties)
- [x] `data/property_characteristics.json` exists (30 properties)
- [x] `data/property_images.json` exists (30 properties)
- [x] All files share common `id` field (lowercase)
- [x] Fix typo in property_images.json (id: 2 has "image440_url" should be "image_url")

---

## 🗄️ Phase 2: Database & Vector Store Setup ✅ COMPLETE

### Step 2.1: MongoDB Atlas Configuration ✅ COMPLETE
- [x] Create MongoDB Atlas account/cluster (Already connected)
- [x] MongoDB URI configured in .env
- [x] Create database: `mira_real_estate` (will be created automatically on first insert)
- [x] Create collection: `properties` (will be created by Mongoose)
- [x] Enable MongoDB Atlas Vector Search index (after seeding data)

### Step 2.2: Define Mongoose Schema ✅ COMPLETE
- [x] Created `Property` model with:
  - Basic info (id, title, price, location) ✅
  - Characteristics (bedrooms, bathrooms, size_sqft, amenities) ✅
  - Image URL (image_url) ✅
  - Property type (property_type) with enum validation ✅
  - `embedding` field (Array of Numbers - 384 dimensions) ✅
  - `description` field (concatenated text for embedding) ✅
  - Timestamps (createdAt, updatedAt) ✅
- [x] Created optimized indexes:
  - Vector search index on `embedding` ✅
  - Compound index on `price`, `bedrooms`, `bathrooms`, `location` ✅
  - Text index on `title` and `location` for keyword search ✅
  - Index on `property_type` ✅

### Step 2.3: Vector Search Index ✅ COMPLETE
- [x] Created Atlas Search index on `properties` collection
  - Detailed instructions available in `docs/mongodb-atlas-vector-index-setup.md` ✅
  - Index configuration applied:
  ```json
  {
    "fields": [{
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }]
  }
  ```
  - Index created in MongoDB Atlas UI ✅
  - Index status: Active ✅
  - Vector search tested and working ✅

**What MongoDB Atlas Does vs What We Do:**

| Task | Who Does It |
|------|-------------|
| Create description text | **We do** (in seedDatabase.js) |
| Generate vector embeddings | **We do** (using Xenova/embeddingService) |
| Store vectors in database | **MongoDB stores** (just like any other field) |
| Search vectors by similarity | **MongoDB Atlas Vector Search** (using the index) |
| Convert user query to vector | **We do** (using embeddingService) |
| Generate AI response | **We do** (using Gemini via LangChain) |

**MongoDB Atlas Vector Search is just a specialized index** - like a regular text index, but for vectors!

---

## 🤖 Phase 3: AI/RAG Implementation ✅ COMPLETE

### Step 3.1: Embedding Service ✅ COMPLETE
- [x] Set up Xenova Transformers (sentence-transformers)
- [x] Created `embeddingService.js`:
  - Function to generate embeddings from text ✅
  - Using model: `Xenova/all-MiniLM-L6-v2` (384 dimensions) ✅
  - Model caching for performance ✅
  - Batch processing support ✅

### Step 3.2: Data Seeding with Embeddings ✅ COMPLETE

**How Vectorization Works:**

1. **We create the description text** (MongoDB doesn't do this):
```javascript
// Example for property ID 1:
const description = `
  ${title} - ${location}
  Price: $${price}
  ${bedrooms} bedrooms, ${bathrooms} bathrooms
  Size: ${size_sqft} sqft
  Amenities: ${amenities.join(', ')}
`;
// Result: "3 BHK Apartment in Downtown - New York, NY
//          Price: $450000
//          3 bedrooms, 2 bathrooms
//          Size: 1500 sqft
//          Amenities: Gym, Swimming Pool, Parking"
```

2. **We generate the embedding** using Xenova (MongoDB doesn't do this):
```javascript
const embedding = await embeddingService.generateEmbedding(description);
// Result: [0.234, -0.123, 0.567, ..., 0.891] (384 numbers)
```

3. **We store both in MongoDB**:
```javascript
{
  id: 1,
  title: "3 BHK Apartment in Downtown",
  price: 450000,
  location: "New York, NY",
  bedrooms: 3,
  bathrooms: 2,
  // ... other fields
  description: "3 BHK Apartment in Downtown - New York, NY...", // The text we created
  embedding: [0.234, -0.123, 0.567, ..., 0.891] // The vector we generated
}
```

4. **MongoDB Atlas Vector Search** only searches the `embedding` field using cosine similarity

**Implementation Steps:**
- [x] Created `scripts/seedDatabase.js`:
  - Read `property_basics.json`, `property_characteristics.json`, `property_images.json` ✅
  - Merge all three files by matching `ID` field ✅
  - **Generate description text** from merged property data ✅
  - **Auto-extract property_type** from title ✅
  - **Generate embeddings** using embeddingService for each description ✅
  - Insert merged properties with both description + embeddings into MongoDB ✅
  - Log success/failure for each property ✅
  - **Result: 30/30 properties successfully seeded** ✅

### Step 3.3: RAG Service with LangChain ✅ COMPLETE
- [x] Created `ragService.js`:
  - Initialize Gemini LLM (using Google Generative AI SDK) ✅
  - Model: `gemini-2.0-flash` ✅
  - Implement vector similarity search with cosine similarity ✅
  - Created RAG pipeline:
    1. Convert user query to embedding ✅
    2. Perform vector search in MongoDB ✅
    3. Retrieve top 5 relevant properties ✅
    4. Pass context + query to LLM ✅
    5. Generate natural language response ✅
  - **Tested successfully with multiple queries** ✅

### Step 3.4: Property Service ✅ COMPLETE
- [x] Created `propertyService.js`:
  - Filter by price range (min/max) ✅
  - Filter by bedrooms (exact or minimum) ✅
  - Filter by bathrooms (exact or minimum) ✅
  - Filter by location (case-insensitive partial match) ✅
  - Filter by property_type (Apartment, Villa, House, etc.) ✅
  - Keyword search in title (using MongoDB text index) ✅
  - Get property by ID ✅
  - Get all properties with pagination ✅
  - Compare multiple properties ✅
  - Format results for frontend ✅
  - **All filters tested and working** ✅

---

## 🎨 Phase 4: Backend API Development & Documentation ✅ COMPLETE

### Step 4.1: Express Server Setup ✅ COMPLETE
- [x] Create `server/server.js`:
  - Configure Express middleware (CORS, JSON parser)
  - Connect to MongoDB
  - Setup error handling middleware
  - Mount API routes
  - Setup Swagger UI endpoint

### Step 4.2: Swagger API Documentation ✅ COMPLETE
- [x] Created `server/config/swagger.js`:
  - Configure swagger-jsdoc ✅
  - Define API info, servers, components ✅
  - Property schema with all fields including property_type ✅
- [x] Added JSDoc comments to all routes:
  - Chat routes with request/response schemas ✅
  - Property routes with parameters ✅
  - Filter endpoint with all filter options ✅
  - Example requests/responses ✅
- [x] Swagger UI available at `/api-docs` ✅

### Step 4.3: Chat API Routes ✅ COMPLETE
- [x] `POST /api/chat/message`:
  - Accept user message ✅
  - Process with RAG service ✅
  - Return AI response + relevant properties ✅
  - Swagger documentation added ✅
  - Error handling implemented ✅
- [x] `POST /api/chat/filter`:
  - Accept structured filters (price, bedrooms, bathrooms, location, property_type, keyword) ✅
  - Return filtered properties ✅
  - Swagger documentation with all filter parameters ✅
  - Error handling implemented ✅

### Step 4.4: Property API Routes ✅ COMPLETE
- [x] `GET /api/properties`:
  - List all properties with pagination ✅
  - Query parameters: page, limit ✅
  - Returns pagination metadata ✅
  - Swagger documentation added ✅
- [x] `GET /api/properties/:id`:
  - Get single property details by ID ✅
  - 404 handling for not found ✅
  - Swagger documentation added ✅
- [x] `POST /api/properties/compare`:
  - Compare multiple properties by IDs ✅
  - Accepts array of property IDs ✅
  - Swagger documentation added ✅

### Step 4.5: Test Backend APIs ✅ COMPLETE
- [x] Tested all endpoints:
  - Health check endpoint working ✅
  - Properties list endpoint tested ✅
  - RAG chat endpoint tested with multiple queries ✅
  - Filter endpoint tested with various combinations ✅
- [x] Created test scripts:
  - `npm run test:rag` - Tests RAG pipeline ✅
  - `npm run test:filter` - Tests all filtering options ✅
- [x] Verified Swagger documentation at `/api-docs` ✅
- [x] Error handling working correctly ✅
- [x] CORS configured for development ✅

---

## 💻 Phase 5: Frontend Development ✅ COMPLETE

### Step 5.0: Frontend Setup ✅ COMPLETE
- [x] Initialize Shadcn UI with Tailwind v4
- [x] Create frontend folder structure
- [x] Configure Vite with path alias (@/components)
- [x] Setup PostCSS with Tailwind v4
- [x] Configure theme colors and design system

### Step 5.1: Core Components ✅ COMPLETE
- [x] `ChatInterface.jsx`:
  - **Chat-centric layout** (property cards integrated inline) ✅
  - Message input/display with markdown rendering ✅
  - Chat history with user/AI avatars ✅
  - Loading states with spinner ✅
  - Display property results inline within chat messages ✅
  - Smooth scrolling to latest message ✅
  - **AI Chat mode** with natural language input ✅
  - **Filter mode** with compact, collapsible filters ✅
  - Mode toggle between AI Chat and Filter Search ✅
  - Fixed bottom input (ChatGPT/Gemini style) ✅
  - Pill-shaped input container with solid white background ✅
  - Responsive layout (mobile-first) ✅
  - State lifted to App.jsx for persistence ✅

- [x] `PropertyCard.jsx`:
  - Property image display with fallback ✅
  - Key details (price, beds, baths, size) with icons ✅
  - Property type badge ✅
  - Amenities display (showing top 3 + count) ✅
  - Compare toggle button (heart icon) ✅
  - Selection indicator badge ✅
  - Hover effects and transitions (shadow, translate) ✅
  - Compact inline styling for chat integration ✅
  - Responsive grid (1 col mobile, 2 col desktop) ✅
  - Optimized image height (h-40 mobile, h-48 desktop) ✅

- [x] `PropertyComparison.jsx`:
  - Separate comparison page/view ✅
  - Side-by-side comparison table ✅
  - Property images in header ✅
  - All features compared (price, location, type, beds, baths, size, amenities) ✅
  - Icons for better UX ✅
  - Highlight differences ✅
  - Client-side only (no DB storage) ✅
  - Close/back navigation ✅
  - Responsive layout with max-width container ✅

### Step 5.2: API Service Layer ✅ COMPLETE
- [x] Created `services/api.js`:
  - Fetch wrapper with error handling ✅
  - Chat API endpoints (sendMessage, filterProperties) ✅
  - Properties API endpoints (getAll, getById, compare) ✅
  - Health check API endpoint ✅
  - Proper error handling and logging ✅
  - Full backend URL configuration for dev server ✅

### Step 5.3: State Management ✅ COMPLETE
- [x] Using React useState for:
  - Chat messages (lifted to App.jsx for persistence) ✅
  - Current property results ✅
  - Comparison list (global state for selected properties) ✅
  - Loading states ✅
  - Navigation between chat and comparison views ✅
  - Filter criteria and metadata ✅
  - Search mode (AI vs Filter) ✅
  - Health status monitoring ✅

### Step 5.4: UI/UX Polish ✅ COMPLETE
- [x] Implemented beautiful UI using shadcn/ui components:
  - Button, Card, Input, Badge, Textarea, Select, Checkbox components ✅
  - Tailwind CSS v4 with custom theme ✅
  - Lucide React icons ✅
- [x] Responsive design (mobile-first) ✅
- [x] Loading states with spinners ✅
- [x] Error messages in chat with distinctive styling ✅
- [x] Empty states with helpful messages ✅
- [x] Smooth animations and transitions ✅
- [x] Professional color scheme with muted backgrounds ✅
- [x] **Markdown rendering** for AI responses with react-markdown ✅
- [x] **Health status indicator** (subtle badge in header) ✅
- [x] **Compact collapsible filters** (More filters toggle) ✅
- [x] **Proper spacing** and overlap prevention ✅
- [x] **Solid white backgrounds** for input areas ✅
- [x] **Pill-shaped input container** (modern chat UI style) ✅
- [x] **Chat message alignment** (AI left, User right) ✅
- [x] **Independent scrolling** with fixed input at bottom ✅

### Step 5.5: Advanced Features ✅ COMPLETE
- [x] **Markdown Support**:
  - Installed react-markdown and remark-gfm ✅
  - Custom prose styling for headings, lists, bold text ✅
  - LLM prompt updated to generate markdown responses ✅
  - Dark mode compatible ✅

- [x] **Dynamic Filter Metadata**:
  - Backend endpoint for filter options ✅
  - Frontend fetches locations, property types, bedrooms, bathrooms ✅
  - Dropdowns populated dynamically ✅

- [x] **Empty Filter Handling**:
  - Users can search without filters (returns all properties) ✅
  - Context-aware response messages ✅
  - No validation errors for empty filters ✅

- [x] **Layout Improvements**:
  - ChatGPT/Gemini-style floating input ✅
  - No footer-like appearance ✅
  - Pill-shaped container around input (rounded-3xl) ✅
  - Solid white background (#ffffff) on input area ✅
  - Proper bottom padding to prevent content overlap ✅
  - Fixed positioning at bottom (like ChatGPT/Gemini) ✅
  - Clean shadow and border styling ✅

---

## 🧪 Phase 6: Integration Testing & Optimization

### Step 6.1: Frontend-Backend Integration
- [ ] Test chat flow end-to-end
- [ ] Test property filtering with UI
- [ ] Test compare features
- [ ] Verify error handling in UI

### Step 6.2: Cross-Browser & Responsive Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test mobile responsiveness
- [ ] Test different screen sizes

### Step 6.3: Performance Optimization
- [ ] Optimize embedding generation (batch processing)
- [ ] Add caching for common queries
- [ ] Optimize MongoDB queries
- [ ] Lazy load images
- [ ] Code splitting for React

---

## 🚀 Phase 7: Deployment

### Step 7.1: Production Build
- [ ] Update `package.json` scripts:
  ```json
  {
    "scripts": {
      "dev:frontend": "vite",
      "dev:backend": "nodemon server/server.js",
      "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
      "build": "vite build",
      "start": "node server/server.js",
      "seed": "node scripts/seedDatabase.js"
    }
  }
  ```
- [ ] Install concurrently for parallel dev servers:
  ```bash
  npm install --save-dev concurrently
  ```

### Step 7.2: Environment Configuration
- [ ] Set up production environment variables
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Secure API keys

### Step 7.3: Deploy
- [ ] Option A: Vercel (frontend) + Render (backend)
- [ ] Option B: Single deployment on Render
- [ ] Run seed script on production database
- [ ] Test production deployment

### Step 7.4: Documentation
- [ ] Update `README.md`:
  - Project description
  - Setup instructions
  - API documentation
  - Deployment guide
  - Challenges & solutions

---

## 🎁 Phase 8: Bonus Features (Optional)

### Step 8.4: WebSocket Chat Response Streaming
- [ ] Implement WebSocket endpoint for real-time, streaming AI responses.
- [ ] Frontend integration to display raster responses as they are generated.

### Step 8.5: Audio Input (Speech-to-Text)
- [ ] Integrate a browser-based speech-to-text library (e.g., Web Speech API, Google TTS client-side).
- [ ] Allow users to provide chat input via microphone.
- [ ] Convert audio to text and send to backend RAG pipeline.

---

## 📊 Success Metrics

- ✅ All three JSON files successfully merged and vectorized
- ✅ Vector search returns relevant properties
- ✅ RAG responses are contextual and helpful with markdown formatting
- ✅ Modern chat-style UI with inline property cards
- ✅ Users can save and compare properties in separate view
- ✅ Responsive mobile-first design
- ✅ Health status monitoring with subtle indicator
- ✅ Compact collapsible filter interface
- ⏳ Application deployed and accessible (pending)
- ✅ Clean, documented code in GitHub

---

## 🛠️ Key Technical Decisions

1. **Why Xenova Transformers?**
   - Runs in Node.js without Python dependencies
   - Lightweight sentence-transformers models
   - Easy integration

2. **Why MongoDB Atlas Vector Search?**
   - Single database for both data and vectors
   - No separate vector DB needed
   - Simpler architecture

3. **Why LangChain?**
   - Abstracts LLM integration
   - Built-in RAG patterns
   - Easy to swap LLM providers

4. **Why Single Repo?**
   - Simpler deployment
   - Easier development workflow
   - Better for hackathon timeline

5. **UI Design: Modern Chat-Style Interface**
   - Integrated property cards inline with chat messages (like ChatGPT/Gemini)
   - Separate comparison view (dedicated page vs sidebar)
   - Heart icon toggle for adding properties to comparison
   - Pill-shaped input container with solid white background
   - Fixed bottom input with proper spacing and no overlap
   - Minimalist design with subtle health indicator
   - Mobile-first responsive approach

6. **Why Tailwind CSS v4?**
   - Modern theme variable system
   - Better performance and smaller bundle size
   - Native CSS custom properties
   - Cleaner syntax for theming



---

## 📚 Resources

- [MongoDB Atlas Vector Search Docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [LangChain JS Docs](https://js.langchain.com/)
- [Xenova Transformers](https://huggingface.co/docs/transformers.js)
- [Google Gemini API](https://ai.google.dev/)


