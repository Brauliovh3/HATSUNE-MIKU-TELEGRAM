import defaultSettings from '../../settings.js';

export default {
  command: ['settings', 'config', 'configuracion'],
  category: 'owner',
  description: 'Gestionar configuraciones globales y del chat (Nombre, Canal, Moneda, etc.)',
  isOwner: true,
  async run(ctx, args) {
    const chatId = ctx.chatId.toString();
    
   
    if (!global.db.data.settings[chatId]) {
      global.db.data.settings[chatId] = {
        namebot: defaultSettings.namebot,
        link: defaultSettings.link,
        owner: defaultSettings.owner,
        ownerId: defaultSettings.ownerId,
        currency: defaultSettings.currency,
        prefix: defaultSettings.prefix,
        audios: defaultSettings.audios
      };
    }

    const settings = global.db.data.settings[chatId];

    if (args.length === 0) {
      let message = `⚙️ **AJUSTES DE HATSUNE MIKU** ⚙️\n\n`;
      message += `🤖 **Nombre Bot:** ${settings.namebot}\n`;
      message += `📢 **Canal:** ${settings.link}\n`;
      message += `👑 **Owner Name:** ${settings.owner}\n`;
      message += `💰 **Moneda:** ${settings.currency}\n`;
      message += `🔊 **Audios:** ${settings.audios ? '✅' : '❌'}\n`;
      message += `⌨️ **Prefijo:** \`${settings.prefix.join(' ')}\`\n\n`;
      message += `💡 **Uso:** \`.settings <clave> <valor>\`\n`;
      message += `📌 **Claves:** \`nombre, canal, owner, moneda, audios, prefijo\``;

      return ctx.reply(message, { parseMode: 'markdown' });
    }

    const key = args[0].toLowerCase();
    const value = args.slice(1).join(' ');

    if (!value && key !== 'audios') {
      return ctx.reply(`❌ **Proporciona un valor.**\nEjemplo: \`.settings nombre Miku Bot\``);
    }

    const keys = {
      'nombre': () => { settings.namebot = value; settings.botname = value; },
      'canal': () => settings.link = value,
      'owner': () => settings.owner = value,
      'moneda': () => settings.currency = value,
      'audios': () => settings.audios = !settings.audios,
      'prefijo': () => settings.prefix = [value]
    };

    if (!keys[key]) {
      return ctx.reply(`❌ **Clave inválida.** Claves: \`nombre, canal, owner, moneda, audios, prefijo\``);
    }

    keyskey;
    if (global.saveDatabase) global.saveDatabase();
    if (ctx.react) await ctx.react('✅');

    return ctx.reply(`✅ **Configuración actualizada:** \`${key}\` ahora es \`${value || (settings.audios ? 'Activado' : 'Desactivado')}\``, { parseMode: 'markdown' });
  }
};
