import pkg from "telegram";
import eventsPkg from "telegram/events/index.js";
const { NewMessage, CallbackQuery } = eventsPkg;
import sessionsPkg from "telegram/sessions/index.js";
const { StringSession } = sessionsPkg;
const { TelegramClient, Api } = pkg;
import QRCode from "qrcode";
import input from "input";
import fs from "fs";
import dotenv from "dotenv";
import settings from "./settings.js";

dotenv.config();

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const botToken = process.env.BOT_TOKEN;


global.Markup = {
  inlineKeyboard: (btns) => ({ 
    buttons: btns.map(row => 
      Array.isArray(row) ? row.map(b => {
        if (b.url) return new Api.KeyboardButtonUrl({ text: b.text, url: b.url });
        if (b.callback_data) return new Api.KeyboardButtonCallback({ text: b.text, data: Buffer.from(b.callback_data) });
        return b;
      }) : []
    )
  }),
  button: {
    url: (text, url) => ({ text, url }),
    callback: (text, callback_data) => ({ text, callback_data })
  }
};


let sessionString = "";
let sessionData = null;

if (fs.existsSync("./session.txt")) {
  sessionString = fs.readFileSync("./session.txt", "utf8").trim();

  if (fs.existsSync("./session.json")) {
    try {
      sessionData = JSON.parse(fs.readFileSync("./session.json", "utf8"));
    } catch (e) {
    }
  }
}

const client = new TelegramClient(
  new StringSession(sessionString),
  apiId,
  apiHash,
  { connectionRetries: 5 }
);
client.setLogLevel("error");

if (botToken && botToken.length > 10) {
  await client.start({ botAuthToken: botToken });
  console.log("💙 HATSUNE MIKU BOT ONLINE (Token) 💙");
  startBot();
} else if (sessionString.length > 5) {
  await client.connect();
  console.log("👤 HATSUNE MIKU USERBOT ONLINE 👤");
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
    const { loadCommands, executeCommand } = await import("./nucleo/system/commandLoader.js");
    await loadCommands();
    global.executeCommand = executeCommand;
  } catch (e) {
    console.error("Error cargando el cargador de comandos:", e);
  }
}

async function initializeDatabase() {
  if (!fs.existsSync("./nucleo/system/initDB.js")) return;
  try {
    const { loadDatabase } = await import("./nucleo/system/initDB.js");
    loadDatabase();
  } catch (e) {
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
  // Crear carpeta temporal si no existe
  if (!fs.existsSync("./temp")) fs.mkdirSync("./temp", { recursive: true });

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

   
    let cmdName, args;
    const match = text.match(/^\.\s*([a-zA-Z0-9]+)(?:\s+(.*))?$/s);

    if (match) {
      cmdName = match[1].toLowerCase();
      args = match[2] ? match[2].trim().split(/\s+/) : [];
    } else if (/^[1-4]$/.test(text)) {
      
      const repliedMsg = await msg.getReplyMessage();
      if (repliedMsg && repliedMsg.senderId?.toString() === myId) {
        cmdName = 'play';
        args = [text];
      } else { return; }
    } else { return; }

  
    const sender = await msg.getSender();
    const chat = await msg.getChat();
    const userName = sender ? (sender.username ? `@${sender.username}` : `${sender.firstName || ''} ${sender.lastName || ''}`.trim()) : 'Desconocido';
    const chatName = chat.title || 'Chat Privado';
    const time = new Date().toLocaleTimeString();

    console.log(`
┌── [ 📩 COMANDO ] ──┐
│ 👤: ${userName.substring(0, 15).padEnd(15)} │
│ 💬: ${chatName.toString().substring(0, 15).padEnd(15)} │
│ ⌨️: ${cmdName.padEnd(15)} │
│ ⏰: ${time.padEnd(15)} │
└────────────────────┘`);

   
    if (global.commands) {
      const cmd = global.commands.get(cmdName);
      
      if (cmd) {
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
            react: async (emoticon) => {
              try {
                const inputPeer = await msg.getInputChat();
                return await client.invoke(new Api.messages.SendReaction({
                  peer: inputPeer,
                  msgId: msg.id,
                  reaction: emoticon ? [new Api.ReactionEmoji({ emoticon })] : [],
                  addToRecent: true
                }));
              } catch (e) { console.error("Error al reaccionar:", e.message); }
            },
            answerCallbackQuery: async () => {}, 
            reply: async (textOrOpts, maybeOpts = {}) => {
              const opts = typeof textOrOpts === 'string' ? { message: textOrOpts, ...maybeOpts } : { ...textOrOpts };
              const pm = (opts.parseMode || opts.parse_mode || 'markdown').toLowerCase();
              const parseMode = (pm === 'markdown' || pm === 'md') ? 'md' : pm;
              return await client.sendMessage(msg.peerId, {
                ...opts, parseMode,
                buttons: opts.buttons || (opts.replyMarkup?.inlineKeyboard)
              });
            },
            replyWithVideo: async (video, options = {}) => {
              const sendOpts = { ...options, file: video.source || video };
              const pm = (sendOpts.parseMode || sendOpts.parse_mode || 'markdown').toLowerCase();
              const parseMode = (pm === 'markdown' || pm === 'md') ? 'md' : pm;
              return await client.sendFile(msg.peerId, {
                ...sendOpts, parseMode,
                buttons: sendOpts.buttons || (sendOpts.replyMarkup?.inlineKeyboard)
              });
            },
            replyWithPhoto: async (photo, options = {}) => {
              const sendOpts = { ...options, file: photo.source || photo };
              const pm = (sendOpts.parseMode || sendOpts.parse_mode || 'markdown').toLowerCase();
              const parseMode = (pm === 'markdown' || pm === 'md') ? 'md' : pm;
              return await client.sendFile(msg.peerId, {
                ...sendOpts, parseMode,
                buttons: sendOpts.buttons || (sendOpts.replyMarkup?.inlineKeyboard)
              });
            },
            from: msg.sender || await msg.getSender(),
            message: msg
          };
          
          await global.executeCommand(ctx, cmdName, args);
          return;
        } catch (e) {
          console.error(`❌ Error en comando ${cmdName}:`, e.message);
          await msg.reply({ message: "❌ Error al ejecutar el comando." });
        }
      }
    }

   
   

  }, new NewMessage({
    outgoing: true,
    incoming: true
  }));

  
  client.addEventHandler(async (event) => {
    
    const query = event.query || event;
    if (!query.data) return;
    const data = query.data.toString();

 
    for (const [cmdName, cmd] of global.commands) {
      if (cmd.callback && typeof cmd.callback === 'function') {
        try {
          const ctx = {
            client,
            query: query,
            chatId: query.peer,
            senderId: query.userId?.toString(),
            react: async (emoticon) => {
              try {
                const inputPeer = query.peer; 
                return await client.invoke(new Api.messages.SendReaction({
                  peer: inputPeer,
                  msgId: query.msgId,
                  reaction: emoticon ? [new Api.ReactionEmoji({ emoticon })] : [],
                  addToRecent: true
                }));
              } catch (e) { }
            },
            answerCallbackQuery: async (options) => {
              const text = typeof options === 'string' ? options : options.text;
              const alert = typeof options === 'object' ? (options.showAlert || options.alert) : false;
              return await client.invoke(new Api.messages.SetBotCallbackAnswer({
                queryId: query.queryId,
                message: text,
                alert: alert
              }));
            }
          };
          
          await cmd.callback(ctx, data);
          return;
        } catch (e) {
          console.error(`❌ Error en callback ${cmdName}:`, e.message);
          try {
            await client.invoke(new Api.messages.SetBotCallbackAnswer({
              queryId: query.queryId,
              message: "❌ Error al procesar la acción.",
              alert: true
            }));
          } catch (err) {
           
          }
        }
      }
    }
  }, new CallbackQuery({}));

  console.log("🚀 Bot listo para recibir comandos.");
}

process.on("uncaughtException", (err) => {
});

process.on("unhandledRejection", (err) => {
});