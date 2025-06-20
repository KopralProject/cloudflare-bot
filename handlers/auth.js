const db = require('../config/db');

async function registerUser(userId, username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
      if (!row) {
        db.run("INSERT INTO users (id, username) VALUES (?, ?)", [userId, username], (err) => resolve(!err));
      } else {
        resolve(false);
      }
    });
  });
}

async function setCloudflareAccount(userId, email, token) {
  return new Promise((resolve, reject) => {
    db.run("UPDATE users SET cf_email = ?, cf_token = ? WHERE id = ?", [email, token, userId], (err) => resolve(!err));
  });
}

async function getUser(userId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => resolve(row));
  });
}

module.exports = { registerUser, setCloudflareAccount, getUser };