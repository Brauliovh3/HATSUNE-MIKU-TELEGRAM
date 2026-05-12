export default {
  command: ['test', 'testowner'],
  category: 'owner',
  description: 'Comando de prueba para el owner',
  middlewares: ['isOwner'],
  cooldown: 0,
  async run(ctx, args) {
    const message = `✅ *Comando de owner ejecutado exitosamente!* ✅

👤 *Ejecutado por:* ${ctx.from?.firstName || ctx.from?.username || 'Owner'}
⏰ *Fecha:* ${new Date().toLocaleString()}
🎯 *Estado:* Sistema funcionando correctamente

💡 *Este comando solo puede ser usado por el owner del bot.*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
