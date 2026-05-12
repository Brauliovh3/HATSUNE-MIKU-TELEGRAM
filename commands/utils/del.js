export default {
  command: ['del'],
  category: 'utils',
  description: 'Eliminar mensajes',
  middlewares: [],
  cooldown: 1,
  async run(ctx, args) {
    try {
      if (ctx.msg.replyTo) {
        const replied = await ctx.msg.getReplyMessage();
        if (replied) await ctx.client.deleteMessages(ctx.chatId, [replied.id], { revoke: true });
      }
      await ctx.client.deleteMessages(ctx.chatId, [ctx.msg.id], { revoke: true });
    } catch (error) {
      console.error("Error en comando del:", error);
      await ctx.reply({ message: "❌ No se pudieron eliminar los mensajes." });
    }
  }
};
