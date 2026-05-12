export default {
  command: ['del'],
  category: 'utils',
  description: 'Eliminar mensajes',
  middlewares: [],
  cooldown: 1,
  async run(ctx, args) {
    if (ctx.msg.replyTo) {
      const replied = await ctx.msg.getReplyMessage();
      if (replied) await replied.delete({ revoke: true });
    }
    await ctx.msg.delete({ revoke: true });
  }
};
