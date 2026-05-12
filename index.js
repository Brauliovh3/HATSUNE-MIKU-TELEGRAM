import dotenv from 'dotenv';
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import fs from 'fs-extra';
import moment from 'moment-timezone';
import readline from 'readline';
import QRCode from 'qrcode';
import { menuObject, categoryAliases, categoryNames } from './nucleo/commands.js';
import { categoryImages, mainMenuImage } from './nucleo/menuConfig.js';
import { initDB } from './nucleo/system/initDB.js';
import { loadCommands } from './nucleo/system/commandLoader.js';
import serverQR from './nucleo/system/serverQR.js';


dotenv.config();

// Colores para consola
const C = {
  c: (t) => '\x1b[36m' + t + '\x1b[0m',
  g: (t) => '\x1b[32m' + t + '\x1b[0m',
  y: (t) => '\x1b[33m' + t + '\x1b[0m',
  r: (t) => '\x1b[31m' + t + '\x1b[0m',
  b: (t) => '\x1b[34m' + t + '\x1b[0m',
  m: (t) => '\x1b[35m' + t + '\x1b[0m',
  bold: (t) => '\x1b[1m' + t + '\x1b[0m'
};

// Banner simple HATSUNE MIKU
function banner() {
  console.log(C.c(`
  ╔══════════════════════════════════╗
  ║     💙 HATSUNE MIKU BOT 💙       ║
  ║     🤖 TELEGRAM v1.0.0          ║
  ║     👑 by DEPOOL                ║
  ╚══════════════════════════════════╝`));
}

async function initializeBot() {
const token = process.env.BOT_TOKEN || '';
const bot = new Telegraf(token);

global.db = { data: { users: {}, chats: {}, settings: {}, subbots: {} } };
global.owner = ['51931619252'];
global.serverQR = serverQR;

await loadCommands();

const botInfo = {
  serverName: 'Hatsune Miku Server',
  name: 'Hatsune Miku Bot',
  username: '@hatsune_miku_bot',
  phone: '+51953073477',
  serverIP: process.env.SERVER_IP || 'localhost',
  port: process.env.PORT || 3000,
  version: '1.0.0'
};

// Generar QR
const qrData = await serverQR.generateServerQR(botInfo);
const qrPath = await serverQR.saveQRToFile(qrData, serverQR.serverSession.sessionId);

// ============================================
// MENÚ INTERACTIVO ANTES DE LANZAR EL BOT
// ============================================
banner();
console.log(C.g('\n🚀 Iniciando Hatsune Miku Telegram Bot...\n'));

const sessionId = global.serverQR.serverSession?.sessionId || 'SIN_SESION';

function mostrarMenu() {
  console.log(C.m(C.bold(`
  ╔══════════════════════════════════╗
  ║    🌸 VINCULACIÓN TELEGRAM 🌸    ║
  ╠══════════════════════════════════╣
  ║  ID: ${sessionId.slice(0, 20).padEnd(25)}║
  ╠══════════════════════════════════╣
  ║                                  ║
  ║  [1] 📋 VER CÓDIGO               ║
  ║  [2] 📱 VER QR                   ║
  ║  [3] ❌ SALIR                    ║
  ║                                  ║
  ╚══════════════════════════════════╝`)));
}

function mostrarCodigo() {
  console.log(C.g(`
  ╔══════════════════════════════════╗
  ║       📋 CÓDIGO DE SESIÓN        ║
  ╠══════════════════════════════════╣
  ║  Envía al bot de Telegram:       ║
  ║  ${C.bold(C.c(sessionId))}║
  ║                                  ║
  ║  Comando: /scanqr ${sessionId}║
  ╚══════════════════════════════════╝`));
}

function mostrarQR() {
  console.log(C.b(`
  ╔══════════════════════════════════╗
  ║        📱 QR GENERADO            ║
  ╠══════════════════════════════════╣
  ║  ✅ QR guardado en:              ║
  ║  📁 server_qr/                   ║
  ╚══════════════════════════════════╝`));
  
  try {
    QRCode.toString(JSON.stringify({
      type: 'TELEGRAM_SERVER_LINK',
      sessionId: sessionId,
      timestamp: Date.now()
    }), { type: 'terminal', small: true }, (err, qrStr) => {
      if (!err) {
        console.log(C.y('\n📱 Escanea con Telegram:'));
        console.log(C.c(qrStr));
      }
    });
  } catch (e) {
    console.log(C.r('\n⚠️ Error al mostrar QR'));
  }
}

// --- INICIO DEL MENÚ INTERACTIVO ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

let vinculado = false;
let tiempo = 600; // 10 minutos

// Mostrar menú inicial
mostrarMenu();

// Contador regresivo (avisa cada 30s)
const contador = setInterval(() => {
  tiempo--;
  if (vinculado) return;
  
  if (global.serverQR.isServerLinked()) {
    vinculado = true;
    clearInterval(contador);
    console.log(C.g('\n✅ ¡Sesión vinculada exitosamente!'));
    console.log(C.g('🎉 Bot listo!\n'));
    rl.close();
    return;
  }
  
  if (tiempo % 30 === 0 && tiempo > 0) {
    const m = Math.floor(tiempo / 60);
    const s = tiempo % 60;
    console.log(C.y(`⏰ ${m}:${s.toString().padStart(2,'0')} restantes`));
  }
  
  if (tiempo <= 0 && !vinculado) {
    clearInterval(contador);
    console.log(C.r('\n❌ Tiempo expirado. Reinicia el servidor.\n'));
    rl.close();
    process.exit(0);
  }
}, 1000);

// Función para preguntar opción
function preguntar() {
  if (vinculado) return;
  
  rl.question(C.c('\n👉 Opción (1, 2 o 3): '), (resp) => {
    if (vinculado) return;
    
    resp = resp.trim();
    
    if (resp === '1') {
      console.clear();
      banner();
      mostrarCodigo();
      console.log(C.y('\n⏳ Envía el código al bot de Telegram...'));
      mostrarMenu();
      preguntar();
      
    } else if (resp === '2') {
      console.clear();
      banner();
      mostrarQR();
      console.log(C.y('\n⏳ Escanea el QR con Telegram...'));
      mostrarMenu();
      preguntar();
      
    } else if (resp === '3' || resp.toLowerCase() === 'salir' || resp.toLowerCase() === 'exit') {
      console.log(C.r('\n❌ Saliendo...\n'));
      clearInterval(contador);
      rl.close();
      process.exit(0);
      
    } else {
      console.log(C.r('\n⚠️ Opción inválida. Usa 1 (CÓDIGO), 2 (QR) o 3 (SALIR).'));
      preguntar();
    }
  });
}

// --- LANZAR BOT Y LUEGO INICIAR PREGUNTAS ---
bot.use(async (ctx, next) => {
  await initDB(ctx);
  return next();
});

bot.start(async (ctx) => {
  const user = ctx.from;
  const userName = user.first_name || user.username || 'Usuario';
  
  const welcomeMessage = `💙 *¡BIENVENIDO A HATSUNE MIKU BOT!* 💙

👤 Hola ${userName}!
🤖 Soy el bot Hatsune Miku con todas las funcionalidades que amas

📋 *MENÚ PRINCIPAL:*
💰 Economía y RPG
🎯 Gacha y Waifus  
📥 Descargas
📝 Perfil
🎌 Anime y Reacciones
🎨 Stickers
🛠️ Utilidades
👥 Grupos
🔞 NSFW +18
⚙️ Configuración

🔘 *Usa los botones abajo para navegar*`;

  await ctx.replyWithPhoto(mainMenuImage, {
    caption: welcomeMessage,
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('💰 ECONOMÍA', 'menu_economia'),
        Markup.button.callback('🎯 GACHA', 'menu_gacha')
      ],
      [
        Markup.button.callback('📥 DESCARGAS', 'menu_downloads'),
        Markup.button.callback('📝 PERFIL', 'menu_profile')
      ],
      [
        Markup.button.callback('🎌 ANIME', 'menu_anime'),
        Markup.button.callback('🎨 STICKERS', 'menu_stickers')
      ],
      [
        Markup.button.callback('🛠️ UTILIDADES', 'menu_utils'),
        Markup.button.callback('👥 GRUPOS', 'menu_grupo')
      ],
      [
        Markup.button.callback('🔞 NSFW +18', 'menu_nsfw'),
        Markup.button.callback('⚙️ CONFIG', 'menu_sockets')
      ],
      [
        Markup.button.callback('📋 MENÚ COMPLETO', 'menu_all'),
        Markup.button.callback('❓ AYUDA', 'help')
      ]
    ])
  });
});


bot.command(['menu', 'help', 'ayuda'], async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const category = args[0];
  
  if (category && categoryAliases[category]) {
    return await sendCategoryMenu(ctx, category);
  }
  
  await sendMainMenu(ctx);
});


async function sendMainMenu(ctx) {
  const userCount = Object.keys(global.db.data.users).length;
  const uptime = process.uptime();
  const formattedUptime = formatUptime(uptime);
  
  const message = `╭━💙 MENU PRINCIPAL 💙━╮
│
│ 💙 *HATSUNE MIKU BOT*
│
│ 👤 *Usuarios:* ${userCount}
│ ⏱️ *Uptime:* ${formattedUptime}
│ 📱 *Plataforma:* Telegram
│
│ 💙 Selecciona una categoría:
│
╰━━━━━━━━━━━━━━━━━╯`;

  await ctx.replyWithPhoto(mainMenuImage, {
    caption: message,
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('💰 ECONOMÍA', 'menu_economia'),
        Markup.button.callback('🎯 GACHA', 'menu_gacha')
      ],
      [
        Markup.button.callback('📥 DESCARGAS', 'menu_downloads'),
        Markup.button.callback('📝 PERFIL', 'menu_profile')
      ],
      [
        Markup.button.callback('🎌 ANIME', 'menu_anime'),
        Markup.button.callback('🎨 STICKERS', 'menu_stickers')
      ],
      [
        Markup.button.callback('🛠️ UTILIDADES', 'menu_utils'),
        Markup.button.callback('👥 GRUPOS', 'menu_grupo')
      ],
      [
        Markup.button.callback('🔞 NSFW +18', 'menu_nsfw'),
        Markup.button.callback('⚙️ CONFIG', 'menu_sockets')
      ],
      [
        Markup.button.callback('📋 MENÚ COMPLETO', 'menu_all'),
        Markup.button.callback('❓ AYUDA', 'help')
      ]
    ])
  });
}


async function sendCategoryMenu(ctx, category) {
  const categoryName = categoryNames[category] || category.toUpperCase();
  const categoryImage = categoryImages[category] || mainMenuImage;
  const menuContent = menuObject[category] || 'Categoría no encontrada';
  
  const message = `╭━━━${categoryName}━━━╮
${menuContent}
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  await ctx.replyWithPhoto(categoryImage, {
    caption: message,
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('⬅️ VOLVER', 'menu_main'),
        Markup.button.callback('📋 TODOS', 'menu_all')
      ]
    ])
  });
}


bot.action(/^menu_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  
  if (category === 'main') {
    await sendMainMenu(ctx);
  } else if (category === 'all') {
    await sendCompleteMenu(ctx);
  } else if (categoryAliases[category]) {
    await sendCategoryMenu(ctx, category);
  } else {
    await ctx.reply('❌ Categoría no encontrada');
  }
  
  await ctx.answerCbQuery();
});


async function sendCompleteMenu(ctx) {
  const allCommands = Object.values(menuObject).join('\n\n');
  
  const message = `╭━━━📋 MENÚ COMPLETO 📋━━━╮
${allCommands}
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  
  if (message.length > 4000) {
    const parts = message.match(/.{1,4000}/g);
    for (const part of parts) {
      await ctx.reply(part);
    }
  } else {
    await ctx.reply(message);
  }
  
  await ctx.reply('⬅️ Usa /menu para volver al menú principal');
}


bot.command('ping', async (ctx) => {
  const start = Date.now();
  const msg = await ctx.reply('🏓 Pong!');
  const end = Date.now();
  await ctx.telegram.editMessageText(
    msg.chat.id,
    msg.message_id,
    null,
    `🏓 *Pong!*\n⚡ Velocidad: ${end - start}ms`
  );
});


bot.command(['infobot', 'status'], async (ctx) => {
  const userCount = Object.keys(global.db.data.users).length;
  const uptime = formatUptime(process.uptime());
  const memory = process.memoryUsage();
  
  const message = `💙 *INFORMACIÓN DEL BOT* 💙

🤖 *Nombre:* Hatsune Miku Bot
📱 *Plataforma:* Telegram
👥 *Usuarios:* ${userCount}
⏱️ *Uptime:* ${uptime}
💾 *Memoria RAM:* ${Math.round(memory.rss / 1024 / 1024)}MB
🔧 *Versión:* 1.0.0
👑 *Creador:* DEPOOL

📌 *Funcionalidades:*
• 💰 Economía completa
• 🎯 Gacha y Waifus
• 📥 Descargas múltiples plataformas
• 🎌 Reacciones Anime
• 🎨 Stickers personalizados
• 🛠️ Utilidades variadas
• 👥 Administración de grupos
• 🔞 Contenido +18`;

  await ctx.reply(message);
});


bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const args = text.split(' ').slice(1);
  const command = text.split(' ')[0].toLowerCase().replace('/', '');
  
  
  if (global.commands && global.commands.has(command)) {
    try {
      const cmd = global.commands.get(command);
      await cmd.run(ctx, args);
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      await ctx.reply(`❌ Error al ejecutar el comando /${command}`);
    }
  }
});


bot.catch((err, ctx) => {
  console.error('Telegram bot error:', err);
  ctx.reply('❌ Ocurrió un error inesperado. Por favor intenta nuevamente.');
});


function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [days && `${days}d`, `${hours}h`, `${minutes}m`, `${secs}s`]
    .filter(Boolean)
    .join(" ");
}


// LANZAR BOT
console.log(C.g('\n✅ Lanzando bot de Telegram...'));
bot.launch()
  .then(() => {
    console.log(C.g(`🤖 Bot: @${bot.botInfo.username}`));
    console.log(C.g('✅ Bot iniciado correctamente\n'));
    
    // Iniciar el menú interactivo después del launch
    preguntar();
  })
  .catch(err => {
    console.error(C.r('\n❌ Error al iniciar el bot:'), err.message);
    console.log(C.y('\n⚠️ Verifica tu BOT_TOKEN en .env'));
    process.exit(1);
  });


process.once('SIGINT', () => { console.log(C.y('\n👋 Bot detenido')); bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });

}

initializeBot().catch(console.error);