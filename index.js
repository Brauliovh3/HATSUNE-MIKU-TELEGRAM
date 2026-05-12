import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import { Api } from "telegram";
import QRCode from "qrcode";
import input from "input";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;


let sessionString = "";
let sessionData = null;

if (fs.existsSync("./session.txt")) {
  sessionString = fs.readFileSync("./session.txt", "utf8").trim();

  if (fs.existsSync("./session.json")) {
    try {
      sessionData = JSON.parse(fs.readFileSync("./session.json", "utf8"));
      console.log("📁 Sesión encontrada:");
      console.log(`👤 Usuario: ${sessionData.firstName || "N/A"} ${sessionData.lastName || ""}`);
      console.log(`🆔 ID: ${sessionData.userId || "N/A"}`);
      console.log(`📅 Creada: ${new Date(sessionData.created).toLocaleString()}`);
    } catch (e) {
      console.log("⚠️ Error leyendo session.json, usando solo session.txt");
    }
  }
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
  console.log("🤖 Userbot conectado\n");
  startBot();
} else {
  console.log("1 => Login por código (recomendado en servidor)");
  console.log("2 => Login por QR\n");

  const option = await input.text("Selecciona opción: ");

  if (option === "1") {
    await phoneLoginFlow();
  } else if (option === "2") {
    await qrLoginFlow();
  } else {
    console.log("❌ Opción inválida");
    process.exit(0);
  }
}


async function phoneLoginFlow() {
  console.log("\n📱 Iniciando login por código...\n");

  try {
    await client.start({
      phoneNumber: async () => await input.text("📱 Número Telegram (+51...): "),
      password: async () => await input.text("🔐 Contraseña 2FA (Enter si no tienes): "),
      phoneCode: async () => await input.text("💬 Código recibido en Telegram: "),
      onError: (err) => console.log("❌ Error:", err),
    });

    const session = client.session.save();
    fs.writeFileSync("./session.txt", session);

    const me = await client.getMe();
    const data = {
      session,
      userId: me.id?.toString(),
      firstName: me.firstName,
      lastName: me.lastName,
      username: me.username,
      phone: me.phone,
      created: new Date().toISOString(),
    };

    fs.writeFileSync("./session.json", JSON.stringify(data, null, 2));

    console.log("\n✅ Login exitoso");
    console.log(`👤 Bienvenido, ${me.firstName}!`);
    console.log("💾 Sesión guardada\n");

    startBot();
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    process.exit(1);
  }
}


async function qrLoginFlow() {
  console.log("\n📷 Iniciando QR Login...\n");
  console.log("⚠️  NOTA: En servidores remotos el QR puede fallar.");
  console.log("    Si falla, reinicia y usa la opción 1.\n");

  try {
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
    console.log("📲 Pasos:");
    console.log("   1. Abre Telegram en tu teléfono");
    console.log("   2. Settings > Devices > Link Desktop Device");
    console.log("   3. Escanea el QR AHORA (expira en segundos)\n");

    let escaneado = false;
    let intentos = 0;
    const maxIntentos = 40;

    while (!escaneado && intentos < maxIntentos) {
      await new Promise((r) => setTimeout(r, 500));
      intentos++;

      try {
        const loginResult = await client.invoke(
          new Api.auth.ImportLoginToken({ token: result.token })
        );

        if (loginResult instanceof Api.auth.LoginTokenSuccess) {
          escaneado = true;
          const user = loginResult.authorization.user;
          console.log(`\n✅ QR escaneado exitosamente!`);
          console.log(`👤 Usuario: ${user.firstName}`);

          const session = client.session.save();
          fs.writeFileSync("./session.txt", session);

          const data = {
            session,
            userId: user.id?.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phone: user.phone,
            created: new Date().toISOString(),
          };

          if (!fs.existsSync("./sessions")) fs.mkdirSync("./sessions");
          const sessionName = `session_${Date.now()}`;
          fs.writeFileSync(`./sessions/${sessionName}.txt`, session);
          fs.writeFileSync(`./sessions/${sessionName}.json`, JSON.stringify(data, null, 2));
          fs.writeFileSync("./session.json", JSON.stringify(data, null, 2));

          console.log("💾 Sesión guardada\n");
          startBot();
          return;
        } else {
          process.stdout.write(`⏳ Esperando escaneo... (${intentos}/${maxIntentos})\r`);
        }
      } catch (e) {
        if (e.message?.includes("TOKEN_EXPIRED") || e.message?.includes("EXPIRED")) {
          console.log("\n⏰ Token expirado.");
          break;
        } else if (e.message?.includes("SESSION_PASSWORD_NEEDED")) {
          console.log("\n🔐 Se requiere contraseña 2FA");
         
          break;
        }
      }
    }

    if (!escaneado) {
      console.log("\n❌ No se pudo escanear el QR a tiempo.");
      const retry = await input.text("¿Usar login por código en su lugar? (s/n): ");
      if (retry.toLowerCase() === "s") {
        await phoneLoginFlow();
      } else {
        process.exit(0);
      }
    }
  } catch (error) {
    console.error("❌ Error en QR:", error.message);
    console.log("💡 Intenta con la opción 1 (código).");
    process.exit(1);
  }
}


function startBot() {
  console.log("=================================");
  console.log("🟢 USERBOT ONLINE");
  console.log("=================================\n");

 
  client.addEventHandler(async (event) => {
    const msg = event.message;

    if (!msg || !msg.message) return;

    const text = msg.message.trim();

    console.log(`📩 [${new Date().toLocaleTimeString()}] Mensaje: ${text}`);

    try {
      if (text === ".ping") {
        console.log("🏓 Respondiendo .ping");
        await msg.reply({ message: "🏓 Pong!" });
      }

      else if (text === ".menu") {
        console.log("📋 Respondiendo .menu");
        await msg.reply({
          message: `💙 **HATSUNE MIKU USERBOT** 💙\n\n⚡ \`.ping\` — Verificar conexión\n📋 \`.menu\` — Ver comandos\n👤 \`.me\` — Ver tu info\n🗑️ \`.del\` — Borrar mensaje (responde a uno)`,
          parseMode: "markdown",
        });
      }

      else if (text === ".me") {
        const me = await client.getMe();
        await msg.reply({
          message: `👤 **Tu información:**\n\n🆔 ID: \`${me.id}\`\n👤 Nombre: ${me.firstName} ${me.lastName || ""}\n🔖 Username: @${me.username || "sin username"}\n📱 Teléfono: +${me.phone}`,
          parseMode: "markdown",
        });
      }

      else if (text === ".del") {
        if (msg.replyTo) {
          const replied = await msg.getReplyMessage();
          if (replied) await replied.delete({ revoke: true });
          await msg.delete({ revoke: true });
        } else {
          await msg.delete({ revoke: true });
        }
      }

    } catch (error) {
      console.error("❌ Error al procesar mensaje:", error.message);
    }

 
  }, new NewMessage({ outgoing: true }));

  console.log("🎧 Escuchando comandos...");
  console.log("💡 Comandos: .ping | .menu | .me | .del\n");
}


process.on("uncaughtException", (err) => {
  console.error("💥 Error no capturado:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Promesa rechazada:", err?.message || err);
});