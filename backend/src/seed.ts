import { ClientModel } from './models/Client';

// Seed example client configurations
function seedDatabase() {
  console.log('Seeding database with example configurations...');

  // Example Google OAuth configuration
  const googleConfig = {
    clientId: 'your-google-client-id.apps.googleusercontent.com',
    clientSecret: 'your-google-client-secret',
    callbackUrl: 'http://localhost:3001/auth/google/callback'
  };

  // Example OIDC configuration
  const oidcConfig = {
    issuer: 'https://accounts.google.com', // Example: can be any OIDC provider
    clientId: 'your-oidc-client-id',
    clientSecret: 'your-oidc-client-secret',
    callbackUrl: 'http://localhost:3001/auth/oidc/callback',
    scope: 'openid email profile'
  };

  // Example SAML configuration
  const samlConfig = {
    entryPoint: 'https://your-saml-provider.com/sso',
    issuer: 'passport-saml',
    callbackUrl: 'http://localhost:3001/auth/saml/callback',
    cert: 'your-saml-certificate-here'
  };

  // Check if clients already exist, if not create them
  const existingGoogle = ClientModel.findByAuthType('google');
  if (!existingGoogle) {
    ClientModel.create('Google OAuth', 'google', googleConfig);
    console.log('✓ Created Google OAuth configuration');
  } else {
    console.log('- Google OAuth configuration already exists');
  }

  const existingOIDC = ClientModel.findByAuthType('oidc');
  if (!existingOIDC) {
    ClientModel.create('OpenID Connect', 'oidc', oidcConfig);
    console.log('✓ Created OIDC configuration');
  } else {
    console.log('- OIDC configuration already exists');
  }

  const existingSAML = ClientModel.findByAuthType('saml');
  if (!existingSAML) {
    ClientModel.create('SAML SSO', 'saml', samlConfig);
    console.log('✓ Created SAML configuration');
  } else {
    console.log('- SAML configuration already exists');
  }

  console.log('\nDatabase seeded! You can now update these configurations via the API.');
  console.log('Use POST /api/clients to update configurations.\n');
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
