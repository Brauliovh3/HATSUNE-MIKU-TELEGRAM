import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage, CallbackQuery } from "telegram/events/index.js";
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
  { connectionRetries: 5 }
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


async function qrLoginFlow() {
  console.log("\n📷 Iniciando QR Login...\n");
  console.log("ℹ️  El QR se renueva automáticamente si expira.\n");

  try {
    await client.signInUserWithQrCode(
      { apiId, apiHash },
      {
        qrCode: async ({ token, expires }) => {
          const qr = `tg://login?token=${token.toString("base64url")}`;
          const qrTerminal = await QRCode.toString(qr, { type: "terminal", small: true });

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
          const segs = Math.max(0, Math.round(expires - Date.now() / 1000));
          console.log(`⏱️  Expira en ~${segs}s (se renueva solo)\n`);
        },

        password: async (hint) => {
          console.log(`\n🔐 Se requiere contraseña 2FA${hint ? ` (pista: ${hint})` : ""}`);
          return await input.text("🔐 Contraseña 2FA: ");
        },

        onError: async (err) => {
          if (err.message?.includes("SESSION_PASSWORD_NEEDED")) return false;
          console.log("⚠️ Error QR (reintentando):", err.message);
          return true;
        },
      }
    );

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


async function loadExternalCommands() {
  if (!fs.existsSync("./nucleo/system/commandLoader.js")) return;
  try {
    const { loadCommands } = await import("./nucleo/system/commandLoader.js");
    await loadCommands();
    console.log("📦 Comandos externos cargados\n");
  } catch (e) {
    console.log("⚠️ No se pudieron cargar comandos externos:", e.message);
  }
}

async function initializeDatabase() {
  if (!fs.existsSync("./nucleo/system/initDB.js")) return;
  try {
    const { loadDatabase } = await import("./nucleo/system/initDB.js");
    loadDatabase();
    console.log("📁 Base de datos inicializada\n");
  } catch (e) {
    console.log("⚠️ Error inicializando base de datos:", e.message);
  }
}


async function loadMenu() {
  if (!fs.existsSync("./commands.js")) return null;
  try {
    const { menuObject, categoryAliases } = await import("./commands.js");
    return { menuObject, categoryAliases };
  } catch (e) {
    console.log("⚠️ No se pudo cargar commands.js:", e.message);
    return null;
  }
}


async function startBot() {
  console.log("=================================");
  console.log("🟢 USERBOT ONLINE");
  console.log("=================================\n");

 
  await initializeDatabase();
  await loadExternalCommands();
  const menuData = await loadMenu();

  const me = await client.getMe();
  const myId = me.id?.toString();


  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (!msg || !msg.message) return;

    const text = msg.message.trim();
    const chatId = msg.chatId;
    const senderId = msg.senderId?.toString();

   
    if (!text.startsWith(".")) return;

   
    const isOwn = senderId === myId;
    const origen = isOwn ? "YO" : `ID:${senderId}`;
    console.log(`📩 [${new Date().toLocaleTimeString()}] [${origen}] Chat:${chatId} → ${text}`);

   
    if (global.commands) {
      const parts = text.slice(1).split(" ");
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      const cmd = global.commands.get(cmdName);
      
      if (cmd) {
        
        if (cmd.isOwner && senderId !== myId) {
          await msg.reply({ message: "❌ Este comando solo puede usarlo el owner." });
          return;
        }
        
        try {
       
          const ctx = {
            client,
            msg,
            args,
            text,
            chatId,
            senderId,
            me,
            myId,
            reply: async (options) => {
              if (typeof options === 'string') {
                return await msg.reply({ message: options });
              }
              return await msg.reply(options);
            },
            from: msg.sender || await msg.getSender(),
            message: msg
          };
          
          await cmd.run(ctx, args);
          return;
        } catch (e) {
          console.error(`❌ Error en comando ${cmdName}:`, e.message);
          await msg.reply({ message: "❌ Error al ejecutar el comando." });
        }
      }
    }

   
   

  }, new NewMessage({
    outgoing: true,  
    incoming: true,   
  }));

  
  client.addEventHandler(async (event) => {
    const data = event.query.data.toString();
    console.log('Callback data:', data);

    // Find command that handles this callback
    for (const [cmdName, cmd] of global.commands) {
      if (cmd.callback && typeof cmd.callback === 'function') {
        try {
          const ctx = {
            client,
            query: event.query,
            chatId: event.query.chatId,
            senderId: event.query.senderId,
            answerCallbackQuery: async (options) => {
              if (typeof options === 'string') {
                return await event.query.answer({ message: options });
              }
              return await event.query.answer(options);
            }
          };
          
          await cmd.callback(ctx, data);
          return;
        } catch (e) {
          console.error(`❌ Error en callback ${cmdName}:`, e.message);
          await event.query.answer({ 
            text: "❌ Error al procesar la acción.", 
            showAlert: true 
          });
        }
      }
    }
  }, new CallbackQuery({}));

  console.log("🎧 Escuchando comandos en todos los chats...");
  console.log("💡 Todos los comandos están cargados desde carpetas\n");
}

process.on("uncaughtException", (err) => {
  console.error("💥 Error no capturado:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Promesa rechazada:", err?.message || err);
});