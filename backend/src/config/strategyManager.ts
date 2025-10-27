import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as SamlStrategy } from 'passport-saml';
import { Issuer, Strategy as OpenIDStrategy, TokenSet, UserinfoResponse } from 'openid-client';
import { ClientModel } from '../models/Client';
import { UserModel } from '../models/User';

export class StrategyManager {
  private static initializedStrategies: Set<string> = new Set();

  static async initializeAllStrategies() {
    const clients = ClientModel.getAll();

    for (const client of clients) {
      try {
        const config = JSON.parse(client.config);
        await this.initializeStrategy(client.auth_type, config);
      } catch (error) {
        console.error(`Failed to initialize ${client.auth_type} strategy:`, error);
      }
    }
  }

  static async initializeStrategy(authType: string, config: any) {
    const strategyName = authType.toLowerCase();

    // Remove existing strategy if it exists
    if (this.initializedStrategies.has(strategyName)) {
      passport.unuse(strategyName);
      this.initializedStrategies.delete(strategyName);
    }

    switch (authType) {
      case 'google':
        await this.setupGoogleStrategy(config);
        break;
      case 'oidc':
        await this.setupOIDCStrategy(config);
        break;
      case 'saml':
        await this.setupSAMLStrategy(config);
        break;
      default:
        console.warn(`Unknown auth type: ${authType}`);
    }
  }

  private static async setupGoogleStrategy(config: any) {
    if (!config.clientId || !config.clientSecret) {
      console.warn('Google strategy requires clientId and clientSecret');
      return;
    }

    passport.use('google', new GoogleStrategy(
      {
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackUrl || 'http://localhost:3001/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = UserModel.findByProvider('google', profile.id);

          if (!user) {
            const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;
            user = UserModel.create(email, null, 'google', profile.id);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    ));

    this.initializedStrategies.add('google');
    console.log('Google strategy initialized from database');
  }

  private static async setupOIDCStrategy(config: any) {
    if (!config.issuer || !config.clientId || !config.clientSecret) {
      console.warn('OIDC strategy requires issuer, clientId, and clientSecret');
      return;
    }

    try {
      const issuer = await Issuer.discover(config.issuer);

      const client = new issuer.Client({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uris: [config.callbackUrl || 'http://localhost:3001/auth/oidc/callback'],
        response_types: ['code']
      });

      passport.use('oidc', new OpenIDStrategy(
        {
          client,
          params: {
            scope: config.scope || 'openid email profile'
          }
        },
        (tokenSet: TokenSet, userinfo: UserinfoResponse, done: any) => {
          try {
            const providerId = userinfo.sub;
            let user = UserModel.findByProvider('oidc', providerId);

            if (!user) {
              const email = userinfo.email || `${providerId}@oidc.com`;
              user = UserModel.create(email, null, 'oidc', providerId);
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      ));

      this.initializedStrategies.add('oidc');
      console.log('OIDC strategy initialized from database');
    } catch (error) {
      console.error('Failed to setup OIDC strategy:', error);
    }
  }

  private static async setupSAMLStrategy(config: any) {
    if (!config.entryPoint || !config.issuer) {
      console.warn('SAML strategy requires entryPoint and issuer');
      return;
    }

    passport.use('saml', new SamlStrategy(
      {
        entryPoint: config.entryPoint,
        issuer: config.issuer,
        callbackUrl: config.callbackUrl || 'http://localhost:3001/auth/saml/callback',
        cert: config.cert || ''
      },
      async (profile: any, done: any) => {
        try {
          const providerId = profile.nameID || profile.id;
          let user = UserModel.findByProvider('saml', providerId);

          if (!user) {
            const email = profile.email || profile.nameID || `${providerId}@saml.com`;
            user = UserModel.create(email, null, 'saml', providerId);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    ));

    this.initializedStrategies.add('saml');
    console.log('SAML strategy initialized from database');
  }

  static isStrategyInitialized(authType: string): boolean {
    return this.initializedStrategies.has(authType.toLowerCase());
  }

  static getInitializedStrategies(): string[] {
    return Array.from(this.initializedStrategies);
  }
}
