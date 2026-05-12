export default {
  command: ['antilink'],
  category: 'grupo',
  description: 'Activar/desactivar anti-enlaces',
  isAdmin: true,
  async run(ctx, args) {
    if (!ctx.message.chat.type.includes('group')) {
      return ctx.reply('❌ Este comando solo puede ser usado en grupos.');
    }

    const chatId = ctx.chat.id.toString();
    const chat = global.db.data.chats[chatId] || {};
    
    if (!chat.users) chat.users = {};

    
    const member = await ctx.getChatMember(ctx.from.id);
    if (!['creator', 'administrator'].includes(member.status)) {
      return ctx.reply('❌ Solo los administradores pueden usar este comando.');
    }

    const action = args[0]?.toLowerCase();
    
    if (!action) {
      const currentStatus = chat.antilinks ? '✅ Activado' : '❌ Desactivado';
      return ctx.reply(`🔗 *ANTI-ENLACES* 🔗\n\n📊 *Estado actual:* ${currentStatus}\n\n💡 *Para configurar:* /antilink on/off\n\n⚠️ *Cuando está activado:*\n• Se eliminarán mensajes con enlaces\n• Se advertirá al usuario\n• Se puede banear tras múltiples advertencias`);
    }

    if (action === 'on') {
      chat.antilinks = true;
      const message = `🔗 *ANTI-ENLACES ACTIVADO* 🔗

✅ *Se eliminarán automáticamente los enlaces*
⚠️ *Los usuarios serán advertidos*
🚫 *Enlaces detectados:* youtube.com, t.me, instagram.com, twitter.com, facebook.com, etc.

💡 *Para desactivar:* /antilink off`;
      
      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });
      
    } else if (action === 'off') {
      chat.antilinks = false;
      const message = `🔗 *ANTI-ENLACES DESACTIVADO* 🔗

❌ *Ya no se eliminarán los enlaces*
✅ *Los usuarios pueden compartir enlaces libremente*

💡 *Para activar:* /antilink on`;
      
      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });
      
    } else {
      await ctx.reply('❌ Opción no válida. Usa: /antilink on o /antilink off');
    }
  }
};
