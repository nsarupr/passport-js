# Configuration Guide

This application uses **database-driven configuration** for all authentication providers (Google OAuth, OIDC, SAML). This means you don't need to restart the server when updating configurations - changes take effect immediately!

## How It Works

1. Authentication configurations are stored in the `clients` table in the SQLite database
2. When the server starts, it reads all configurations and initializes the corresponding Passport strategies
3. When you update a configuration via the API, the strategy is automatically reinitialized
4. Authentication routes check if strategies are initialized before allowing access

## Managing Configurations

### View All Configurations

```bash
curl http://localhost:3001/api/clients
```

Response:
```json
{
  "clients": [
    {
      "id": 1,
      "name": "Google OAuth",
      "auth_type": "google",
      "config": {
        "clientId": "your-client-id",
        "clientSecret": "your-secret",
        "callbackUrl": "http://localhost:3001/auth/google/callback"
      },
      "initialized": true
    }
  ]
}
```

### View Initialized Strategies

```bash
curl http://localhost:3001/api/strategies/initialized
```

Response:
```json
{
  "strategies": ["google", "oidc"]
}
```

### Configure Google OAuth

**Step 1:** Get your credentials from [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `http://localhost:3001/auth/google/callback`

**Step 2:** Update configuration via API:

```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google OAuth",
    "auth_type": "google",
    "config": {
      "clientId": "123456789-abc123.apps.googleusercontent.com",
      "clientSecret": "GOCSPX-your_client_secret",
      "callbackUrl": "http://localhost:3001/auth/google/callback"
    }
  }'
```

### Configure OIDC

OIDC works with any OpenID Connect provider (Okta, Auth0, Keycloak, etc.)

```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My OIDC Provider",
    "auth_type": "oidc",
    "config": {
      "issuer": "https://your-domain.okta.com",
      "clientId": "your_client_id",
      "clientSecret": "your_client_secret",
      "callbackUrl": "http://localhost:3001/auth/oidc/callback",
      "scope": "openid email profile"
    }
  }'
```

### Configure SAML

SAML configuration requires your Identity Provider's metadata:

```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SAML SSO",
    "auth_type": "saml",
    "config": {
      "entryPoint": "https://your-idp.com/sso",
      "issuer": "your-app-identifier",
      "callbackUrl": "http://localhost:3001/auth/saml/callback",
      "cert": "-----BEGIN CERTIFICATE-----\nYourCertificateHere\n-----END CERTIFICATE-----"
    }
  }'
```

## Configuration Schema

### Google OAuth Config
```typescript
{
  clientId: string;      // Your Google OAuth client ID
  clientSecret: string;  // Your Google OAuth client secret
  callbackUrl: string;   // Redirect URI after authentication
}
```

### OIDC Config
```typescript
{
  issuer: string;        // OIDC provider's issuer URL
  clientId: string;      // Your application's client ID
  clientSecret: string;  // Your application's client secret
  callbackUrl: string;   // Redirect URI after authentication
  scope?: string;        // Optional: space-separated scopes (default: "openid email profile")
}
```

### SAML Config
```typescript
{
  entryPoint: string;    // IdP's SSO URL
  issuer: string;        // Your application identifier (Entity ID)
  callbackUrl: string;   // Assertion Consumer Service URL
  cert: string;          // IdP's public certificate (PEM format)
}
```

## Testing Without Real Providers

The application includes seed data with placeholder configurations. To test:

1. **Local Authentication** (works immediately):
   - Sign up with email/password
   - Login with those credentials

2. **OAuth/OIDC/SAML** (requires real provider):
   - Will show "not configured" error until you set up real credentials
   - Use the API endpoints above to configure with actual provider details

## Troubleshooting

### Strategy Not Initialized

If you see "authentication is not configured" error:
1. Check if the client exists: `GET /api/clients`
2. Verify the configuration has valid credentials
3. Check initialized strategies: `GET /api/strategies/initialized`

### Update Not Taking Effect

Strategies are reinitialized automatically when you POST to `/api/clients`. If issues persist:
1. Restart the server
2. Check server logs for initialization errors

### Google OAuth Not Working

Common issues:
- Redirect URI mismatch (must exactly match what's in Google Console)
- Missing scopes in Google Console
- API not enabled in Google Cloud project

### OIDC Discovery Failed

- Verify the issuer URL is correct and accessible
- Check that `/.well-known/openid-configuration` endpoint exists
- Ensure network connectivity to the OIDC provider

## Database Direct Access

If you need to directly query or modify the database:

```bash
cd backend
sqlite3 auth.db

# View all clients
SELECT * FROM clients;

# Update a config
UPDATE clients SET config = '{"clientId":"new-id",...}' WHERE auth_type = 'google';
```

**Note:** After direct database changes, restart the server to reinitialize strategies.
