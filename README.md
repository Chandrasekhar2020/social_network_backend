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


### 👥 Social Features
- Follow/Unfollow system
- Post creation 
- Feed generation
- Profile management

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


### GraphQL API Overview

#### Auth Operations
```graphql
register        # Create new user account
login           # Authenticate user

```

#### Social Operations
```graphql
# Queries
feed            # Get personalized post feed
userProfile     # Get user profile details
notifications   # Get user notifications

# Mutations
createPost      # Create new post
followUser      # Follow/unfollow user
```

#### Example GraphQL Usage

1. Query Example - Fetching User Feed:
```graphql
query {
  FollowedUsersPosts {
    posts {
      id
      content
      author {
        username
        avatar
      }
      likes
      comments {
        text
      }
    }
  }
}
```

2. Mutation Example - Creating a Post:
```graphql
mutation {
  createPost(input: {
    content: "Hello GraphQL!"
 
  }) {
    id
    content
    imageUrl
    createdAt
  }
}
```



## Testing

Run different test suites:
```
npm test              # All tests
npm run test:auth     # Auth tests only
npm run test:api      # API integration tests
```

















