export default {
  command: ['me'],
  category: 'utils',
  description: 'Ver tu información de perfil',
  middlewares: [],
  cooldown: 3,
  async run(ctx, args) {
    await ctx.reply({
      message:
        `👤 **Tu información:**\n\n` +
        `🆔 ID: \`${ctx.me.id}\`\n` +
        `👤 Nombre: ${ctx.me.firstName} ${ctx.me.lastName || ""}\n` +
        `🔖 Username: @${ctx.me.username || "sin username"}\n` +
        `📱 Teléfono: +${ctx.me.phone}`,
      parseMode: "markdown",
    });
  }
};
