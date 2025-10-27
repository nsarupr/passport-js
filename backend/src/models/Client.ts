import db from '../config/database';

export interface Client {
  id: number;
  name: string;
  auth_type: string;
  config: string;
  created_at: string;
  updated_at: string;
}

export const ClientModel = {
  findById(id: number): Client | undefined {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client | undefined;
  },

  findByAuthType(auth_type: string): Client | undefined {
    return db.prepare('SELECT * FROM clients WHERE auth_type = ?').get(auth_type) as Client | undefined;
  },

  getAll(): Client[] {
    return db.prepare('SELECT * FROM clients').all() as Client[];
  },

  create(name: string, auth_type: string, config: object): Client {
    const result = db.prepare(
      'INSERT INTO clients (name, auth_type, config) VALUES (?, ?, ?)'
    ).run(name, auth_type, JSON.stringify(config));

    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, name: string, auth_type: string, config: object): void {
    db.prepare(
      'UPDATE clients SET name = ?, auth_type = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name, auth_type, JSON.stringify(config), id);
  }
};
