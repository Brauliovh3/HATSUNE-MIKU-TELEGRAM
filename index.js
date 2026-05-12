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

const qrData = await serverQR.generateServerQR(botInfo);
const qrPath = await serverQR.saveQRToFile(qrData, serverQR.serverSession.sessionId);
await serverQR.displayQRInConsole(qrData, serverQR.serverSession.sessionId);

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



function showHatsuneMikuBanner() {
  const banner = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║    ██╗  ██╗ █████╗ ████████╗███████╗██╗   ██╗███╗   ██╗███████╗
║    ██║  ██║██╔══██╗╚══██╔══╝██╔════╝██║   ██║████╗  ██║██╔════╝
║    ███████║███████║   ██║   █████╗  ██║   ██║██╔██╗ ██║█████╗  
║    ██╔══██║██╔══██║   ██║   ██╔══╝  ██║   ██║██║╚██╗██║██╔══╝  
║    ██║  ██║██║  ██║   ██║   ███████╗╚██████╔╝██║ ╚████║███████╗
║    ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
║                                                                ║
║    ███╗   ███╗██╗██╗  ██╗██╗   ██║                            ║
║    ████╗ ████║██║██║ ██╔╝██║   ██║                            ║
║    ██╔████╔██║██║█████╔╝ ██║   ██║                            ║
║    ██║╚██╔╝██║██║██╔═██╗ ██║   ██║                            ║
║    ██║ ╚═╝ ██║██║██║  ██╗╚██████╔╝                            ║
║    ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝                             ║
║                                                                ║
║    ████████╗███████╗██╗     ███████╗ ██████╗ ██████╗  █████╗ ███╗   ███╗
║    ╚══██╔══╝██╔════╝██║     ██╔════╝██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
║       ██║   █████╗  ██║     █████╗  ██║  ███╗██████╔╝███████║██╔████╔██║
║       ██║   ██╔══╝  ██║     ██╔══╝  ██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
║       ██║   ███████╗███████╗███████╗╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
║       ╚═╝   ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
║                                                                ║
║                 💙  B O T   T E L E G R A M  💙                ║
║                    ═══════════════════════                     ║
║              VERSIÓN 1.0.0  •  CREADO POR DEPOOL               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝`;
  console.log(chalkCyan(banner));
}


function chalkCyan(text) {
  return '\x1b[36m' + text + '\x1b[0m';
}
function chalkGreen(text) {
  return '\x1b[32m' + text + '\x1b[0m';
}
function chalkYellow(text) {
  return '\x1b[33m' + text + '\x1b[0m';
}
function chalkRed(text) {
  return '\x1b[31m' + text + '\x1b[0m';
}
function chalkBlue(text) {
  return '\x1b[34m' + text + '\x1b[0m';
}
function chalkMagenta(text) {
  return '\x1b[35m' + text + '\x1b[0m';
}
function bold(text) {
  return '\x1b[1m' + text + '\x1b[0m';
}


function showLinkMenu() {
  const sessionId = global.serverQR.serverSession?.sessionId || 'SIN_SESION';
  const botName = process.env.BOT_NAME || '💙HATSUNE MIKU💙';
  
  const menu = `
${chalkCyan('╔══════════════════════════════════════════╗')}
${chalkCyan('║')}      ${chalkMagenta(bold('🌸 MENÚ DE VINCULACIÓN 🌸'))}      ${chalkCyan('║')}
${chalkCyan('╠══════════════════════════════════════════╣')}
${chalkCyan('║')}                                          ${chalkCyan('║')}
${chalkCyan('║')}  ${chalkYellow('🤖 Bot:')} ${bold(botName)}              ${chalkCyan('║')}
${chalkCyan('║')}  ${chalkYellow('🆔 Sesión:')} ${bold(sessionId.slice(0, 20))}...       ${chalkCyan('║')}
${chalkCyan('║')}                                          ${chalkCyan('║')}
${chalkCyan('╠══════════════════════════════════════════╣')}
${chalkCyan('║')}                                          ${chalkCyan('║')}
${chalkCyan('║')}  ${chalkGreen(bold('   [1] 📋 MOSTRAR CÓDIGO'))}         ${chalkCyan('║')}
${chalkCyan('║')}       ${chalkYellow('Ver el código de vinculación')}      ${chalkCyan('║')}
${chalkCyan('║')}                                          ${chalkCyan('║')}
${chalkCyan('║')}  ${chalkBlue(bold('   [2] 📱 MOSTRAR QR'))}             ${chalkCyan('║')}
${chalkCyan('║')}       ${chalkYellow('Mostrar código QR para escanear')}   ${chalkCyan('║')}
${chalkCyan('║')}                                          ${chalkCyan('║')}
${chalkCyan('╠══════════════════════════════════════════╣')}
${chalkCyan('║')}  ${chalkYellow('⏰ Válido por 10 minutos')}              ${chalkCyan('║')}
${chalkCyan('║')}  ${chalkYellow('💡 Escribe 1 o 2 y presiona Enter')}     ${chalkCyan('║')}
${chalkCyan('╚══════════════════════════════════════════╝')}`;
  
  console.log(menu);
}

function showLinkCode() {
  const sessionId = global.serverQR.serverSession?.sessionId || 'SIN_SESION';
  
  const codeBox = `
${chalkGreen('╔══════════════════════════════════════════╗')}
${chalkGreen('║')}     ${chalkMagenta(bold('📋 CÓDIGO DE VINCULACIÓN'))}      ${chalkGreen('║')}
${chalkGreen('╠══════════════════════════════════════════╣')}
${chalkGreen('║')}                                          ${chalkGreen('║')}
${chalkGreen('║')}  ${chalkYellow('Envía este código al bot de Telegram:')}  ${chalkGreen('║')}
${chalkGreen('║')}                                          ${chalkGreen('║')}
${chalkGreen('║')}  ${bold(chalkCyan(sessionId))}  ${chalkGreen('║')}
${chalkGreen('║')}                                          ${chalkGreen('║')}
${chalkGreen('║')}  ${chalkYellow('📱 Comando:')}                          ${chalkGreen('║')}
${chalkGreen('║')}  ${bold('/scanqr ' + sessionId)}         ${chalkGreen('║')}
${chalkGreen('║')}                                          ${chalkGreen('║')}
${chalkGreen('╚══════════════════════════════════════════╝')}`;
  
  console.log(codeBox);
}

function showLinkQR() {
  const sessionId = global.serverQR.serverSession?.sessionId || 'SIN_SESION';
  
  const qrInfo = `
${chalkBlue('╔══════════════════════════════════════════╗')}
${chalkBlue('║')}      ${chalkMagenta(bold('📱 CÓDIGO QR GENERADO'))}        ${chalkBlue('║')}
${chalkBlue('╠══════════════════════════════════════════╣')}
${chalkBlue('║')}                                          ${chalkBlue('║')}
${chalkBlue('║')}  ${chalkYellow('✅ El código QR se ha generado y')}        ${chalkBlue('║')}
${chalkBlue('║')}  ${chalkYellow('guardado en la carpeta 📁 server_qr/')}    ${chalkBlue('║')}
${chalkBlue('║')}                                          ${chalkBlue('║')}
${chalkBlue('║')}  ${chalkYellow('🆔 Sesión:')}                             ${chalkBlue('║')}
${chalkBlue('║')}  ${bold(sessionId)}  ${chalkBlue('║')}
${chalkBlue('║')}                                          ${chalkBlue('║')}
${chalkBlue('║')}  ${chalkYellow('📁 Archivo QR:')}                          ${chalkBlue('║')}
${chalkBlue('║')}  ${chalkCyan('server_qr/server_' + sessionId + '.png')}   ${chalkBlue('║')}
${chalkBlue('║')}                                          ${chalkBlue('║')}
${chalkBlue('╚══════════════════════════════════════════╝')}`;
  
  console.log(qrInfo);
  
 
  try {
    QRCode.toString(JSON.stringify({
      type: 'TELEGRAM_SERVER_LINK',
      sessionId: sessionId,
      timestamp: Date.now()
    }), { type: 'terminal', small: true }, (err, qrStr) => {
      if (!err) {
        console.log(chalkYellow('\n📱 Escanea este QR con tu cámara de Telegram:\n'));
        console.log(chalkCyan(qrStr));
      }
    });
  } catch (e) {
    console.log(chalkRed('\n⚠️  No se pudo mostrar QR en terminal'));
  }
}

function startInteractiveLinking() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    let menuActive = true;
    let countdown = 600;

  
    showHatsuneMikuBanner();
    
    console.log(chalkGreen('\n🚀 Iniciando Hatsune Miku Telegram Bot...\n'));

    
    showLinkMenu();

    // Menú interactivo
    function promptUser() {
      rl.question(chalkCyan('\n  👉 Opción (1 o 2): '), (answer) => {
        answer = answer.trim();
        
        if (answer === '1') {
          console.clear();
          showHatsuneMikuBanner();
          showLinkCode();
          console.log(chalkGreen('\n  ✅ Código generado. Envíalo al bot de Telegram.'));
          console.log(chalkYellow('  ⏳ Esperando vinculación...\n'));
          showLinkMenu();
          
     
          if (global.serverQR.isServerLinked()) {
            console.log(chalkGreen('\n  ✅ ¡Sesión vinculada exitosamente!'));
            rl.close();
            menuActive = false;
            resolve(true);
            return;
          }
          
          promptUser();
          
        } else if (answer === '2') {
          console.clear();
          showHatsuneMikuBanner();
          showLinkQR();
          
     
          const sessionId = global.serverQR.serverSession?.sessionId;
          if (sessionId) {
            const qrPath = `./server_qr/server_${sessionId}.png`;
            console.log(chalkGreen(`\n  📁 QR guardado en: ${qrPath}`));
            console.log(chalkYellow('  📱 Escanea el QR con tu cámara de Telegram'));
            console.log(chalkYellow('  ⏳ Esperando vinculación...\n'));
          }
          
          showLinkMenu();
         
          if (global.serverQR.isServerLinked()) {
            console.log(chalkGreen('\n  ✅ ¡Sesión vinculada exitosamente!'));
            rl.close();
            menuActive = false;
            resolve(true);
            return;
          }
          
          promptUser();
          
        } else if (answer.toLowerCase() === 'exit' || answer.toLowerCase() === 'salir' || answer === '3') {
          console.log(chalkRed('\n  ❌ Saliendo del menú de vinculación...\n'));
          rl.close();
          menuActive = false;
          resolve(false);
        } else {
          console.log(chalkRed('\n  ⚠️  Opción inválida. Escribe 1 para CÓDIGO o 2 para QR.'));
          promptUser();
        }
      });
    }

  
    const interval = setInterval(() => {
      countdown--;
      const minutes = Math.floor(countdown / 60);
      const seconds = countdown % 60;
      
      if (countdown % 30 === 0 && menuActive) {
        console.log(chalkYellow(`\n  ⏰ Tiempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`));
      }
      
      if (global.serverQR.isServerLinked()) {
        clearInterval(interval);
        if (menuActive) {
          console.log(chalkGreen('\n  ✅ ¡Sesión vinculada exitosamente!'));
          console.log(chalkGreen(`  👤 Usuario vinculado: ${global.serverQR.getLinkedUsers()[0]}`));
          console.log(chalkGreen('  🎉 Bot listo para usar en Telegram\n'));
          rl.close();
          menuActive = false;
        }
        resolve(true);
        return;
      }
      
      if (countdown <= 0) {
        clearInterval(interval);
        if (menuActive) {
          console.log(chalkRed('\n  ❌ Tiempo de vinculación expirado'));
          console.log(chalkRed('  🔄 Reinicia el servidor para obtener un nuevo código\n'));
          rl.close();
          menuActive = false;
        }
        resolve(false);
      }
    }, 1000);


    promptUser();
  });
}

bot.launch()
  .then(async () => {
    console.log('\n' + chalkGreen('✅ Bot iniciado exitosamente!'));
    console.log(chalkGreen(`🤖 Bot: @${bot.botInfo.username}`));
    console.log(chalkGreen(`👤 Owner: ${global.owner.join(', ')}`));
    
    
    await startInteractiveLinking();
    
    console.log(chalkMagenta('\n🎉 Hatsune Miku Bot está completamente operativo!'));
  })
  .catch(err => {
    console.error(chalkRed('❌ Error al iniciar el bot:'), err);
    process.exit(1);
  });


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

}

initializeBot().catch(console.error);