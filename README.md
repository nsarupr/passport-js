# Authentication POC with Passport.js

A simple full-stack authentication application demonstrating multiple login methods using Passport.js with **database-driven configuration**.

## Key Features

- Username/Password Authentication (Local Strategy)
- Google OAuth 2.0
- OpenID Connect (OIDC)
- SAML SSO
- **Database-Driven Configuration** - Update auth providers without restarting
- Dynamic Strategy Initialization
- React Frontend with TypeScript
- Node.js/Express Backend with TypeScript
- SQLite Database

## Documentation

- **[CONFIGURATION.md](CONFIGURATION.md)** - Complete guide for managing authentication providers
- **[CHANGES.md](CHANGES.md)** - Details about the database-driven configuration approach

## Project Structure

```
passport-js/
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/      # Database & Passport configuration
│   │   ├── models/      # User & Client models
│   │   ├── routes/      # Authentication & API routes
│   │   ├── strategies/  # Passport strategies
│   │   └── middleware/  # Auth middleware
│   └── package.json
└── frontend/            # React + TypeScript + Vite
    ├── src/
    │   ├── components/  # Login & Signup forms
    │   ├── pages/       # Login, Signup, Home pages
    │   └── utils/       # API utilities
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3001`

   **Note:** On first run with `SEED_DB=true`, the database will be seeded with example configurations for Google, OIDC, and SAML. You'll need to update these via the API with your actual credentials.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Usage

### Basic Login (No Configuration Needed)

1. Open your browser and go to `http://localhost:5173`
2. Create an account using username/password (local authentication)
3. Login and see "Hello, {user}" on the home page

### Configuring OAuth/OIDC/SAML Providers

All authentication provider configurations are stored in the database and can be managed via API calls:

#### View Current Configurations
```bash
curl http://localhost:3001/api/clients
```

#### Configure Google OAuth
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google OAuth",
    "auth_type": "google",
    "config": {
      "clientId": "your-google-client-id.apps.googleusercontent.com",
      "clientSecret": "your-google-client-secret",
      "callbackUrl": "http://localhost:3001/auth/google/callback"
    }
  }'
```

#### Configure OIDC
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenID Connect",
    "auth_type": "oidc",
    "config": {
      "issuer": "https://your-oidc-provider.com",
      "clientId": "your-oidc-client-id",
      "clientSecret": "your-oidc-client-secret",
      "callbackUrl": "http://localhost:3001/auth/oidc/callback",
      "scope": "openid email profile"
    }
  }'
```

#### Configure SAML
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SAML SSO",
    "auth_type": "saml",
    "config": {
      "entryPoint": "https://your-saml-provider.com/sso",
      "issuer": "passport-saml",
      "callbackUrl": "http://localhost:3001/auth/saml/callback",
      "cert": "your-saml-certificate"
    }
  }'
```

Once configured, the authentication buttons will work for the respective providers.

## API Endpoints

### Authentication Routes

- `POST /auth/signup` - Create a new local account
- `POST /auth/login` - Login with username/password
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/oidc` - Initiate OIDC flow
- `GET /auth/oidc/callback` - OIDC callback
- `GET /auth/saml` - Initiate SAML flow
- `POST /auth/saml/callback` - SAML callback
- `POST /auth/logout` - Logout current user

### API Routes

- `GET /api/user` - Get current authenticated user
- `GET /api/clients` - Get all client configurations
- `GET /api/clients/:auth_type` - Get a specific client configuration by auth type
- `POST /api/clients` - Create or update client configuration (automatically reinitializes the strategy)
- `GET /api/strategies/initialized` - Get list of currently initialized authentication strategies

## Database Schema

### Users Table
- `id` - Primary key
- `email` - User email
- `password` - Hashed password (for local strategy)
- `provider` - Authentication provider (local, google, oidc, saml)
- `provider_id` - External provider user ID
- `created_at` - Timestamp

### Clients Table
- `id` - Primary key
- `name` - Client name
- `auth_type` - Authentication type (google, oidc, saml)
- `config` - JSON configuration for the auth type
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Notes

- This is a POC (Proof of Concept) - not production ready
- Session-based authentication using express-session
- SQLite database (auth.db) will be created automatically
- CORS is configured for local development
- **All OAuth/OIDC/SAML configurations are stored in the database, not in environment variables**
- Passport strategies are dynamically initialized from database configurations
- When you update a client configuration via API, the strategy is automatically reinitialized
- Auth routes check if strategies are initialized before allowing authentication

## Development

Backend:
```bash
cd backend
npm run dev    # Start with hot reload
npm run build  # Build for production
npm start      # Run production build
```

Frontend:
```bash
cd frontend
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```
