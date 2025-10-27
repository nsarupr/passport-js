# Changes: Database-Driven Configuration

## Summary

The application has been updated to use **database-driven configuration** instead of environment variables for OAuth/OIDC/SAML providers. This allows dynamic configuration changes without server restarts.

## What Changed

### 1. Configuration Storage
- **Before:** OAuth/OIDC/SAML credentials stored in `.env` file
- **After:** Credentials stored in SQLite database `clients` table

### 2. Strategy Initialization
- **Before:** Strategies initialized on startup from environment variables
- **After:** Strategies dynamically initialized from database, can be reinitialized on-the-fly

### 3. New Files Created

#### Backend
- `src/config/strategyManager.ts` - Manages dynamic Passport strategy initialization
- `src/seed.ts` - Seeds database with example configurations
- `test-api.sh` - Script to test configuration API

#### Documentation
- `CONFIGURATION.md` - Complete guide for managing configurations
- `CHANGES.md` - This file

### 4. Modified Files

#### Backend Configuration
- `src/config/passport.ts` - Now uses StrategyManager instead of static imports
- `src/routes/auth.ts` - Added middleware to check if strategies are initialized
- `src/routes/api.ts` - Enhanced with endpoints to manage client configurations
- `src/server.ts` - Added optional database seeding on startup
- `.env` - Simplified to only include SESSION_SECRET and SEED_DB flag
- `.env.example` - Updated with new structure

#### Documentation
- `README.md` - Updated with database-driven configuration instructions

### 5. Removed Files
- `src/strategies/localStrategy.ts` - Moved into passport.ts
- `src/strategies/googleStrategy.ts` - Logic moved to strategyManager.ts
- `src/strategies/oidcStrategy.ts` - Logic moved to strategyManager.ts
- `src/strategies/samlStrategy.ts` - Logic moved to strategyManager.ts
- `src/config/strategies.ts` - No longer needed

## Key Features

### 1. Dynamic Configuration Updates
```bash
# Update configuration without restarting server
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Google","auth_type":"google","config":{...}}'
```

### 2. Strategy Status Checking
```bash
# Check which strategies are active
curl http://localhost:3001/api/strategies/initialized
```

### 3. Automatic Strategy Initialization
- When you POST a new configuration, the corresponding strategy is automatically initialized
- If strategy already exists, it's removed and reinitialized with new config

### 4. Safe Authentication Routes
- Routes check if strategy is initialized before allowing authentication
- Returns 503 error with helpful message if not configured

## Migration Guide

If you had existing `.env` configurations:

### Old Way (.env file)
```env
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
```

### New Way (Database via API)
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "auth_type": "google",
    "name": "Google OAuth",
    "config": {
      "clientId": "your-id",
      "clientSecret": "your-secret",
      "callbackUrl": "http://localhost:3001/auth/google/callback"
    }
  }'
```

## API Endpoints

### New Endpoints
- `GET /api/clients/:auth_type` - Get specific client configuration
- `GET /api/strategies/initialized` - List initialized strategies

### Enhanced Endpoints
- `GET /api/clients` - Now includes `initialized` status for each client
- `POST /api/clients` - Now automatically reinitializes strategies

## Benefits

1. **No Server Restarts** - Update configurations on-the-fly
2. **Better Security** - Credentials in database, not in version control
3. **Multi-Tenant Ready** - Easy to extend for multiple client configurations
4. **Dynamic Enablement** - Enable/disable auth providers without code changes
5. **Centralized Management** - All configurations in one place (database)
6. **API-Driven** - Can build admin UI to manage configurations

## Technical Details

### StrategyManager Class

The `StrategyManager` class handles:
- Reading configurations from database
- Initializing Passport strategies
- Tracking which strategies are active
- Reinitializing strategies when configurations change

### Strategy Lifecycle

1. Server starts → reads all client configs from database
2. For each config → initializes corresponding Passport strategy
3. When config updated via API → reinitializes that specific strategy
4. Auth routes → check if strategy initialized before allowing access

### Database Schema

The `clients` table stores:
- `auth_type` - Strategy identifier (google, oidc, saml)
- `name` - Display name
- `config` - JSON object with strategy-specific configuration
- Timestamps for tracking

## Testing

1. Start the backend: `cd backend && npm run dev`
2. Run the test script: `./test-api.sh`
3. Or use the examples in `CONFIGURATION.md`

## Backward Compatibility

Local authentication (username/password) works exactly as before - no configuration needed.

## Future Enhancements

Possible extensions:
- Admin UI for configuration management
- Configuration validation
- Multiple OAuth providers of same type (multiple Google apps)
- Configuration encryption at rest
- Audit logging for configuration changes
- Role-based access to configuration API
