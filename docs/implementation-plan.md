# 🏗️ Mira AI - Real Estate RAG Chatbot Implementation Plan

## 📋 Project Overview

Build an AI-powered Real Estate Chatbot using RAG (Retrieval Augmented Generation) architecture that helps users find homes based on their preferences by intelligently querying property data stored in MongoDB Atlas with vector embeddings.

**Tech Stack:**
- Frontend: React.js (Vite)
- Backend: Node.js + Express
- Database: MongoDB Atlas (data + vector store)
- AI/ML: LangChain + Gemini API + Sentence Transformers
- Deployment: Single repo deployment (Vercel/Render)

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
│   │   ├── ChatInterface.jsx
│   │   ├── PropertyCard.jsx
│   │   └── PropertyComparison.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
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

## 🗄️ Phase 2: Database & Vector Store Setup

### Step 2.1: MongoDB Atlas Configuration
- [ ] Create MongoDB Atlas account/cluster
- [ ] Enable MongoDB Atlas Vector Search
- [ ] Create database: `mira_real_estate`
- [ ] Create collection:
  - `properties` (with vector search index)

### Step 2.2: Define Mongoose Schema
- [ ] Create `Property` model with:
  - Basic info (title, price, location)
  - Characteristics (bedrooms, bathrooms, size, amenities)
  - Images array
  - `embedding` field (Array of Numbers for vector)
  - `description` field (concatenated text for embedding)

### Step 2.3: Vector Search Index
- [ ] Create Atlas Search index on `properties` collection
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

## 🤖 Phase 3: AI/RAG Implementation

### Step 3.1: Embedding Service
- [ ] Set up Xenova Transformers (sentence-transformers)
- [ ] Create `embeddingService.js`:
  - Function to generate embeddings from text
  - Use model: `Xenova/all-MiniLM-L6-v2` (384 dimensions)
  - Cache model for performance

### Step 3.2: Data Seeding with Embeddings

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
- [ ] Create `scripts/seedDatabase.js`:
  - Read `property_basics.json`, `property_characteristics.json`, `property_images.json`
  - Merge all three files by matching `ID` field
  - **Generate description text** from merged property data
  - **Generate embeddings** using embeddingService for each description
  - Insert merged properties with both description + embeddings into MongoDB
  - Log success/failure for each property

### Step 3.3: RAG Service with LangChain
- [ ] Create `ragService.js`:
  - Initialize Gemini LLM via LangChain
  - Implement vector similarity search
  - Create RAG chain:
    1. Convert user query to embedding
    2. Perform vector search in MongoDB
    3. Retrieve top K relevant properties
    4. Pass context + query to LLM
    5. Generate natural language response

### Step 3.4: Property Service
- [ ] Create `propertyService.js`:
  - Filter properties by criteria (budget, location, bedrooms)
  - Combine vector search with traditional filters
  - Format results for frontend

---

## 🎨 Phase 4: Backend API Development & Documentation

### Step 4.1: Express Server Setup
- [ ] Create `server/server.js`:
  - Configure Express middleware (CORS, JSON parser)
  - Connect to MongoDB
  - Setup error handling middleware
  - Mount API routes
  - Setup Swagger UI endpoint

### Step 4.2: Swagger API Documentation
- [ ] Create `server/config/swagger.js`:
  - Configure swagger-jsdoc
  - Define API info, servers, components
  - Setup security schemes if needed
- [ ] Add JSDoc comments to all routes with:
  - Request/response schemas
  - Parameters documentation
  - Example requests/responses
- [ ] Swagger UI available at `/api-docs`

### Step 4.3: Chat API Routes
- [ ] `POST /api/chat/message`:
  - Accept user message
  - Process with RAG service
  - Return AI response + relevant properties
  - Add Swagger documentation
- [ ] `POST /api/chat/filter`:
  - Accept structured filters
  - Return filtered properties
  - Add Swagger documentation

### Step 4.4: Property API Routes
- [ ] `GET /api/properties`:
  - List all properties (with pagination)
  - Add Swagger documentation
- [ ] `GET /api/properties/:id`:
  - Get single property details
  - Add Swagger documentation
- [ ] `POST /api/properties/compare`:
  - Compare multiple properties
  - Add Swagger documentation

### Step 4.5: Test Backend APIs
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Verify Swagger documentation is accurate
- [ ] Test error handling
- [ ] Verify CORS configuration

---

## 💻 Phase 5: Frontend Development (After Backend is Complete)

### Step 5.0: Frontend Setup
- [ ] Install React/Vite dependencies (if not already done)
  ```bash
  npm install react react-dom
  npm install --save-dev @vitejs/plugin-react
  ```
- [ ] Create frontend folder structure
- [ ] Configure Vite to proxy API requests to backend

### Step 5.1: Core Components
- [ ] `ChatInterface.jsx`:
  - Message input/display
  - Chat history
  - Loading states
  - Display property results inline

- [ ] `PropertyCard.jsx`:
  - Property image carousel
  - Key details display
  - Compare checkbox (local state)

- [ ] `PropertyComparison.jsx`:
  - Side-by-side comparison table
  - Highlight differences
  - Client-side only (no DB storage)

### Step 5.2: API Service Layer
- [ ] Create `services/api.js`:
  - Axios/fetch wrapper
  - API endpoints configuration
  - Error handling

### Step 5.3: State Management
- [ ] Use React Context or simple state for:
  - Chat messages
  - Current property results
  - Comparison selection (client-side only)

### Step 5.4: UI/UX Polish
- [ ] Responsive design (mobile-first)
- [ ] Loading skeletons
- [ ] Error messages
- [ ] Empty states
- [ ] Smooth animations

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

### Step 8.1: Enhanced NLP
- [ ] Improve query understanding with Gemini
- [ ] Handle complex multi-criteria queries
- [ ] Extract structured data from natural language

### Step 8.2: Real-Time Search
- [ ] Implement debounced search
- [ ] Live filtering as user types
- [ ] Search suggestions

### Step 8.3: Advanced Features
- [ ] Property recommendations based on history
- [ ] Price trend analysis
- [ ] Neighborhood insights
- [ ] Virtual tour integration

---

## 📊 Success Metrics

- ✅ All three JSON files successfully merged and vectorized
- ✅ Vector search returns relevant properties
- ✅ RAG responses are contextual and helpful
- ✅ Users can save and compare properties
- ✅ Application deployed and accessible
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

---

## ⏱️ Estimated Timeline

**Backend Focus (Phases 1-4):**
- Phase 1: 1-2 hours (Project Setup & Data Prep)
- Phase 2: 2-3 hours (Database & Vector Store)
- Phase 3: 3-4 hours (AI/RAG Implementation)
- Phase 4: 3-4 hours (Backend API + Swagger)

**Frontend Focus (Phases 5-6):**
- Phase 5: 4-5 hours (React UI Development)
- Phase 6: 2 hours (Testing & Integration)

**Deployment (Phase 7):**
- Phase 7: 1-2 hours (Deployment)

**Optional (Phase 8):**
- Phase 8: 2-3 hours (Bonus features)

**Total: 18-25 hours**

---

## 📚 Resources

- [MongoDB Atlas Vector Search Docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [LangChain JS Docs](https://js.langchain.com/)
- [Xenova Transformers](https://huggingface.co/docs/transformers.js)
- [Google Gemini API](https://ai.google.dev/)

---

## 🎯 Development Workflow

**Phase 1-4: Backend First Approach**
1. Setup backend structure and dependencies
2. Create data files and seed database
3. Build AI/RAG services
4. Create REST APIs with Swagger docs
5. Test all APIs using Swagger UI or Postman

**Phase 5-6: Frontend Integration**
1. Build React components
2. Connect to backend APIs
3. Test full integration

**Phase 7: Deploy**

---

**Next Step:** Begin with Phase 1.1 - Install backend dependencies and set up environment variables.
