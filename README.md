# Secure Authentication System Backend

A secure authentication backend system built with Node.js, Express, and MongoDB that supports both manual authentication and OAuth 2.0 with GitHub.

## Features

- **Multiple Authentication Methods**
  - Manual authentication (username/email & password)
  - OAuth 2.0 authentication with GitHub
  
- **Secure User Management**
  - Password strength validation
  - Secure password storage with bcrypt
  - Session management with JWT
  
- **Security Features**
  - Login activity logging
  - Prevention of session backtracking
  - Protection against brute force attacks
  - CSRF protection
  - Secure HTTP headers
  
- **MVC Architecture**
  - Well-organized codebase with Models, Views, and Controllers
  - Clean separation of concerns

## Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- GitHub OAuth App (for GitHub authentication)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/auth-system-backend.git
   cd auth-system-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/auth-system
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| POST | `/api/auth/register` | Register a new user | `{ username, email, password }` | `{ success, message }` |
| POST | `/api/auth/login` | Login with credentials | `{ email, password }` | `{ success, message, token, user }` |
| GET | `/api/auth/github` | Initiate GitHub OAuth | - | Redirects to GitHub |
| GET | `/api/auth/github/callback` | GitHub OAuth callback | - | Redirects to frontend with token |
| GET | `/api/auth/verify` | Verify JWT token | - | `{ success, message, user }` |
| POST | `/api/auth/logout` | Logout user | - | `{ success, message }` |

### User Management

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/users/profile` | Get user profile | Yes | `{ success, user }` |
| GET | `/api/users/login-history` | Get login history | Yes | `{ success, loginLogs }` |

## Authentication Flow

### Manual Authentication

1. User registers via `/api/auth/register` with username, email, and password
2. System validates password requirements and checks for existing users
3. User logs in via `/api/auth/login` with email and password
4. System returns JWT token upon successful authentication
5. Client includes token in Authorization header for authenticated requests

### GitHub OAuth Authentication

1. User initiates OAuth flow by visiting `/api/auth/github`
2. User is redirected to GitHub for authorization
3. GitHub redirects back to `/api/auth/github/callback`
4. System creates or updates user record based on GitHub profile
5. User is redirected back to frontend with JWT token

## Password Policy

Passwords must meet the following requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!, @, #, $, %, etc.)

## Testing

Run the test suite with:
```bash
npm test
```

### Manual Testing

You can test the API using tools like Postman, Insomnia, or cURL:

#### Example cURL commands:

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Secure@2025"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secure@2025"}'
```

**Get Profile (replace TOKEN with your actual token):**
```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

## Security Considerations

- The system uses bcrypt for password hashing
- JWT tokens are signed with a secure secret
- Rate limiting is implemented to prevent brute force attacks
- Input validation is performed on all endpoints
- CORS is configured to allow requests only from the frontend domain
- HTTP security headers are set using Helmet

## Connecting to Frontend

To connect this backend to a frontend application:

1. Ensure your frontend application is configured to send requests to the backend API endpoints
2. Store the JWT token securely (e.g., in localStorage or HttpOnly cookies)
3. Include the token in the Authorization header for authenticated requests
4. Handle the OAuth callback by extracting the token from the URL
