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
    
    await ctx.client.editMessage(ctx.chatId, {
      message: sent.id,
      text: `🏓 Pong! \`${ms}ms\``,
      parseMode: "markdown",
    });
  }
};
