export default {
  command: ['me'],
  category: 'utils',
  description: 'Ver tu información de perfil',
  middlewares: [],
  cooldown: 3,
  async run(ctx, args) {
    try {
      const sender = ctx.from || await ctx.msg.getSender();
      await ctx.reply({
        message:
          `👤 **Tu información:**\n\n` +
          `🆔 ID: \`${ctx.senderId}\`\n` +
          `👤 Nombre: ${sender?.firstName || "Desconocido"} ${sender?.lastName || ""}\n` +
          `🔖 Username: @${sender?.username || "sin username"}\n`,
        parseMode: "markdown",
      });
    } catch (error) {
      console.error("Error en comando me:", error);
      await ctx.reply({ message: "❌ Error al obtener tu información." });
    }
  }
};
