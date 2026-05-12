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
let sessionData = null;

if (fs.existsSync("./session.txt")) {
  sessionString = fs.readFileSync("./session.txt", "utf8");
  
  
  if (fs.existsSync("./session.json")) {
    try {
      sessionData = JSON.parse(fs.readFileSync("./session.json", "utf8"));
      console.log("📁 Información de sesión encontrada:");
      console.log(`👤 Usuario: ${sessionData.firstName || 'N/A'} ${sessionData.lastName || ''}`);
      console.log(`🆔 ID: ${sessionData.userId || 'N/A'}`);
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

    await qrLoginFlow();

  } else {

    console.log(" Opción inválida");
    process.exit(0);

  }

}

async function qrLoginFlow() {
  let maxRegenerations = 5;
  let regenerationCount = 0;

  while (regenerationCount < maxRegenerations) {
    try {
      console.log(`📲 Generando QR Login... (${regenerationCount + 1}/${maxRegenerations})\n`);

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
      let intentos = 0;
      const maxIntentos = 20;

      while (!autorizado && intentos < maxIntentos) {
        await new Promise((r) => setTimeout(r, 3000));
        intentos++;

        try {
          const loginResult = await client.invoke(
            new Api.auth.ImportLoginToken({
              token: result.token,
            })
          );

          console.log("🔍 Verificando token...");

          if (loginResult instanceof Api.auth.LoginTokenSuccess) {
            autorizado = true;

            console.log("✅ QR Escaneado exitosamente");
            console.log("👤 Usuario:", loginResult.authorization.user.firstName || "Desconocido");

            await client.connect();
            
            const session = client.session.save();
            fs.writeFileSync("./session.txt", session);

           
            const sessionData = {
              session: session,
              userId: loginResult.authorization.user.id,
              firstName: loginResult.authorization.user.firstName,
              lastName: loginResult.authorization.user.lastName,
              username: loginResult.authorization.user.username,
              created: new Date().toISOString()
            };
            
            fs.writeFileSync("./session.json", JSON.stringify(sessionData, null, 2));

            console.log("💾 Sesión guardada correctamente");
            console.log("🔐 Conexión establecida");
            console.log("📁 Archivos de sesión: session.txt y session.json");

            startBot();
            return;

          } else if (loginResult instanceof Api.auth.LoginTokenNeeded) {
            console.log("⏳ Token aún no autorizado...");
          } else {
            console.log("❌ Respuesta inesperada:", loginResult.className);
          }

        } catch (e) {
          console.log(`⌛ Esperando escaneo... (${intentos}/${maxIntentos})`);
          
          if (e.message.includes("TOKEN_EXPIRED")) {
            console.log("⏰ Token expirado. Generando nuevo QR...");
            autorizado = true; 
            break;
          } else if (e.message.includes("SESSION_PASSWORD_NEEDED")) {
            console.log("🔐 Se requiere contraseña 2FA");
            const password = await input.text("🔐 Contraseña 2FA: ");
         
            autorizado = true;
            break;
          }
        }
      }

      if (!autorizado) {
        console.log("⏰ Tiempo de espera agotado para este QR.");
        regenerationCount++;
        if (regenerationCount < maxRegenerations) {
          console.log("🔄 Generando nuevo QR...\n");
        }
      }

    } catch (error) {
      console.error("❌ Error generando QR:", error);
      regenerationCount++;
    }
  }

  console.log("❌ Máximo de intentos alcanzado. Intenta más tarde.");
  process.exit(0);
}

function startBot() {

  console.log("\n=================================");
  console.log("🤖 USERBOT ONLINE");
  console.log("=================================\n");

  
  if (!client.connected) {
    console.log("🔄 Reconectando cliente...");
    client.connect().then(() => {
      console.log("✅ Cliente conectado correctamente");
    }).catch(err => {
      console.error("❌ Error al conectar:", err);
    });
  }

  client.addEventHandler(async (event) => {

    const msg = event.message;

    if (!msg || !msg.message) return;

    const text = msg.message;

    console.log("📩 Mensaje recibido:", text);

    try {
      if (text === ".ping") {
        console.log("🏓 Respondiendo a .ping");
        await client.sendMessage(msg.chatId, {
          message: "🏓 Pong",
        });
      }

      if (text === ".menu") {
        console.log("📋 Respondiendo a .menu");
        await client.sendMessage(msg.chatId, {
          message: `
💙 HATSUNE MIKU USERBOT 💙

⚡ .ping
📋 .menu
`,
        });
      }
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
    }

  });

  console.log("🎧 Bot escuchando comandos...");

}


process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);