import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { ClientModel } from '../models/Client';
import { StrategyManager } from '../config/passport';

const router = express.Router();

// Get current user
router.get('/user', isAuthenticated, (req: Request, res: Response) => {
  const user = req.user as any;
  res.json({ user: { id: user.id, email: user.email, provider: user.provider } });
});

// Get all clients
router.get('/clients', (req: Request, res: Response) => {
  const clients = ClientModel.getAll();
  res.json({
    clients: clients.map(c => ({
      ...c,
      config: JSON.parse(c.config),
      initialized: StrategyManager.isStrategyInitialized(c.auth_type)
    }))
  });
});

// Get a single client by auth_type
router.get('/clients/:auth_type', (req: Request, res: Response) => {
  const client = ClientModel.findByAuthType(req.params.auth_type);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  res.json({
    client: {
      ...client,
      config: JSON.parse(client.config),
      initialized: StrategyManager.isStrategyInitialized(client.auth_type)
    }
  });
});

// Create or update client
router.post('/clients', async (req: Request, res: Response) => {
  try {
    const { id, name, auth_type, config } = req.body;

    if (!name || !auth_type || !config) {
      return res.status(400).json({ error: 'Name, auth_type, and config required' });
    }

    let client;
    if (id) {
      ClientModel.update(id, name, auth_type, config);
      client = ClientModel.findById(id);
    } else {
      // Check if client with this auth_type already exists
      const existing = ClientModel.findByAuthType(auth_type);
      if (existing) {
        ClientModel.update(existing.id, name, auth_type, config);
        client = ClientModel.findById(existing.id);
      } else {
        client = ClientModel.create(name, auth_type, config);
      }
    }

    // Reinitialize the strategy with new config
    await StrategyManager.initializeStrategy(auth_type, config);

    res.json({
      message: 'Client saved and strategy initialized',
      client: {
        ...client,
        config: JSON.parse(client.config),
        initialized: StrategyManager.isStrategyInitialized(auth_type)
      }
    });
  } catch (error) {
    console.error('Failed to save client:', error);
    res.status(500).json({ error: 'Failed to save client' });
  }
});

// Get initialized strategies
router.get('/strategies/initialized', (req: Request, res: Response) => {
  res.json({
    strategies: StrategyManager.getInitializedStrategies()
  });
});

export default router;
