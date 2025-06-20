const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');

async function listUsers(bot, chatId, userId) {
  if (!(await isAdmin(userId))) return bot.sendMessage(chatId, "Hanya admin.");

  db.all("SELECT * FROM users", [], (err, rows) => {
    if (!rows.length) return bot.sendMessage(chatId, "Belum ada pengguna.");
    let txt = "Daftar Pengguna:\n";
    rows.forEach(u => {
      txt += `\nID: ${u.id}, Role: ${u.role}`;
    });
    bot.sendMessage(chatId, txt);
  });
}