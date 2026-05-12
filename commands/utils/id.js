export default {
  command: ['id'],
  category: 'utils',
  description: 'Ver ID del chat y usuario',
  middlewares: [],
  cooldown: 2,
  async run(ctx, args) {
    await ctx.reply({
      message: `🆔 Chat ID: \`${ctx.chatId}\`\n👤 Tu ID: \`${ctx.senderId}\``,
      parseMode: "markdown",
    });
  }
};
