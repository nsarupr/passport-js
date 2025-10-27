const API_URL = 'http://localhost:3001';

export const api = {
  async signup(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/api/user`, {
      credentials: 'include'
    });
    if (!response.ok) return null;
    return response.json();
  },

  getGoogleLoginUrl() {
    return `${API_URL}/auth/google`;
  },

  getOIDCLoginUrl() {
    return `${API_URL}/auth/oidc`;
  },

  getSAMLLoginUrl() {
    return `${API_URL}/auth/saml`;
  }
};
