export default {
  command: ['restart'],
  category: 'owner',
  description: 'Reiniciar el bot',
  isOwner: true,
  async run(ctx, args) {
    try {
      await ctx.reply('🔄 *REINICIANDO BOT...* 🔄\n\n⚡ Guardando base de datos...\n💾 Cerrando conexiones...\n🔄 Reiniciando sistema...\n\n🤖 El bot volverá en unos segundos...');

      
      if (global.saveDatabase) {
        global.saveDatabase();
      }

     
      setTimeout(() => {
        process.exit(0);
      }, 2000);

    } catch (error) {
      console.error('Error al reiniciar:', error);
      await ctx.reply('❌ Error al reiniciar el bot: ' + error.message);
    }
  }
};
