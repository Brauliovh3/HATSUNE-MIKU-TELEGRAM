import { mainMenuImage } from '../../nucleo/menuConfig.js';
import { categoryNames } from '../../nucleo/menuConfig.js';
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
        `╭──〔 **${chatSettings.namebot || 'MIKU'}** 〕──╮\n` +
        `┃ 👤 **User:** ${userName}\n` +
        `┃ ⌨️ **Prefix:** \`${prefix}\`\n` +
        `┃ 👑 **Owner:** ${chatSettings.owner}\n` +
        `┃ ⏰ **Hora:** ${time}\n` +
        `╰──────────────╯\n\n`;

     
      const categories = {};
      global.commands.forEach((cmd, name) => {
        const mainCmd = Array.isArray(cmd.command) ? cmd.command[0].toLowerCase() : cmd.command.toLowerCase();
        if (name !== mainCmd) return; 
        
        const cat = cmd.category || 'otros';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      });

      
      let menuBody = "✨ **LISTA DE COMANDOS** ✨\n\n";
      for (const [catId, catDisplayName] of Object.entries(categoryNames)) {
        const cmds = categories[catId];
        if (!cmds || cmds.length === 0) continue;
        
        menuBody += `┌──『 **${catDisplayName}** 』\n`;
        cmds.sort().forEach(c => {
          menuBody += `│ 💙 ${prefix}${c}\n`;
        });
        menuBody += `└──────────╼\n\n`;
      }

     
      await ctx.replyWithPhoto(mainMenuImage, {
        parseMode: 'markdown'
      });

      
      await ctx.reply(menuHeader + menuBody, { parseMode: 'markdown' });

      if (ctx.react) await ctx.react('💙');

    } catch (error) {
      console.error('Error en comando menu:', error);
      await ctx.reply('❌ **Error al cargar el menú principal.**');
    }
  }
};