import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { StrategyManager } from '../config/passport';

const router = express.Router();

// Middleware to check if strategy is initialized
const checkStrategy = (strategyName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!StrategyManager.isStrategyInitialized(strategyName)) {
      return res.status(503).json({
        error: `${strategyName} authentication is not configured`,
        message: 'Please configure this authentication method in the database first'
      });
    }
    next();
  };
};

// Local Signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = UserModel.create(email, hashedPassword, 'local');

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ user: { id: user.id, email: user.email, provider: user.provider } });
    });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Local Login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication failed' });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ user: { id: user.id, email: user.email, provider: user.provider } });
    });
  })(req, res, next);
});

// Google OAuth
router.get('/google', checkStrategy('google'), passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google` }),
  (req: Request, res: Response) => {
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

// OIDC
router.get('/oidc', checkStrategy('oidc'), passport.authenticate('oidc'));

router.get('/oidc/callback',
  passport.authenticate('oidc', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oidc` }),
  (req: Request, res: Response) => {
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

// SAML
router.get('/saml', checkStrategy('saml'), passport.authenticate('saml'));

router.post('/saml/callback',
  passport.authenticate('saml', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=saml` }),
  (req: Request, res: Response) => {
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;
