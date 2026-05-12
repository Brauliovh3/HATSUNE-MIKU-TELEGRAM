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

// ─── Cargar sesión ────────────────────────────────────────────────────────────
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

// ─── Crear cliente ────────────────────────────────────────────────────────────
const client = new TelegramClient(
  new StringSession(sessionString),
  apiId,
  apiHash,
  { connectionRetries: 5 }
);

await client.connect();

console.log("=================================");
console.log("💙 HATSUNE MIKU USERBOT 💙");
console.log("=================================\n");

// ─── Flujo principal ──────────────────────────────────────────────────────────
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

// ─── Guardar sesión helper ────────────────────────────────────────────────────
async function saveSession(me) {
  const session = client.session.save();
  fs.writeFileSync("./session.txt", session);

  const data = {
    session,
    userId: me.id?.toString(),
    firstName: me.firstName,
    lastName: me.lastName,
    username: me.username,
    phone: me.phone,
    created: new Date().toISOString(),
  };

  if (!fs.existsSync("./sessions")) fs.mkdirSync("./sessions");
  const sessionName = `session_${Date.now()}`;
  fs.writeFileSync(`./sessions/${sessionName}.txt`, session);
  fs.writeFileSync(`./sessions/${sessionName}.json`, JSON.stringify(data, null, 2));
  fs.writeFileSync("./session.json", JSON.stringify(data, null, 2));

  console.log("💾 Sesión guardada\n");
}

// ─── Login por código ─────────────────────────────────────────────────────────
async function phoneLoginFlow() {
  console.log("\n📱 Iniciando login por código...\n");

  try {
    await client.start({
      phoneNumber: async () => await input.text("📱 Número Telegram (+51...): "),
      password: async () => await input.text("🔐 Contraseña 2FA (Enter si no tienes): "),
      phoneCode: async () => await input.text("💬 Código recibido en Telegram: "),
      onError: (err) => console.log("❌ Error:", err),
    });

    const me = await client.getMe();
    await saveSession(me);

    console.log("\n✅ Login exitoso");
    console.log(`👤 Bienvenido, ${me.firstName}!\n`);

    startBot();
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    process.exit(1);
  }
}

// ─── Login por QR (método nativo gramJS) ─────────────────────────────────────
async function qrLoginFlow() {
  console.log("\n📷 Iniciando QR Login...\n");
  console.log("ℹ️  El QR se renueva automáticamente si expira.\n");

  try {
   
    await client.signInUserWithQrCode(
      { apiId, apiHash },
      {
        // Se llama cada vez que hay un nuevo QR (inicial o renovado)
        qrCode: async ({ token, expires }) => {
          const qr = `tg://login?token=${token.toString("base64url")}`;

          const qrTerminal = await QRCode.toString(qr, {
            type: "terminal",
            small: true,
          });

          // Limpiar consola y mostrar QR actualizado
          process.stdout.write("\x1Bc");
          console.log("=================================");
          console.log("💙 HATSUNE MIKU USERBOT 💙");
          console.log("=================================\n");
          console.log("📷 Escanea este QR con Telegram:\n");
          console.log(qrTerminal);
          await QRCode.toFile("./telegram-qr.png", qr).catch(() => {});
          console.log("📁 QR guardado: telegram-qr.png");
          console.log("\n📲 Pasos:");
          console.log("   1. Abre Telegram en tu teléfono");
          console.log("   2. Configuración > Dispositivos > Vincular dispositivo");
          console.log("   3. Escanea el QR\n");
          const segsRestantes = Math.max(0, Math.round(expires - Date.now() / 1000));
          console.log(`⏱️  Expira en ~${segsRestantes}s (se renueva solo)\n`);
        },

        // Se llama si la cuenta tiene contraseña 2FA
        password: async (hint) => {
          console.log(`\n🔐 Se requiere contraseña 2FA${hint ? ` (pista: ${hint})` : ""}`);
          return await input.text("🔐 Contraseña 2FA: ");
        },

        onError: async (err) => {
          // true = seguir reintentando, false = abortar
          if (err.message?.includes("SESSION_PASSWORD_NEEDED")) return false;
          console.log("⚠️ Error QR (reintentando):", err.message);
          return true;
        },
      }
    );

    // Si llega aquí, gramJS ya actualizó la sesión interna correctamente
    const me = await client.getMe();
    await saveSession(me);

    console.log(`✅ QR Login exitoso!`);
    console.log(`👤 Bienvenido, ${me.firstName}!\n`);

    startBot();

  } catch (error) {
    console.error("\n❌ Error en QR login:", error.message);
    const retry = await input.text("¿Usar login por código en su lugar? (s/n): ");
    if (retry.toLowerCase() === "s") {
      await phoneLoginFlow();
    } else {
      process.exit(0);
    }
  }
}

// ─── Bot principal ────────────────────────────────────────────────────────────
function startBot() {
  console.log("=================================");
  console.log("🟢 USERBOT ONLINE");
  console.log("=================================\n");

  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (!msg || !msg.message) return;

    const text = msg.message.trim();
    console.log(`📩 [${new Date().toLocaleTimeString()}] ${text}`);

    try {
      if (text === ".ping") {
        await msg.reply({ message: "🏓 Pong!" });
      }

      else if (text === ".menu") {
        await msg.reply({
          message:
            "💙 **HATSUNE MIKU USERBOT** 💙\n\n" +
            "⚡ `.ping` — Verificar conexión\n" +
            "📋 `.menu` — Ver comandos\n" +
            "👤 `.me` — Ver tu info\n" +
            "🗑️ `.del` — Borrar mensaje (responde a uno)",
          parseMode: "markdown",
        });
      }

      else if (text === ".me") {
        const me = await client.getMe();
        await msg.reply({
          message:
            `👤 **Tu información:**\n\n` +
            `🆔 ID: \`${me.id}\`\n` +
            `👤 Nombre: ${me.firstName} ${me.lastName || ""}\n` +
            `🔖 Username: @${me.username || "sin username"}\n` +
            `📱 Teléfono: +${me.phone}`,
          parseMode: "markdown",
        });
      }

      else if (text === ".del") {
        if (msg.replyTo) {
          const replied = await msg.getReplyMessage();
          if (replied) await replied.delete({ revoke: true });
        }
        await msg.delete({ revoke: true });
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