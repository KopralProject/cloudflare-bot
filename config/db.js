const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./bot.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      role TEXT DEFAULT 'member',
      cf_email TEXT,
      cf_token TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      domain_name TEXT,
      zone_id TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dns_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain_id INTEGER,
      record_id TEXT,
      name TEXT,
      type TEXT,
      content TEXT,
      FOREIGN KEY(domain_id) REFERENCES domains(id)
    )
  `);
});

module.exports = db;