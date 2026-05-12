import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";
import QRCode from "qrcode";
import fs from "fs";

const apiId = 37036231;
const apiHash = "bad9b8fce29127e133f533dc5b50e66b";



let sessionData = "";

if (fs.existsSync("./session.txt")) {
  sessionData = fs.readFileSync("./session.txt", "utf8");
}

const client = new TelegramClient(
  new StringSession(sessionData),
  apiId,
  apiHash,
  {
    connectionRetries: 5,
  }
);



await client.connect();

console.log("✅ Conectado a Telegram");


if (sessionData && sessionData.length > 5) {
  console.log("💾 Sesión encontrada");
  console.log("🤖 Userbot activo");

  startBot();

} else {

  console.log("📲 Generando QR Login...");

 

  const result = await client.invoke(
    new Api.auth.ExportLoginToken({
      apiId,
      apiHash,
      exceptIds: [],
    })
  );



  const token = result.token.toString("base64url");

  const qr = `tg://login?token=${token}`;

  

  const qrTerminal = await QRCode.toString(qr, {
    type: "terminal",
    small: true,
  });

  console.log(qrTerminal);



  await QRCode.toFile("./telegram-qr.png", qr);

  console.log("📁 QR guardado: telegram-qr.png");
  console.log("📱 Escanea desde Telegram");
  console.log("Telegram > Settings > Devices > Link Desktop Device");



  let autorizado = false;

  while (!autorizado) {

    await new Promise((r) => setTimeout(r, 5000));

    try {

      const loginResult = await client.invoke(
        new Api.auth.ExportLoginToken({
          apiId,
          apiHash,
          exceptIds: [],
        })
      );


      if (loginResult instanceof Api.auth.LoginTokenSuccess) {

        autorizado = true;

        console.log("✅ QR Escaneado");

        const session = client.session.save();

        fs.writeFileSync("./session.txt", session);

        console.log("💾 Sesión guardada");

        startBot();

      }

    } catch (e) {
      console.log("⚠️ Esperando escaneo...");
    }
  }
}



function startBot() {

  console.log("🤖 HATSUNE MIKU USERBOT ONLINE");

  client.addEventHandler(async (event) => {

    const msg = event.message;

    if (!msg || !msg.message) return;

    const text = msg.message;

    console.log("📩", text);

   

    if (text === ".ping") {

      await client.sendMessage(msg.chatId, {
        message: "🏓 Pong",
      });

    }

  

    if (text === ".menu") {

      await client.sendMessage(msg.chatId, {
        message: `
💙 HATSUNE MIKU USERBOT 💙

⚡ .ping
📋 .menu
`,
      });

    }

  });

}



process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);