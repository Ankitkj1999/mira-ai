# Mira AI - Real Estate RAG Chatbot

## 📋 Project Overview

Mira AI is an intelligent real estate chatbot that helps users find their dream homes. It uses a Retrieval Augmented Generation (RAG) architecture to understand user queries, search a database of properties using vector similarity, and provide natural, context-aware responses.

For a detailed breakdown of the project architecture, phases, and technical decisions, please see the [Implementation Plan](./docs/implementation-plan.md).

## ✨ Features

- **Conversational Search:** Find properties by describing what you're looking for in natural language.
- **Vector-Powered Search:** Utilizes MongoDB Atlas Vector Search to find semantically similar properties.
- **Advanced Filtering:** Combine conversational search with traditional filters like price, location, bedrooms, and more.
- **Interactive API Documentation:** A full Swagger/OpenAPI interface to explore and test the API endpoints.

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite)
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (for both data and vector storage)
- **AI/ML:**
  - LangChain.js for RAG orchestration
  - Google Gemini for language understanding and generation
  - Xenova Transformers.js for generating sentence embeddings

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A MongoDB Atlas account
- A Google Gemini API Key

### 1. Clone & Install

```bash
git clone <repository-url>
cd mira-ai
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root and add your credentials:

```env
# MongoDB Atlas connection string
MONGODB_URI="your_mongodb_atlas_connection_string"

# Google Gemini API Key
GEMINI_API_KEY="your_gemini_api_key"

# Server Port
PORT=7070
```

### 3. Seed the Database

Run the seed script to populate the MongoDB database with property data and generate vector embeddings.

```bash
npm run seed
```
*Note: This may take a few minutes on the first run as it downloads the embedding model.*

### 4. Create Vector Search Index (Manual Step)

After seeding, you must create a Vector Search Index in your MongoDB Atlas dashboard.

1.  Navigate to your cluster in Atlas and go to the **Search** tab.
2.  Click **Create Search Index** and select **Atlas Vector Search**.
3.  Choose the `mira_real_estate` database, `properties` collection, and name the index (e.g., `vector_index`).
4.  Use the **JSON Editor** and paste the following configuration:
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
5.  Create the index and wait for it to build.

### 5. Run the Project

This command starts both the backend and frontend development servers.

```bash
npm run dev
```

- **Backend Server:** `http://localhost:7070`
- **Frontend App:** `http://localhost:5173` (or next available port)

---

## 📚 API Documentation

Once the backend is running, you can access the interactive Swagger API documentation at:

**➡️ http://localhost:7070/api-docs**
