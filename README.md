# Social Network Backend

A modern social networking API built with Node.js, Express, and MongoDB, featuring real-time notifications and comprehensive test coverage.

## Quick Setup

1. Install dependencies and setup environment:

```
npm install
cp .env.example .env
# Configure MONGODB_URI, JWT_SECRET, and FIREBASE_ADMIN_SDK_PATH in .env
```

2. Start the server:

```
npm run dev     # Development mode
npm start       # Production mode
```

3. Run tests:

```
npm test        # Run all tests
```

## Core Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Password hashing and email verification
- Rate limiting and XSS protection

### 👥 Social Features
- Follow/Unfollow system
- Post creation 
- Feed generation

### 📱 Mobile Support
- Push notifications 


## Project Structure

### Key Directories
```
src/
├── controllers/  # Business logic for all routes
├── models/      # MongoDB schemas and data models
├── routes/      # API endpoint definitions
├── middleware/  # Auth, validation, and error handlers
└── utils/       # Helper functions and utilities
```

### Important Files
- `src/controllers/`: Handles request processing and business logic
- `src/models/`: Defines data structure and database interactions
- `src/middleware/`: Contains authentication and request validation
- `src/routes/`: Maps API endpoints to their respective controllers

## API Overview

### Auth Endpoints
```
POST /api/auth/register   # Create new account
POST /api/auth/login      # User authentication
POST /api/auth/refresh    # Refresh access token
```

### Social Endpoints
```
POST /api/posts           # Create post
GET  /api/posts/feed      # Get personalized feed
POST /api/users/follow    # Follow user
```

## Testing

Run different test suites:
```
npm test              # All tests
npm run test:auth     # Auth tests only
npm run test:api      # API integration tests
```













## Deployment

### Production Setup
1. Set up environment variables
2. Install dependencies
```
npm install --production
```
3. Start the server
```
npm start
```


