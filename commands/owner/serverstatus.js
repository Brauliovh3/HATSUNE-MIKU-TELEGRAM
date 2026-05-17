import serverQR from '../../nucleo/system/serverQR.js';
import settings from '../../settings.js';

export default {
  command: ['serverstatus', 'statusserver', 'estadoservidor'],
  category: 'owner',
  description: 'Ver estado del servidor y vinculaciones',
  isOwner: true,
  async run(ctx, args) {
    try {
      const status = serverQR.getServerStatus();
      
      let message = `🖥️ *ESTADO DEL SERVIDOR* 🖥️\n\n`;
      
      if (status.hasSession) {
        message += `📊 *Estado:* ✅ Activo\n`;
        message += `🆔 *Sesión:* ${status.sessionId}\n`;
        message += `📅 *Creado:* ${new Date(status.createdAt).toLocaleString()}\n`;
        
        if (status.expiresAt) {
          const timeLeft = Math.ceil((status.expiresAt - Date.now()) / 1000);
          message += `⏰ *Expira en:* ${timeLeft} segundos\n`;
        }
        
        message += `🔗 *Vinculado:* ${status.isLinked ? '✅ Sí' : '❌ No'}\n`;
        message += `👥 *Usuarios vinculados:* ${status.linkedUsers}\n`;
      } else {
        message += `📊 *Estado:* ❌ Inactivo\n`;
        message += `🔗 *Sin sesión activa*\n`;
        message += `👥 *Usuarios vinculados:* 0\n`;
      }

      message += `\n🤖 *Bot:* Hatsune Miku Bot`;
      message += `\n📱 *Teléfono:* +51953073477`;
      message += `\n🌐 *Servidor:* ${process.env.SERVER_IP || 'localhost'}`;
      message += `\n🔌 *Puerto:* ${process.env.PORT || 3000}`;

      if (status.linkedUsers > 0) {
        message += `\n\n👥 *USUARIOS VINCULADOS:*\n`;
        const linkedUsers = serverQR.getLinkedUsers();
        linkedUsers.forEach((userId, index) => {
          message += `${index + 1}. ID: ${userId}\n`;
        });
      }

      await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error en serverstatus:', error);
      await ctx.reply('❌ Error al obtener estado del servidor.');
    }
  }
};
