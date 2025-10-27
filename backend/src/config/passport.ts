import passport from 'passport';
import { UserModel, User } from '../models/User';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { StrategyManager } from './strategyManager';

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id: number, done) => {
  try {
    const user = UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Local strategy (always available, doesn't need DB config)
passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = UserModel.findByEmail(email);

      if (!user || !user.password) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Initialize dynamic strategies from database
StrategyManager.initializeAllStrategies().catch(console.error);

export default passport;
export { StrategyManager };
