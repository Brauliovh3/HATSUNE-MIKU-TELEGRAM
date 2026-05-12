import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import readline from "readline";
import fs from "fs";

const apiId = 37036231;
const apiHash = "bad9b8fce29127e133f533dc5b50e66b";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(text) {
  return new Promise((resolve) => {
    rl.question(text, resolve);
  });
}

let sessionString = "";

if (fs.existsSync("./session.txt")) {
  sessionString = fs.readFileSync("./session.txt", "utf8");
}

const client = new TelegramClient(
  new StringSession(sessionString),
  apiId,
  apiHash,
  {
    connectionRetries: 5,
  }
);

await client.start({
  phoneNumber: async () =>
    await question("📱 Número Telegram: "),

  password: async () =>
    await question("🔐 2FA Password: "),

  phoneCode: async () =>
    await question("💬 Código Telegram: "),

  onError: (err) => console.log(err),
});

console.log("✅ Userbot conectado");

const session = client.session.save();

fs.writeFileSync("./session.txt", session);

console.log("💾 Session guardada");

rl.close();

process.exit(0);