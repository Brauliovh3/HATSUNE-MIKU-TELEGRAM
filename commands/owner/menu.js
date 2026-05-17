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
      const userName = ctx.from?.firstName || 'Usuario';
      const time = new Date().toLocaleTimeString();

      
      const menuHeader = 
        `┌───「 💙 **${chatSettings.namebot || 'HATSUNE MIKU'}** 💙 」───┐\n` +
        `│\n` +
        `│ 👤 **Hola:** ${userName}\n` +
        `│ ⌨️ **Prefijo:** [ \`${prefix}\` ]\n` +
        `│ 👑 **Owner:** ${chatSettings.owner || '(ㅎㅊDEPOOLㅊㅎ)'}\n` +
        `│ 📢 **Canal:** Click Aquí\n` +
        `│ ⏰ **Hora:** ${time}\n` +
        `│\n` +
        `└───────────────────────────┘\n\n` +
        `✨ _¡Hola! Soy Hatsune Miku, tu asistente de Telegram. Aquí tienes mis comandos disponibles:_`;

     
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
      await ctx.reply('❌ **Error al cargar el menú principal.**');
    }
  }
};