async function isAdmin(userId) {
  const db = require('../config/db');
  return new Promise((resolve) => {
    db.get("SELECT role FROM users WHERE id = ?", [userId], (err, row) => {
      resolve(row?.role === 'admin');
    });
  });
}

module.exports = { isAdmin };