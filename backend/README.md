# Carpooling Platform - Backend API

## Overview
Express.js + MongoDB backend for carpooling platform with Blockchain integration.

## Setup

### Prerequisites
- Node.js v18+
- MongoDB running
- Hardhat local network running

### Installation
\`\`\`bash
npm install
\`\`\`

### Environment
\`\`\`bash
cp .env.example .env
# Edit .env with your values
\`\`\`

### Running
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

### Health Check
- `GET /` - Server status
- `GET /api/health` - Full health check

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

## Project Structure
- `config/` - Configuration files
- `models/` - Mongoose schemas
- `controllers/` - Request handlers
- `routes/` - API routes
- `middleware/` - Express middleware
- `services/` - Business logic
- `utils/` - Utilities & helpers

## Logging
All requests are logged with method and path.

## Error Handling
Global error handler catches all errors and returns formatted JSON responses.
