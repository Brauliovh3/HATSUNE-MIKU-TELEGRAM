import { mainMenuImage } from '../../nucleo/menuConfig.js';
import { bodyMenu } from '../../nucleo/commands.js';
import settings from '../../settings.js';

export default {
  command: ['menu', 'help', 'ayuda'],
  category: 'main',
  description: 'Muestra el menú principal de Hatsune Miku',
  async run(ctx, args) {
    try {
      const chatId = ctx.chatId.toString();
      const chatSettings = global.db.data?.settings?.[chatId] || settings;
      const prefix = chatSettings.prefix?.[0] || '.';

      const menuHeader = `💙 **${chatSettings.namebot || 'HATSUNE MIKU'}** 💙\n\n` +
        `👤 **Usuario:** ${ctx.from?.firstName || 'Usuario'}\n` +
        `⌨️ **Prefijo:** [ \`${prefix}\` ]\n` +
        `👑 **Owner:** ${chatSettings.owner || '(ㅎㅊDEPOOLㅊㅎ)'}\n` +
        `📢 **Canal:** ${chatSettings.link || 'https://t.me/BVH3INDUSTRIES'}\n\n` +
        `✨ _Abajo tienes la lista de comandos disponibles:_`;

      
      const formattedBody = bodyMenu.split('\n').map(line => {
        if (line.includes(' .')) return line.replace(' .', ` ${prefix}`);
        return line;
      }).join('\n');

      await ctx.replyWithPhoto(mainMenuImage, {
        caption: menuHeader + '\n\n' + formattedBody,
        parseMode: 'markdown'
      });

      if (ctx.react) await ctx.react('💙');
    } catch (error) {
      console.error('Error en comando menu:', error);
      await ctx.reply('❌ Error al cargar el menú principal.');
    }
  }
};