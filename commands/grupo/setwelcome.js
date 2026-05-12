export default {
  command: ['setwelcome'],
  category: 'grupo',
  description: 'Establecer mensaje de bienvenida',
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

    const welcomeText = args.join(' ');
    
    if (!welcomeText) {
      const currentWelcome = chat.sWelcome || 'No configurado';
      return ctx.reply(`📝 *MENSAJE DE BIENVENIDA ACTUAL*\n\n${currentWelcome}\n\n💡 *Para configurar:* /setwelcome <mensaje>\n📝 *Variables disponibles:* {user}, {group}, {date}`);
    }

   
    const variables = {
      '{user}': ctx.from.first_name || 'Usuario',
      '{group}': ctx.chat.title || 'Grupo',
      '{date}': new Date().toLocaleDateString('es-ES')
    };

   
    chat.sWelcome = welcomeText;
    chat.welcome = true;

    const previewMessage = welcomeText.replace(/{user}|{group}|{date}/g, match => variables[match] || match);

    const message = `✅ *MENSAJE DE BIENVENIDA CONFIGURADO* ✅

📝 *Mensaje:* ${welcomeText}
👀 *Vista previa:*
${previewMessage}

💡 *Variables disponibles:*
• {user} - Nombre del usuario
• {group} - Nombre del grupo
• {date} - Fecha actual

🔔 *Bienvenida activada en este grupo*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
