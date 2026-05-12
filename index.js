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
  console.log("📲 Iniciando proceso de QR Login...\n");

  try {
    // Generar token de login
    console.log("� Obteniendo token de autorización...");
    const result = await client.invoke(
      new Api.auth.ExportLoginToken({
        apiId,
        apiHash,
        exceptIds: [],
      })
    );

    const token = result.token.toString("base64url");
    const qr = `tg://login?token=${token}`;

    // Generar y mostrar QR
    const qrTerminal = await QRCode.toString(qr, {
      type: "terminal",
      small: true,
    });

    console.log(qrTerminal);
    await QRCode.toFile("./telegram-qr.png", qr);

    console.log("📁 QR guardado: telegram-qr.png");
    console.log("📱 Escanea desde Telegram:");
    console.log("   Settings > Devices > Link Desktop Device");
    console.log("   O abre el enlace: " + qr);
    console.log("\n⏳ Esperando escaneo del QR...");

    // Esperar el escaneo con verificación inmediata
    let escaneado = false;
    let intentos = 0;
    const maxIntentos = 120; // 2 minutos máximo

    while (!escaneado && intentos < maxIntentos) {
      await new Promise((r) => setTimeout(r, 1000));
      intentos++;

      try {
        const loginResult = await client.invoke(
          new Api.auth.ImportLoginToken({
            token: result.token,
          })
        );

        if (loginResult instanceof Api.auth.LoginTokenSuccess) {
          escaneado = true;
          
          console.log("\n✅ QR Escaneado exitosamente!");
          console.log("👤 Usuario:", loginResult.authorization.user.firstName || "Desconocido");
          
          // Guardar sesión en carpeta sessions
          const sessionName = `session_${Date.now()}`;
          const sessionPath = `./sessions/${sessionName}`;
          
          if (!fs.existsSync("./sessions")) {
            fs.mkdirSync("./sessions");
          }

          await client.connect();
          const session = client.session.save();
          
          
          fs.writeFileSync("./session.txt", session);
          
          
          const sessionData = {
            session: session,
            userId: loginResult.authorization.user.id,
            firstName: loginResult.authorization.user.firstName,
            lastName: loginResult.authorization.user.lastName,
            username: loginResult.authorization.user.username,
            phone: loginResult.authorization.user.phone,
            created: new Date().toISOString(),
            sessionName: sessionName
          };
          
          fs.writeFileSync(`${sessionPath}.txt`, session);
          fs.writeFileSync(`${sessionPath}.json`, JSON.stringify(sessionData, null, 2));
          fs.writeFileSync("./session.json", JSON.stringify(sessionData, null, 2));

          console.log("💾 Sesión guardada correctamente:");
          console.log(`   � Principal: session.txt`);
          console.log(`   📁 Backup: sessions/${sessionName}.txt`);
          console.log(`   📁 Datos: sessions/${sessionName}.json`);
          console.log("🔐 Conexión establecida y verificada");

          startBot();
          return;

        } else if (loginResult instanceof Api.auth.LoginTokenNeeded) {
        
          if (intentos % 15 === 0) {
            console.log(`⏳ QR listo para escanear... (${intentos}s/${maxIntentos}s)`);
          }
        }

      } catch (e) {
        if (e.message.includes("TOKEN_EXPIRED") || e.message.includes("EXPIRED")) {
          console.log("\n⏰ El token ha expirado");
          console.log("❌ Por favor, genera un nuevo QR");
          break;
        } else if (e.message.includes("SESSION_PASSWORD_NEEDED")) {
          console.log("\n🔐 Se requiere contraseña 2FA");
          const password = await input.text("🔐 Contraseña 2FA: ");
         
          break;
        } else {
        
          if (intentos % 30 === 0) {
            console.log(`⌛ Esperando escaneo... (${intentos}s)`);
          }
        }
      }
    }

    if (!escaneado) {
      console.log("\n⏰ Tiempo de espera agotado");
      console.log("💡 Intenta escanear más rápido o genera un nuevo QR");
    }

  } catch (error) {
    console.error("❌ Error en el proceso de QR:", error.message);
  }

  console.log("\n🔄 Volviendo al menú principal...");
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