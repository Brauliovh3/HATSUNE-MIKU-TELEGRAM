import serverQR from '../../nucleo/system/serverQR.js';

export default {
  command: ['scanserver', 'vincularserver'],
  category: 'utils',
  description: 'Escanear código QR del servidor para vincular',
  async run(ctx, args) {
    const sessionId = args[0];
    const telegramUserId = ctx.from.id.toString();
    const userInfo = {
      name: ctx.from.first_name || 'Usuario',
      username: ctx.from.username || 'sin_username',
      id: telegramUserId
    };

    if (!sessionId) {
      // Verificar si el servidor ya está vinculado
      if (serverQR.isServerLinked()) {
        const status = serverQR.getServerStatus();
        return ctx.reply(`✅ *SERVIDOR YA VINCULADO*\n\n` +
          `🤖 *Bot:* Hatsune Miku Bot\n` +
          `📱 *Usuarios vinculados:* ${status.linkedUsers}\n` +
          `🆔 *Sesión:* ${status.sessionId}\n` +
          `📅 *Desde:* ${new Date(status.createdAt).toLocaleString()}\n\n` +
          `💡 *El servidor está operativo y vinculado*`);
      }

      return ctx.reply(`🖥️ *VINCULAR SERVIDOR*\n\n` +
        `💡 *Uso:* /scanserver <código_de_sesión>\n` +
        `📝 *Ejemplo:* /scanserver ABC123DEF456\n\n` +
        `🔗 *El código aparece en la consola del servidor*\n` +
        `📱 *O escanea el QR generado al iniciar*`);
    }

    try {
      // Escanear QR del servidor
      const result = serverQR.scanServerQR(sessionId, telegramUserId, userInfo);

      if (!result.success) {
        return ctx.reply(`❌ *ERROR AL VINCULAR SERVIDOR*\n\n` +
          `🔴 ${result.error}\n\n` +
          `💡 *Verifica que el servidor esté en ejecución*\n` +
          `📱 *O solicita un nuevo código al administrador*`);
      }

      // Vinculación exitosa
      const status = serverQR.getServerStatus();
      
      await ctx.reply(`🎉 *¡SERVIDOR VINCULADO!* 🎉\n\n` +
        `🤖 *Bot:* Hatsune Miku Bot\n` +
        `🖥️ *Servidor:* ${result.serverInfo.serverName}\n` +
        `📱 *Teléfono:* +51953073477\n` +
        `👤 *Usuario:* ${userInfo.name} (@${userInfo.username})\n` +
        `🆔 *Sesión:* ${sessionId}\n` +
        `📅 *Fecha:* ${new Date().toLocaleString()}\n\n` +
        `✨ *Ahora tienes acceso completo al servidor!*\n` +
        `💡 Usa /menu para ver todos los comandos\n` +
        `🔧 *El servidor está listo para recibir comandos*`);

      // Enviar mensaje de bienvenida al servidor
      console.log(`\n✅ USUARIO VINCULADO AL SERVIDOR`);
      console.log(`👤 Usuario: ${userInfo.name} (@${userInfo.username})`);
      console.log(`🆔 ID: ${telegramUserId}`);
      console.log(`🆔 Sesión: ${sessionId}`);
      console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
      console.log(`🔗 Total usuarios vinculados: ${status.linkedUsers}`);
      console.log(`\n🤖 El servidor está listo para operar con Telegram\n`);

    } catch (error) {
      console.error('Error en scanserver:', error);
      await ctx.reply('❌ Error al procesar el código. Intenta nuevamente.');
    }
  }
};
