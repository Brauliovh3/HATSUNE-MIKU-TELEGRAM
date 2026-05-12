export default {
  command: ['warn'],
  category: 'grupo',
  description: 'Advertir a un usuario',
  isAdmin: true,
  async run(ctx, args) {
    if (!ctx.message.chat.type.includes('group')) {
      return ctx.reply('❌ Este comando solo puede ser usado en grupos.');
    }

    const chatId = ctx.chat.id.toString();
    const chat = global.db.data.chats[chatId] || {};
    
    if (!chat.users) chat.users = {};
    if (!chat.warns) chat.warns = {};

    
    const member = await ctx.getChatMember(ctx.from.id);
    if (!['creator', 'administrator'].includes(member.status)) {
      return ctx.reply('❌ Solo los administradores pueden usar este comando.');
    }

    let targetUser = null;
    let targetName = '';
    let reason = '';

    
    if (ctx.message.reply_to_message) {
      targetUser = ctx.message.reply_to_message.from;
      targetName = targetUser.first_name || targetUser.username || 'Usuario';
      reason = args.join(' ') || 'Sin razón especificada';
    } else {
      return ctx.reply('❌ Debes responder al mensaje del usuario que quieres advertir');
    }

    
    if (targetUser.id === ctx.chat.owner_user?.id) {
      return ctx.reply('❌ No puedes advertir al creador del grupo');
    }

    
    if (member.status !== 'creator') {
      const targetMember = await ctx.getChatMember(targetUser.id);
      if (['creator', 'administrator'].includes(targetMember.status)) {
        return ctx.reply('❌ No puedes advertir a otros administradores');
      }
    }

    
    if (!chat.warns[targetUser.id]) {
      chat.warns[targetUser.id] = { count: 0, reasons: [] };
    }

    const userWarns = chat.warns[targetUser.id];
    userWarns.count++;
    userWarns.reasons.push({
      reason: reason,
      date: new Date().toISOString(),
      admin: ctx.from.first_name
    });

    const warnLimit = chat.warnLimit || 3;
    const remaining = warnLimit - userWarns.count;

    let message = `⚠️ *USUARIO ADVERTIDO* ⚠️

👤 *Usuario:* ${targetName}
⚠️ *Advertencia #${userWarns.count} de ${warnLimit}
📝 *Razón:* ${reason}
👮 *Administrador:* ${ctx.from.first_name}
📅 *Fecha:* ${new Date().toLocaleDateString('es-ES')}`;

    if (remaining > 0) {
      message += `\n\n⚠️ *Advertencias restantes:* ${remaining}`;
    }

    if (userWarns.count >= warnLimit) {
      // Banear automáticamente
      try {
        await ctx.banChatMember(targetUser.id);
        message += `\n\n🚫 *USUARIO BANEADO AUTOMÁTICAMENTE*\n📊 Alcanzó el límite de ${warnLimit} advertencias`;
      } catch (error) {
        console.error('Error al banear usuario:', error);
        message += `\n\n❌ *No se pudo banear automáticamente*`;
      }
    } else {
      message += `\n\n💡 *Consejo:* Al alcanzar ${warnLimit} advertencias será baneado automáticamente`;
    }

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });

    // Enviar mensaje privado al usuario si fue baneado
    if (userWarns.count >= warnLimit) {
      try {
        await ctx.telegram.sendMessage(targetUser.id, `🚫 *HAS SIDO BANEADO* 🚫\n\n📝 *Razón:* Alcanzaste ${warnLimit} advertencias en el grupo\n👮 *Administrador:* ${ctx.from.first_name}\n\n💬 Si crees que es un error, contacta a un administrador del grupo.`);
      } catch (error) {
        // El usuario puede tener desactivados los mensajes privados
      }
    }
  }
};
