# MongoDB Atlas Vector Search Index Setup

## 📝 Instructions to Create Vector Search Index

### Step 1: Access MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your cluster (testmondodb)

### Step 2: Navigate to Search Indexes
1. Click on your cluster name
2. Click on the **"Search"** tab (or **"Vector Search"**)
3. Click **"Create Search Index"**

### Step 3: Choose JSON Editor
1. Select **"JSON Editor"** (not Visual Editor)
2. Click **"Next"**

### Step 4: Configure Index
1. **Database**: Select `test` (or the database where properties are stored)
2. **Collection**: Select `properties`
3. **Index Name**: `vector_index` (or leave as default)

### Step 5: Paste Vector Index Configuration

Copy and paste this JSON configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

### Step 6: Create Index
1. Click **"Next"**
2. Review the configuration
3. Click **"Create Search Index"**
4. Wait for the index to build (usually takes 1-2 minutes)

### Step 7: Verify Index
1. Once status shows **"Active"**, the index is ready
2. You should see the index listed under your collection

---

## 🔍 What This Index Does

- **Type**: Vector search index
- **Field**: `embedding` (the 384-dimensional vectors we generated)
- **Similarity**: Cosine similarity (measures angle between vectors)
- **Purpose**: Enables fast semantic search across property descriptions

---

## ✅ Verification

After creating the index, you can verify it's working by:

1. Starting the backend server: `npm run dev:backend`
2. Testing the chat endpoint with a query
3. The RAG service will use this index for vector similarity search

---

## 📚 Additional Resources

- [MongoDB Atlas Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [Create Vector Search Index](https://www.mongodb.com/docs/atlas/atlas-vector-search/create-index/)

---

## ⚠️ Important Notes

- The index must be created **after** seeding the database with embeddings
- The `numDimensions` must match your embedding model (384 for all-MiniLM-L6-v2)
- Index creation is a one-time setup
- You can have multiple indexes on the same collection
