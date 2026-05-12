export default {
  command: ['ping'],
  category: 'utils',
  description: 'Verificar velocidad del bot',
  middlewares: [],
  cooldown: 2,
  async run(ctx, args) {
    const start = Date.now();
    const sent = await ctx.reply({ message: "🏓 calculando..." });
    const ms = Date.now() - start;
    
    try {
      await ctx.client.editMessage(ctx.chatId, {
        id: sent.id,
        message: `🏓 Pong! \`${ms}ms\``,
        parseMode: "markdown",
      });
    } catch (error) {
      
      await ctx.reply({ message: `🏓 Pong! \`${ms}ms\``, parseMode: "markdown" });
    }
  }
};
