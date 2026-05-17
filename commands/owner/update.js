import { execSync } from 'child_process';

export default {
  command: ['update', 'actualizar'],
  category: 'owner',
  description: 'Actualiza el bot desde el repositorio de GitHub y reinicia el servidor',
  isOwner: true,
  async run(ctx, args) {
    try {
     
      if (ctx.react) await ctx.react('⏳');
      
      await ctx.reply('🔄 **Buscando actualizaciones en el repositorio remoto...**');

      
      const stdout = execSync('git pull').toString();
      
      await ctx.reply(`📝 **Resultado de Git:**\n\n\`\`\`\n${stdout}\n\`\`\``, { parseMode: 'markdown' });

      
      if (stdout.includes('Already up to date')) {
        if (ctx.react) await ctx.react('✅');
        return ctx.reply('✨ **El bot ya se encuentra en la versión más reciente.**');
      }

      await ctx.reply('🚀 **Cambios detectados y descargados. Reiniciando el servidor para aplicar las actualizaciones...**');
      
      
      if (global.saveDatabase) {
        global.saveDatabase();
      }

      if (ctx.react) await ctx.react('🔄');

      
      setTimeout(() => {
        process.exit(0);
      }, 3000);

    } catch (error) {
      console.error('Error en comando update:', error);
      if (ctx.react) await ctx.react('❌');
      await ctx.reply(`❌ **Error técnico durante la actualización:**\n\n\`${error.message}\``);
    }
  }
};