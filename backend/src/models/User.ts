import db from '../config/database';

export interface User {
  id: number;
  email: string;
  password?: string;
  provider: string;
  provider_id?: string;
  created_at: string;
}

export const UserModel = {
  findById(id: number): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  findByEmail(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },

  findByProvider(provider: string, provider_id: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').get(provider, provider_id) as User | undefined;
  },

  create(email: string, password: string | null, provider: string = 'local', provider_id: string | null = null): User {
    const result = db.prepare(
      'INSERT INTO users (email, password, provider, provider_id) VALUES (?, ?, ?, ?)'
    ).run(email, password, provider, provider_id);

    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, data: Partial<User>): void {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE users SET ${fields} WHERE id = ?`).run(...values, id);
  }
};
