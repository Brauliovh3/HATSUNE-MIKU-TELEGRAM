export default {
  command: ['kick'],
  category: 'grupo',
  description: 'Eliminar usuario del grupo',
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

    let targetUser = null;
    let targetName = '';

  
    if (ctx.message.reply_to_message) {
      targetUser = ctx.message.reply_to_message.from;
      targetName = targetUser.first_name || targetUser.username || 'Usuario';
    } else if (args.length > 0) {
  
      const entities = ctx.message.entities;
      if (entities && entities[0]?.type === 'mention') {
        const username = args[0].replace('@', '');
       
        return ctx.reply('❌ Por favor responde al mensaje del usuario que quieres eliminar o usa @username');
      } else {
        return ctx.reply('❌ Por favor responde al mensaje del usuario que quieres eliminar');
      }
    } else {
      return ctx.reply('❌ Debes responder al mensaje del usuario que quieres eliminar');
    }

    
    if (targetUser.id === ctx.chat.owner_user?.id) {
      return ctx.reply('❌ No puedes expulsar al creador del grupo');
    }

    
    if (member.status !== 'creator') {
      const targetMember = await ctx.getChatMember(targetUser.id);
      if (['creator', 'administrator'].includes(targetMember.status)) {
        return ctx.reply('❌ No puedes expulsar a otros administradores');
      }
    }

    try {
      await ctx.banChatMember(targetUser.id);
      
      const message = `🦵 *USUARIO ELIMINADO* 🦵

👤 *Usuario:* ${targetName}
🚫 *Acción:* Expulsado del grupo
👮 *Administrador:* ${ctx.from.first_name}

💡 *El usuario ha sido eliminado del grupo*
📝 *Puede volver a ser agregado manualmente si es necesario`;

      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Error al kick usuario:', error);
      await ctx.reply('❌ No se pudo eliminar al usuario. Es posible que el bot no tenga los permisos necesarios.');
    }
  }
};
