require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const { registerUser, setCloudflareAccount, getUser } = require('./handlers/auth');
const { setupWildcard, listDNS } = require('./handlers/dns');
const { listUsers } = require('./handlers/admin');
const { isAdmin } = require('./middleware/auth');

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const username = msg.from.username;

  await registerUser(userId, username);
  bot.sendMessage(chatId, "Selamat datang! Gunakan /setcf <email> <token>");
});

bot.onText(/\/setcf (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const parts = match[1].split(' ');
  if (parts.length !== 2) return bot.sendMessage(chatId, "Format salah.");

  const [email, token] = parts;
  await setCloudflareAccount(msg.from.id.toString(), email, token);
  bot.sendMessage(chatId, "Akun Cloudflare tersimpan.");
});

bot.onText(/\/wildcard/, (msg) => setupWildcard(bot, msg));
bot.onText(/\/dns/, (msg) => listDNS(bot, msg));

bot.onText(/\/users/, async (msg) => {
  const chatId = msg.chat.id;
  await listUsers(bot, chatId, msg.from.id.toString());
});