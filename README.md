# FlowSync

**FlowSync** is a full-stack project management and team collaboration platform with real-time chat, AI-powered task analysis, and intelligent assistant capabilities.

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **Vite 8** (with React Compiler enabled)
- **React Router DOM v7** for client-side routing
- **MUI (Material UI / Joy UI)** for component library
- **Socket.IO Client** for real-time messaging
- **Axios** for HTTP API communication
- **GSAP / Motion / Three.js / OGL** for advanced UI animations
- **React Icons**, **dayjs**, **Emotion** for styling utilities

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **Socket.IO** for real-time bidirectional communication
- **JWT Authentication** via custom auth middleware
- **AES-256-CBC Encryption** for secure API key storage
- **Axios** for external API communication (OpenRouteService, NVIDIA NIM)

---

## 📁 Project Structure

```
FlowSync/
├── backend/
│   └── src/
│       ├── app.js                    # Express app setup & route registration
│       ├── server.js                 # HTTP server, Socket.IO setup, DB connect
│       ├── config/
│       │   └── db.js                 # MongoDB connection
│       ├── middleware/
│       │   └── auth.middleware.js    # JWT auth guard
│       ├── models/
│       │   ├── AISettings.js         # [NEW] AI provider config per user
│       │   ├── Chat.js               # Chat message model
│       │   ├── Task.js               # Task model
│       │   └── User.js               # User model
│       ├── controllers/
│       │   ├── aiassistence.controller.js  # [NEW] AI assistant endpoints
│       │   ├── auth.controller.js
│       │   ├── chat.controller.js
│       │   ├── dashboard.controller.js     # [UPDATED] Integrated dashboard services
│       │   ├── map.controller.js           # [NEW] ETA calculation via OpenRouteService
│       │   ├── task.controller.js          # [UPDATED] Task CRUD improvements
│       │   └── user.controller.js
│       ├── routes/
│       │   ├── aiassistence.routes.js      # [NEW] /api/ai/* routes
│       │   ├── auth.routes.js
│       │   ├── chat.routes.js
│       │   ├── dashboard.routs.js          # [UPDATED]
│       │   ├── map.route.js                # [NEW] /api/eta route
│       │   ├── task.routes.js              # [UPDATED]
│       │   └── user.routes.js
│       ├── services/
│       │   ├── aiassistence.services.js    # [NEW] AI LLM request logic
│       │   ├── auth.services.js
│       │   ├── chat.services.js
│       │   ├── dashboard.services.js       # [NEW] Dashboard query helpers
│       │   └── task.services.js
│       ├── prompts/
│       │   ├── aiChat.prompts.js           # [NEW] Chat prompt builder
│       │   └── taskAnalysis.prompts.js     # [NEW] Task analysis prompt builder
│       └── utils/
│           └── encryption.js              # [NEW] AES-256-CBC encrypt/decrypt
├── src/
│   ├── App.jsx                            # [UPDATED] Added /ai-assist route
│   ├── api/
│   │   ├── aiassistenceApi.js             # [NEW] AI assistant API client
│   │   ├── dashboard.js                   # [NEW] Dashboard API client
│   │   ├── authApi.js
│   │   ├── axios.js
│   │   ├── chatApi.js
│   │   ├── taskApi.js
│   │   └── userApi.js
│   ├── pages/
│   │   ├── AIAssist.jsx                   # [NEW] Flow AI Assistant page
│   │   ├── Dashboard.jsx                  # [UPDATED] Live data from API
│   │   ├── Tasks.jsx                      # [UPDATED] Task management improvements
│   │   └── ...
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx                # [UPDATED] Added AI Assist nav link
│   │   └── ui/
│   │       ├── LiquidEther.jsx            # [NEW] Animated liquid background
│   │       ├── LiquidEther.css            # [NEW] LiquidEther styles
│   │       └── RippleGrid.jsx             # [NEW] Ripple grid animation component
│   ├── assets/
│   │   └── flow-ai-avatar.png             # [NEW] Flow AI avatar asset
│   └── styles/
│       ├── aiassist.css                   # [NEW] AI Assist page styles
│       └── RippleGrid.css                 # [NEW] RippleGrid animation styles
└── package.json                           # [UPDATED] Added new dependencies
```

---

## 🚀 What's New

### Backend Changes

#### ✅ AI Assistance Module (`/api/ai`)
A full AI assistant feature was implemented using external LLM providers (NVIDIA NIM compatible endpoints).

**New files:**
- `backend/src/controllers/aiassistence.controller.js` — Handles 4 endpoints:
  - `GET /api/ai/assistence` — Analyzes user's tasks and returns AI-powered insights (recommended task, priority queue, risk analysis, insights)
  - `POST /api/ai/addmodel` — Saves user's AI provider config (API key encrypted with AES-256-CBC, base URL, model, temperature, max tokens)
  - `GET /api/ai/fetchmodels` — Returns connected AI provider info for the logged-in user
  - `POST /api/ai/aiChat` — Accepts a user message and responds using the configured LLM, with full task context injected
- `backend/src/routes/aiassistence.routes.js` — Route registration for all `/api/ai/*` endpoints (all auth-protected)
- `backend/src/services/aiassistence.services.js` — Core LLM communication logic:
  - `analyzeTasks()` — Sends task list to LLM, structured JSON response with task insights
  - `aiChatWith()` — Sends user message + task context to LLM for conversational AI response
  - Full error handling for HTTP error codes (401, 403, 404, 408, 429, 500, 503)
- `backend/src/models/AISettings.js` — Mongoose schema for storing per-user AI provider configuration:
  - Fields: `user`, `provider`, `apiKey` (encrypted), `baseUrl`, `model`, `temperature`, `maxTokens`, `isActive`, `status`
  - Uses `upsert` to allow only one active config per user at a time
- `backend/src/prompts/aiChat.prompts.js` — `buildChatPrompt()` function that constructs a scoped, rule-enforced system prompt for the chat assistant (workspace-only responses, task-aware, personalized by username)
- `backend/src/prompts/taskAnalysis.prompts.js` — `buildTaskAnalysisPrompt()` function that instructs the LLM to return structured JSON with `recommendedTask`, `priorityQueue`, `riskAnalysis`, and `insights`
- `backend/src/utils/encryption.js` — AES-256-CBC encrypt/decrypt utility using `ENCRYPTION_KEY` from `.env` via SHA-256 key derivation

#### ✅ Map / ETA Module (`/api/eta`)
**New files:**
- `backend/src/controllers/map.controller.js` — `getETA()` controller that proxies a call to OpenRouteService Directions API using provided lat/lng coordinates, returns distance (km) and duration (mins)
- `backend/src/routes/map.route.js` — Registers `POST /api/eta`

#### ✅ Dashboard Services
**New file:**
- `backend/src/services/dashboard.services.js` — Extracted dashboard query logic into reusable service functions:
  - `findFinished(userId)` — Counts Completed / In Progress / Todo tasks for the user
  - `findNextCloseTask(userId)` — Finds the nearest upcoming non-completed task by due date
  - `findCompledThisWeek(userId)` — Counts tasks completed within the current calendar week

#### ✅ Updated Backend Files
- `backend/src/app.js` — Registered `etaRoutes` (`/api`) and `aiRoutes` (`/api/ai`) in Express
- `backend/src/server.js` — Fixed Socket.IO CORS to allow both `http://localhost:5173` and `http://localhost:5174`
- `backend/src/controllers/dashboard.controller.js` — Refactored to use the new `dashboard.services.js` helpers (`findFinished`, `findNextCloseTask`, `findCompledThisWeek`) via `Promise.all`
- `backend/src/controllers/task.controller.js` — Task CRUD improvements
- `backend/src/routes/dashboard.routs.js` — Route updates

---

### Frontend Changes

#### ✅ Flow AI Assistant Page (`/ai-assist`)
**New file:** `src/pages/AIAssist.jsx`

A complete AI chat and analysis interface:
- **AI Configuration Drawer** — Slide-in panel to configure AI provider (API Key, Base URL, Model, Temperature, Max Tokens). Validates response from `addModel` API before closing. Resets all fields on open/close.
- **Task Analysis Panel** — Calls `getAiAssistence()` to display AI-generated:
  - Recommended task with estimated time and reason
  - Priority queue (top 3 tasks)
  - Risk analysis with risk level and suggestion
  - Productivity insights
- **Live Chat Interface** — Real-time conversation with Flow AI:
  - Sends user messages to `messageAI()` API
  - Displays AI responses with streaming-style rendering
  - No demo/mock data — fully integrated with backend
- **LiquidEther Background** — Animated fluid background using OGL/WebGL
- **RippleGrid** — Animated ripple grid used as visual background element

**New files:**
- `src/components/ui/LiquidEther.jsx` — WebGL-based animated liquid ether background component
- `src/components/ui/LiquidEther.css` — Styles for LiquidEther
- `src/components/ui/RippleGrid.jsx` — Canvas/CSS ripple grid animation component
- `src/styles/aiassist.css` — Full styling for the AI Assist page
- `src/styles/RippleGrid.css` — Styles for the RippleGrid component
- `src/assets/flow-ai-avatar.png` — Avatar image for the Flow AI assistant

#### ✅ AI Assistance API Client
**New file:** `src/api/aiassistenceApi.js`
- `addModel(data)` — `POST /api/ai/addmodel`
- `fetchAIModels()` — `GET /api/ai/fetchmodels`
- `getAiAssistence()` — `GET /api/ai/assistence`
- `messageAI(message)` — `POST /api/ai/aiChat`

#### ✅ Dashboard API Client
**New file:** `src/api/dashboard.js`
- `getDashboardData()` — `GET /api/dashboard`

#### ✅ Updated Frontend Files
- `src/App.jsx` — Added `AIAssist` page import and `/ai-assist` route
- `src/components/layout/Sidebar.jsx` — Added **Flow AI** navigation link pointing to `/ai-assist`
- `src/pages/Dashboard.jsx` — Integrated live data from `getDashboardData()` API replacing static/mock data
- `src/pages/Tasks.jsx` — Task management improvements and UI updates
- `package.json` — Added new dependencies: `gsap`, `motion`, `ogl`, `three`

---

## 🔐 Environment Variables

Create a `.env` file in `backend/` with the following:

```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_encryption_key
ORS_API_KEY=your_openrouteservice_api_key
```

> **Note:** `ENCRYPTION_KEY` is used to derive an AES-256 key via SHA-256. The user's AI provider API keys are encrypted before storage in MongoDB.

---

## ▶️ Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
```
> Starts on `http://localhost:8080`

### Frontend
```bash
npm install
npm run dev
```
> Starts on `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/dashboard` | Yes | Fetch dashboard statistics |
| GET | `/api/task` | Yes | Get all tasks |
| POST | `/api/task` | Yes | Create a task |
| PUT | `/api/task/:id` | Yes | Update a task |
| DELETE | `/api/task/:id` | Yes | Delete a task |
| GET | `/api/chat/:userId` | Yes | Get chat messages |
| GET | `/api/ai/assistence` | Yes | AI task analysis |
| POST | `/api/ai/addmodel` | Yes | Save AI provider config |
| GET | `/api/ai/fetchmodels` | Yes | Get AI model info |
| POST | `/api/ai/aiChat` | Yes | Chat with Flow AI |
| POST | `/api/eta` | No | Calculate ETA between two coordinates |

---

## 🔄 Real-Time (Socket.IO Events)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Register user's socket session |
| `sendMessage` | Client → Server | Send a chat message |
| `receiveMessage` | Server → Client | Deliver message to recipient |
| `disconnect` | Client → Server | Clean up online user map |

---

## 🗂 Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Login` | User login |
| `/register` | `Register` | New user registration |
| `/dashboard` | `Dashboard` | Live stats & overview |
| `/tasks` | `Tasks` | Task management |
| `/chat` | `ChatScreen` | Real-time team chat |
| `/ai-assist` | `AIAssist` | Flow AI assistant |
| `/team` | `Team` | Team members view |
| `/settings` | `Settings` | User settings |
| `/calendar` | `Calendar` | Task calendar view |
