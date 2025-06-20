const { checkAndUpdateIP } = require('../services/dynamicDns');
const { getUser } = require('../handlers/auth');
const { getZoneId } = require('../utils/cloudflare');
const db = require('../config/db');

// Command: /checkip
async function checkIP(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  const user = await getUser(userId);
  if (!user?.cf_token) return bot.sendMessage(chatId, "Login Cloudflare dulu.");

  bot.sendMessage(chatId, "Masukkan domain Anda:");
  bot.once('message', async (msg2) => {
    const domain = msg2.text.trim();
    const zoneId = await getZoneId(user.cf_token, domain);
    if (!zoneId) return bot.sendMessage(chatId, "Domain tidak ditemukan.");

    bot.sendMessage(chatId, "Masukkan nama subdomain (misal: ddns):");
    bot.once('message', async (msg3) => {
      const subdomain = msg3.text.trim();
      const result = await checkAndUpdateIP(user.cf_token, zoneId, domain, subdomain);

      if (result.changed) {
        bot.sendMessage(chatId, `✅ IP berubah!\nDari: ${result.oldIP}\nKe: ${result.newIP}`);
      } else if (result.ip) {
        bot.sendMessage(chatId, `📡 IP saat ini: ${result.ip} (tidak berubah)`);
      } else {
        bot.sendMessage(chatId, `❌ Gagal: ${result.error}`);
      }
    });
  });
}

// Jalankan pengecekan otomatis setiap X jam
async function startAutoCheck(bot, intervalHours = 1) {
  const users = await new Promise((resolve) => {
    db.all("SELECT * FROM users WHERE cf_token IS NOT NULL", [], (err, rows) => resolve(rows));
  });

  for (const user of users) {
    const domains = await new Promise((resolve) => {
      db.all("SELECT * FROM domains WHERE user_id = ?", [user.id], (err, rows) => resolve(rows));
    });

    for (const domain of domains) {
      const result = await checkAndUpdateIP(user.cf_token, domain.zone_id, domain.domain_name, "ddns");
      if (result.changed) {
        bot.sendMessage(user.id, `🔄 IP telah berubah!\nSubdomain: ddns.${domain.domain_name}\nBaru: ${result.newIP}`);
      }
    }
  }

  setTimeout(() => startAutoCheck(bot), intervalHours * 60 * 60 * 1000);
}

module.exports = { checkIP, startAutoCheck };
