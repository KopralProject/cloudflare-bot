const { getZoneId, listDNSRecords, createWildcardRecord, deleteDNSRecord } = require('../utils/cloudflare');
const { getUser } = require('../handlers/auth');
const db = require('../config/db');

async function setupWildcard(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  const user = await getUser(userId);
  if (!user?.cf_token) return bot.sendMessage(chatId, "Anda belum login Cloudflare.");

  bot.sendMessage(chatId, "Masukkan domain Anda:");
  bot.once('message', async (msg2) => {
    const domain = msg2.text.trim();
    const zoneId = await getZoneId(user.cf_token, domain);
    if (!zoneId) return bot.sendMessage(chatId, "Domain tidak ditemukan di Cloudflare.");

    bot.sendMessage(chatId, "Masukkan IP tujuan:");
    bot.once('message', async (msg3) => {
      const ip = msg3.text.trim();
      try {
        await createWildcardRecord(user.cf_token, zoneId, ip);
        bot.sendMessage(chatId, `Wildcard *.${domain} berhasil dipasang ke ${ip}`);
      } catch (e) {
        bot.sendMessage(chatId, "Gagal menambahkan wildcard.");
      }
    });
  });
}

async function listDNS(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  const user = await getUser(userId);
  if (!user?.cf_token) return bot.sendMessage(chatId, "Login Cloudflare dulu.");

  bot.sendMessage(chatId, "Masukkan domain untuk lihat DNS records:");
  bot.once('message', async (msg2) => {
    const domain = msg2.text.trim();
    const zoneId = await getZoneId(user.cf_token, domain);
    if (!zoneId) return bot.sendMessage(chatId, "Domain tidak ditemukan.");

    const records = await listDNSRecords(user.cf_token, zoneId);
    let text = `DNS Records untuk ${domain}:\n\n`;
    records.forEach(r => {
      text += `${r.name} | ${r.type} | ${r.content}\n`;
    });
    bot.sendMessage(chatId, text);
  });
}

module.exports = { setupWildcard, listDNS };