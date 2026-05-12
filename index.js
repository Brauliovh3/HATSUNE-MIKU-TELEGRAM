import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";
import QRCode from "qrcode";
import input from "input";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();



const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;



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



await client.connect();

console.log("=================================");
console.log("💙 HATSUNE MIKU USERBOT 💙");
console.log("=================================\n");



if (sessionString.length > 5) {

  console.log("✅ Sesión encontrada");
  console.log("🤖 Userbot conectado");

  startBot();

} else {

  console.log("1 => Login por código");
  console.log("2 => Login por QR\n");

  const option = await input.text("Selecciona opción: ");


  if (option === "1") {

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

    console.log("✅ Login exitoso");
    console.log("💾 Sesión guardada");

    startBot();

  }



  else if (option === "2") {

    console.log("📲 Generando QR Login...\n");

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
    console.log("Settings > Devices > Link Desktop Device\n");

    let autorizado = false;

   

    while (!autorizado) {

      await new Promise((r) => setTimeout(r, 3000));

      try {

        const loginResult = await client.invoke(
          new Api.auth.ImportLoginToken({
            token: result.token,
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

        console.log("⌛ Esperando escaneo...");

      }
    }

  } else {

    console.log("❌ Opción inválida");
    process.exit(0);

  }

}



function startBot() {

  console.log("\n=================================");
  console.log("🤖 USERBOT ONLINE");
  console.log("=================================\n");

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