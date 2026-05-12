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
  console.log(" Iniciando proceso de QR Login...\n");

  try {
    console.log(" Generando token de QR...");
    console.log(" NOTA: Los tokens de Telegram expiran muy rápido");
    console.log(" Escanea el QR inmediatamente después de aparecer\n");


    const result = await client.invoke(
      new Api.auth.ExportLoginToken({
        apiId,
        apiHash,
        exceptIds: [],
        apiHash: apiHash,
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

    console.log(" QR guardado: telegram-qr.png");
    console.log(" ESCANEA INMEDIATAMENTE:");
    console.log("   1. Abre Telegram en tu teléfono");
    console.log("   2. Ve a Settings > Devices > Link Desktop Device");
    console.log("   3. Escanea el QR AHORA");
    console.log("   4. O abre directamente: " + qr);
    console.log("\n NOTA: El QR expira en segundos - ESCANEA AHORA!");

    
    let escaneado = false;
    let intentos = 0;
    const maxIntentos = 30; 

    console.log(" Verificando cada 500ms...");

    while (!escaneado && intentos < maxIntentos) {
      await new Promise((r) => setTimeout(r, 500)); 
      intentos++;

      try {
        const loginResult = await client.invoke(
          new Api.auth.ImportLoginToken({
            token: result.token,
          })
        );

        if (loginResult instanceof Api.auth.LoginTokenSuccess) {
          escaneado = true;

          console.log("\n Escaneado exitosamente!");
          console.log(" Usuario:", loginResult.authorization.user.firstName || "Desconocido");

    
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
            sessionName: sessionName,
          };

          fs.writeFileSync(`${sessionPath}.txt`, session);
          fs.writeFileSync(`${sessionPath}.json`, JSON.stringify(sessionData, null, 2));
          fs.writeFileSync("./session.json", JSON.stringify(sessionData, null, 2));

          console.log(" Sesión guardada correctamente:");
          console.log(`   Principal: session.txt`);
          console.log(`   Backup: sessions/${sessionName}.txt`);
          console.log(`   Datos: sessions/${sessionName}.json`);
          console.log(" Conexión establecida y verificada");

          startBot();
          return;
        } else if (loginResult instanceof Api.auth.LoginTokenNeeded) {
          process.stdout.write(` Esperando escaneo... (${intentos}/${maxIntentos})\r`);
        }
      } catch (e) {
        if (e.message.includes("TOKEN_EXPIRED") || e.message.includes("EXPIRED")) {
          console.log("\n Token expirado - intenta de nuevo");
          break;
        } else if (e.message.includes("SESSION_PASSWORD_NEEDED")) {
          console.log("\n Se requiere contraseña 2FA");
          const password = await input.text(" Contraseña 2FA: ");
          break;
        }
      }
    }

    if (!escaneado) {
      console.log("\n No se pudo escanear el QR a tiempo");
      console.log(" Opción: Usa login por código (opción 1) para más tiempo");


      const usarCodigo = await input.text("¿Quieres intentar con código? (s/n): ");
      if (usarCodigo.toLowerCase() === "s") {
        await phoneLoginFlow();
        return;
      }
    }
  } catch (error) {
    console.error(" Error en el proceso de QR:", error.message);
    console.log(" Intenta con login por código (opción 1)");
  }

  console.log("\n Volviendo al menú principal...");
  process.exit(0);
}


async function phoneLoginFlow() {
  console.log("\n Iniciando login por código...\n");

  try {
    await client.start({
      phoneNumber: async () => await input.text(" Número Telegram: "),
      password: async () => await input.text(" Contraseña 2FA: "),
      phoneCode: async () => await input.text(" Código Telegram: "),
      onError: (err) => console.log(err),
    });

    const session = client.session.save();
    fs.writeFileSync("./session.txt", session);


    const me = await client.getMe();
    const sessionData = {
      session: session,
      userId: me.id,
      firstName: me.firstName,
      lastName: me.lastName,
      username: me.username,
      phone: me.phone,
      created: new Date().toISOString(),
    };

    fs.writeFileSync("./session.json", JSON.stringify(sessionData, null, 2));

    console.log(" Login exitoso");
    console.log(" Sesión guardada");
    console.log(` Usuario: ${me.firstName}`);

    startBot();
  } catch (error) {
    console.error(" Error en login por código:", error.message);
  }
}


function startBot() {
  console.log("\n=================================");
  console.log(" USERBOT ONLINE");
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