import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import fs from "fs";

const apiId = 37036231;
const apiHash = "bad9b8fce29127e133f533dc5b50e66b";



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
    await input.text("📱 Número Telegram: "),

  password: async () =>
    await input.text("🔐 Contraseña 2FA: "),

  phoneCode: async () =>
    await input.text("💬 Código Telegram: "),

  onError: (err) => console.log(err),
});



const session = client.session.save();

fs.writeFileSync("./session.txt", session);

console.log("✅ Userbot conectado");
console.log("💾 Sesión guardada");



client.addEventHandler(async (event) => {
  const message = event.message;

  if (!message || !message.message) return;

  const text = message.message;

  console.log("📩", text);



  if (text === ".ping") {
    await client.sendMessage(message.chatId, {
      message: "🏓 Pong",
    });
  }



  if (text === ".menu") {
    await client.sendMessage(message.chatId, {
      message: `
💙 HATSUNE MIKU USERBOT 💙

⚡ .ping
📋 .menu
`,
    });
  }
});

console.log("🤖 Sistema iniciado");