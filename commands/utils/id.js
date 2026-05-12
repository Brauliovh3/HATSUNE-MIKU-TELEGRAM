export default {
  command: ['id'],
  category: 'utils',
  description: 'Ver ID del chat y usuario',
  middlewares: [],
  cooldown: 2,
  async run(ctx, args) {
    try {
      await ctx.reply({
        message: `🆔 Chat ID: \`${ctx.chatId}\`\n👤 Tu ID: \`${ctx.senderId}\``,
        parseMode: "markdown",
      });
    } catch (error) {
      console.error("Error en comando id:", error);
      await ctx.reply({ message: "❌ Error al obtener los IDs." });
    }
  }
};
