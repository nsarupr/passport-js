#!/bin/bash

echo "Setting up Authentication POC..."

# Backend setup
echo "Installing backend dependencies..."
cd backend
npm install

# Frontend setup
echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "1. Configure backend/.env with your OAuth/OIDC/SAML credentials"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend (in another terminal): cd frontend && npm run dev"
echo "4. Open http://localhost:5173 in your browser"
