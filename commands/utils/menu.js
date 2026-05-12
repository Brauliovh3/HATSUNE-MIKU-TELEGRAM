export default {
  command: ['menu'],
  category: 'utils',
  description: 'Mostrar menú principal del bot',
  middlewares: [],
  cooldown: 3,
  async run(ctx, args) {
  
    const { menuObject, categoryAliases } = await import('../../nucleo/commands.js');
    
    const parts = ctx.text.split(" ");
    const catArg = parts[1]?.toLowerCase();

    if (catArg) {
     
      let found = null;
      for (const [cat, aliases] of Object.entries(categoryAliases)) {
        if (aliases.includes(catArg)) { 
          found = cat; 
          break; 
        }
      }
      
      if (found && menuObject[found]) {
        await ctx.reply({ message: menuObject[found] });
      } else {
        await ctx.reply({ 
          message: `❌ Categoría no encontrada.\nUsa: .menu <categoria>\nCategorías: ${Object.keys(categoryAliases).join(", ")}` 
        });
      }
    } else {
      
      const menuText = `💙 **HATSUNE MIKU USERBOT** 💙\n\n` +
        `Usa \`.menu <categoría>\` para ver comandos:\n\n` +
        Object.entries(categoryAliases)
          .map(([cat, aliases]) => `• \`.menu ${aliases[0]}\``)
          .join("\n");

      await ctx.reply({ 
        message: menuText, 
        parseMode: "markdown" 
      });
    }
  }
};
